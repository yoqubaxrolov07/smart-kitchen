import { useState } from 'react';
import { Play, Clock, ChefHat } from 'lucide-react';

interface Tutorial {
  id: number;
  title: string;
  youtubeId: string;
  description: string;
  recipe: string;
  duration: string;
  cuisine: string;
}

const TUTORIALS: Tutorial[] = [
  {
    id: 1,
    title: "Classic Uzbek Plov",
    youtubeId: "dQw4w9WgXcQ",
    description: "Learn how to make authentic Uzbek plov with lamb, carrots, and rice. Perfect portions reduce food waste.",
    recipe: "Ingredients: 500g lamb, 500g rice, 3 carrots, 2 onions, garlic, cumin, oil, salt. Cook for 90 minutes over medium heat.",
    duration: "12 min",
    cuisine: "Uzbek"
  },
  {
    id: 2,
    title: "Zero-Waste Vegetable Stir Fry",
    youtubeId: "dQw4w9WgXcQ",
    description: "Use leftover vegetables to create a delicious stir fry. Great way to reduce kitchen waste!",
    recipe: "Ingredients: Any leftover vegetables, soy sauce, garlic, ginger, sesame oil, rice. Stir fry on high heat for 5 minutes.",
    duration: "8 min",
    cuisine: "Asian"
  },
  {
    id: 3,
    title: "Food Waste Reduction Tips for Restaurants",
    youtubeId: "dQw4w9WgXcQ",
    description: "Professional tips on how restaurants can reduce food waste by up to 30% using smart planning.",
    recipe: "Key tips: FIFO method, portion control, demand forecasting, staff training, composting program.",
    duration: "15 min",
    cuisine: "Educational"
  },
  {
    id: 4,
    title: "Leftover Rice Fried Rice",
    youtubeId: "dQw4w9WgXcQ",
    description: "Turn yesterday's rice into today's delicious meal. Day-old rice makes the best fried rice!",
    recipe: "Ingredients: Day-old rice, 2 eggs, soy sauce, green onions, vegetables, oil. Use high heat wok.",
    duration: "10 min",
    cuisine: "Asian"
  },
  {
    id: 5,
    title: "Smart Meal Prep — Cook Once, Eat All Week",
    youtubeId: "dQw4w9WgXcQ",
    description: "Batch cooking strategies that save time, money, and reduce food waste significantly.",
    recipe: "Plan 5 meals, prep base ingredients (grains, proteins, sauces), store in portions, freeze extras.",
    duration: "20 min",
    cuisine: "Educational"
  },
  {
    id: 6,
    title: "Homemade Lagman Noodle Soup",
    youtubeId: "dQw4w9WgXcQ",
    description: "Traditional hand-pulled noodle soup from Central Asia. Use all vegetable parts — stems included!",
    recipe: "Ingredients: Flour, beef, tomatoes, bell peppers, onion, garlic, oil, spices. Hand-pull noodles for authentic texture.",
    duration: "25 min",
    cuisine: "Uzbek"
  },
];

export default function Tutorials() {
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const cuisines = ['All', ...new Set(TUTORIALS.map(t => t.cuisine))];
  const filtered = filter === 'All' ? TUTORIALS : TUTORIALS.filter(t => t.cuisine === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Play className="text-red-500" />
          Cooking Tutorials
        </h1>
        <p className="text-gray-500 mt-1">
          Step-by-step video guides — learn to cook smart and reduce food waste
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {cuisines.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === c
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Selected Video Player */}
      {selectedVideo && (
        <div className="card bg-gray-900 text-white p-0 overflow-hidden">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
              title={selectedVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold">{selectedVideo.title}</h3>
            <p className="text-white/70 mt-2">{selectedVideo.description}</p>
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <p className="text-sm font-medium text-emerald-400 mb-1">📝 Recipe:</p>
              <p className="text-sm text-white/80">{selectedVideo.recipe}</p>
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mt-4 text-sm text-white/60 hover:text-white"
            >
              ✕ Close player
            </button>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(tutorial => (
          <div
            key={tutorial.id}
            className="card hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setSelectedVideo(tutorial)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={`https://img.youtube.com/vi/${tutorial.youtubeId}/mqdefault.jpg`}
                alt={tutorial.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                  <Play size={24} className="text-white ml-1" fill="white" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                {tutorial.duration}
              </span>
            </div>

            {/* Info */}
            <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors">
              {tutorial.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tutorial.description}</p>

            {/* Tags */}
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {tutorial.duration}
              </span>
              <span className="flex items-center gap-1">
                <ChefHat size={12} /> {tutorial.cuisine}
              </span>
            </div>

            {/* Recipe Preview */}
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-emerald-700 font-medium">📝 Recipe:</p>
              <p className="text-xs text-emerald-600 mt-1 line-clamp-2">{tutorial.recipe}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="card bg-red-50 border-red-100">
        <h3 className="font-semibold text-red-900 flex items-center gap-2">
          <Play size={18} className="text-red-500" />
          About Tutorials
        </h3>
        <p className="text-sm text-red-800 mt-2">
          Each tutorial includes a video guide and a complete recipe. Videos are sourced from YouTube 
          to provide visual cooking instructions alongside our AI-powered recipe recommendations.
          This helps users learn proper techniques to minimize food waste in their kitchen.
        </p>
      </div>
    </div>
  );
}
