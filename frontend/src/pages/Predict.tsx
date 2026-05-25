import { useState } from 'react';
import { predict } from '../api/client';
import { Brain, AlertCircle, CheckCircle } from 'lucide-react';

const FOOD_ITEMS = [
  "Plov", "Shashlik", "Lagman", "Samsa", "Manti",
  "Caesar Salad", "Grilled Chicken", "Pasta Carbonara",
  "Burger & Fries", "Sushi Set", "Tom Yum Soup",
  "Margherita Pizza", "Fish and Chips", "Beef Steak",
  "Vegetable Stir Fry", "Chicken Tikka", "Lamb Kebab",
  "Seafood Paella", "Mushroom Risotto", "Thai Green Curry"
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Predict() {
  const [formData, setFormData] = useState({
    food_item: 'Plov',
    meals_served: 150,
    temp_c: 25,
    is_holiday: 0,
    day_of_week: 'Monday',
    checkout_price: 35000,
    base_price: 28000,
    emailer_for_promotion: 0,
    homepage_featured: 0,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await predict(formData);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Brain className="text-emerald-500" />
          AI Waste Prediction
        </h1>
        <p className="text-gray-500 mt-1">Enter restaurant conditions to predict food waste</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Input Features</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Item</label>
              <select 
                value={formData.food_item}
                onChange={e => setFormData({...formData, food_item: e.target.value})}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {FOOD_ITEMS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meals Served</label>
                <input
                  type="number"
                  value={formData.meals_served}
                  onChange={e => setFormData({...formData, meals_served: +e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  value={formData.temp_c}
                  onChange={e => setFormData({...formData, temp_c: +e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select 
                value={formData.day_of_week}
                onChange={e => setFormData({...formData, day_of_week: e.target.value})}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checkout Price</label>
                <input
                  type="number"
                  value={formData.checkout_price}
                  onChange={e => setFormData({...formData, checkout_price: +e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                <input
                  type="number"
                  value={formData.base_price}
                  onChange={e => setFormData({...formData, base_price: +e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_holiday === 1}
                  onChange={e => setFormData({...formData, is_holiday: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm">Holiday</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailer_for_promotion === 1}
                  onChange={e => setFormData({...formData, emailer_for_promotion: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm">Email Promotion</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.homepage_featured === 1}
                  onChange={e => setFormData({...formData, homepage_featured: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Brain size={18} />
              )}
              {loading ? 'Predicting...' : 'Predict Waste'}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Prediction Result</h3>
          
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {result && !error && (
            <div className="space-y-6">
              <div className="text-center p-6 bg-emerald-50 rounded-xl">
                <p className="text-sm text-emerald-600 font-medium">Predicted Food Waste</p>
                <p className="text-5xl font-bold text-emerald-700 mt-2">
                  {result.predicted_waste_kg} <span className="text-2xl">kg</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Model: {result.model}
                </p>
              </div>

              {result.baseline_prediction_kg && (
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Baseline (Linear Regression)</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {result.baseline_prediction_kg} <span className="text-xl">kg</span>
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle size={16} />
                Prediction confidence: {result.confidence}
              </div>

              <div className="text-xs text-gray-400">
                Timestamp: {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="text-center text-gray-400 py-12">
              <Brain size={48} className="mx-auto mb-4 opacity-30" />
              <p>Enter values and click "Predict" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
