import { Link } from 'react-router-dom';
import { BarChart3, ChefHat, Brain, Leaf } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Hero */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <span className="text-6xl">🍽️</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          SmartKitchen <span className="text-emerald-400">AI</span>
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
          Cook smarter. Predict waste. Cut costs. AI-powered food waste reduction 
          platform for restaurants and households.
        </p>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/business"
            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105"
          >
            <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Business Mode</h2>
            <p className="text-white/60">
              Analytics dashboards, AI predictions, waste forecasting, 
              CSV data upload, model comparison.
            </p>
            <span className="inline-block mt-4 text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
              Enter Dashboard →
            </span>
          </Link>

          <Link
            to="/personal"
            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105"
          >
            <ChefHat className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Personal Mode</h2>
            <p className="text-white/60">
              Smart recipe suggestions based on your ingredients, 
              AI cooking assistant, waste reduction tips.
            </p>
            <span className="inline-block mt-4 text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
              Find Recipes →
            </span>
          </Link>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-16">
          {[
            { icon: Brain, text: 'Machine Learning' },
            { icon: BarChart3, text: 'Real-time Analytics' },
            { icon: Leaf, text: 'Waste Reduction' },
            { icon: ChefHat, text: 'Recipe AI' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full text-white/70 text-sm">
              <badge.icon size={16} />
              {badge.text}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-white/40 text-sm">
        <p>SmartKitchen AI — BTEC Unit 21: Introduction to Artificial Intelligence</p>
        <p className="mt-1">Built with React, Flask, Scikit-learn, and Gemini AI</p>
      </div>
    </div>
  );
}
