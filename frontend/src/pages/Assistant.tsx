import { useState } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { askGemini } from '../api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm SmartKitchen AI assistant. I can help you with:\n\n🍳 Recipe suggestions\n🥗 Food waste reduction tips\n📦 Storage advice\n📋 Meal planning\n\nWhat would you like to know?",
      source: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.source !== 'system')
        .map(m => ({ role: m.role, content: m.content }));
      const res = await askGemini(userMessage, history);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        source: res.data.source
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        source: 'error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK_QUESTIONS = [
    "How to reduce food waste at home?",
    "What can I make with leftover rice?",
    "Best way to store fresh vegetables?",
    "Tips for meal planning",
  ];

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageCircle className="text-emerald-500" />
          AI Cooking Assistant
        </h1>
        <p className="text-gray-500 mt-1">
          Powered by Gemini AI — ask about recipes, storage, and waste reduction
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-100 p-4 space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-emerald-600" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              {msg.source && msg.role === 'assistant' && (
                <p className="text-xs mt-2 text-gray-400">
                  {msg.source === 'gemini' ? '🤖 Gemini AI' : msg.source === 'fallback' ? '💡 Rule-based' : ''}
                </p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-blue-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Bot size={16} className="text-emerald-600" />
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => { setInput(q); }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-sm transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about recipes, food storage, waste reduction..."
          className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="btn-primary flex items-center gap-1 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Note */}
      <p className="text-xs text-center text-gray-400 mt-2">
        Set GEMINI_API_KEY for AI-powered responses. Currently using rule-based fallback.
      </p>
    </div>
  );
}
