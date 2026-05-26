import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { TrendingDown, Utensils, Leaf, AlertTriangle, ThermometerSun, Calendar } from 'lucide-react';
import { getStats } from '../api/client';

interface StatsData {
  kpis: {
    total_waste_kg: number;
    predicted_waste_kg: number;
    saved_food_kg: number;
    avg_waste_per_day_kg: number;
    total_meals_served: number;
    total_records: number;
  };
  weekly_trends: { week: number; waste_kg: number }[];
  holiday_impact: { holiday_avg_waste: number; normal_avg_waste: number; increase_pct: number };
  temperature_impact: { temp_range: string; avg_waste_kg: number }[];
  day_of_week_trends: { day: string; avg_waste_kg: number }[];
  top_waste_foods: { food_item: string; avg_waste: number; total_waste: number; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    getStats()
      .then(res => setStats(res.data))
      .catch(err => {
        const msg = err?.response?.data?.error || err?.message || 'Unknown error';
        const hint = err?.response?.data?.hint || '';
        setErrorMsg(`${msg}${hint ? '\n\nFix: ' + hint : ''}`);
        console.error('Stats error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-800 text-lg mb-2">Failed to load dashboard data</h3>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{errorMsg}</pre>
          <p className="text-xs text-red-500 mt-4">
            Make sure the backend is running on port 5000 and data/raw/smartkitchen_ai_dataset.csv exists.
          </p>
        </div>
      </div>
    );
  }

  const { kpis, weekly_trends, holiday_impact, temperature_impact, day_of_week_trends, top_waste_foods } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="text-gray-500 mt-1">Food waste analytics and AI insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Waste"
          value={`${kpis.total_waste_kg.toFixed(0)} kg`}
          icon={AlertTriangle}
          color="red"
          subtitle={`${kpis.total_records} records analyzed`}
        />
        <KPICard
          title="Predicted Waste"
          value={`${kpis.predicted_waste_kg.toFixed(0)} kg`}
          icon={TrendingDown}
          color="blue"
          subtitle="With AI optimization"
        />
        <KPICard
          title="Food Saved"
          value={`${kpis.saved_food_kg.toFixed(0)} kg`}
          icon={Leaf}
          color="green"
          subtitle="AI-driven reduction"
        />
        <KPICard
          title="Total Meals"
          value={kpis.total_meals_served.toLocaleString()}
          icon={Utensils}
          color="purple"
          subtitle={`Avg waste: ${kpis.avg_waste_per_day_kg.toFixed(1)} kg/day`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">📈 Weekly Waste Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weekly_trends.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="waste_kg" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature vs Waste */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ThermometerSun size={20} className="text-orange-500" />
            Temperature vs Waste
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={temperature_impact}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="temp_range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avg_waste_kg" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Day of Week Impact
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={day_of_week_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avg_waste_kg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Holiday Impact */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">🎉 Holiday Impact on Waste</h3>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center space-y-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-500">Normal Days</p>
                  <p className="text-3xl font-bold text-blue-600">{holiday_impact.normal_avg_waste} kg</p>
                  <p className="text-xs text-gray-400">avg per record</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Holiday Days</p>
                  <p className="text-3xl font-bold text-red-500">{holiday_impact.holiday_avg_waste} kg</p>
                  <p className="text-xs text-gray-400">avg per record</p>
                </div>
              </div>
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg">
                ⚠️ Holidays increase waste by <strong>{holiday_impact.increase_pct}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Waste Foods */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🍕 Top Waste Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top_waste_foods.slice(0, 6).map((food, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                <span className="font-medium">{food.food_item}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-red-500">
                  {food.total_waste.toFixed(1)} kg total
                </span>
                <p className="text-xs text-gray-400">{food.count} records</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ title, value, icon: Icon, color, subtitle }: {
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle: string;
}) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
