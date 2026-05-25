import { useState } from 'react';
import { ChefHat, Plus, X, Search, Clock, Users } from 'lucide-react';
import { getRecipes } from '../api/client';

export default function Recipes() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const addIngredient = () => {
    const val = inputValue.trim().toLowerCase();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
      setInputValue('');
    }
  };

  const removeIngredient = (item: string) => {
    setIngredients(ingredients.filter(i => i !== item));
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await getRecipes(ingredients);
      setRecipes(res.data.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const SUGGESTIONS = ['chicken', 'rice', 'tomato', 'egg', 'onion', 'garlic', 'pasta', 'potato', 'beef', 'cheese'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ChefHat className="text-emerald-500" />
          Smart Recipe Finder
        </h1>
        <p className="text-gray-500 mt-1">
          Enter ingredients you have at home — AI will suggest recipes to reduce waste
        </p>
      </div>

      {/* Input Section */}
      <div className="card">
        <h3 className="font-semibold mb-4">What ingredients do you have?</h3>
        
        {/* Input field */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type an ingredient and press Enter..."
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button onClick={addIngredient} className="btn-primary flex items-center gap-1">
            <Plus size={18} /> Add
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.filter(s => !ingredients.includes(s)).map(s => (
              <button
                key={s}
                onClick={() => setIngredients([...ingredients, s])}
                className="px-3 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full text-sm transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Selected ingredients */}
        {ingredients.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Your ingredients ({ingredients.length}):</p>
            <div className="flex flex-wrap gap-2">
              {ingredients.map(ing => (
                <span key={ing} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {ing}
                  <button onClick={() => removeIngredient(ing)} className="hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={ingredients.length === 0 || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={18} />
          {loading ? 'Searching...' : 'Find Recipes'}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <h3 className="font-semibold text-lg mb-4">
            {recipes.length > 0 ? `🎉 Found ${recipes.length} recipes` : '😔 No matching recipes'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow border-l-4 border-emerald-500">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-lg">{recipe.name}</h4>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">
                    {Math.round(recipe.match_score * 100)}% match
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-3">{recipe.cuisine} cuisine</p>
                
                <div className="flex gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {recipe.prep_time} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {recipe.matched_ingredients}/{recipe.total_ingredients} ingredients
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{recipe.instructions}</p>

                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.map((ing: string, j: number) => (
                    <span
                      key={j}
                      className={`px-2 py-0.5 rounded text-xs ${
                        ingredients.some(ui => ing.toLowerCase().includes(ui))
                          ? 'bg-emerald-100 text-emerald-700 font-medium'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      {!searched && (
        <div className="card bg-emerald-50 border-emerald-100">
          <h3 className="font-semibold text-emerald-900 mb-2">🧠 How it works</h3>
          <ol className="text-sm text-emerald-800 space-y-1 list-decimal list-inside">
            <li>Enter ingredients you already have at home</li>
            <li>Our rule-based AI matches them against 45+ recipes</li>
            <li>Recipes are ranked by ingredient overlap score</li>
            <li>Cook what you have — reduce food waste!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
