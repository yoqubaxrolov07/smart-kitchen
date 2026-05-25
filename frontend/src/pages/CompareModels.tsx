import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GitCompare, Trophy, TrendingUp } from 'lucide-react';
import { compareModels, getFeatureImportance } from '../api/client';

export default function CompareModels() {
  const [comparison, setComparison] = useState<any>(null);
  const [features, setFeatures] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([compareModels(), getFeatureImportance()])
      .then(([compRes, featRes]) => {
        setComparison(compRes.data);
        setFeatures(featRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const metricsData = comparison ? [
    { metric: 'MAE (kg)', linear: comparison.linear_regression?.mae, rf: comparison.random_forest?.mae },
    { metric: 'RMSE (kg)', linear: comparison.linear_regression?.rmse, rf: comparison.random_forest?.rmse },
    { metric: 'R² Score', linear: comparison.linear_regression?.r2_score, rf: comparison.random_forest?.r2_score },
    { metric: 'CV R² Mean', linear: comparison.linear_regression?.cv_r2_mean, rf: comparison.random_forest?.cv_r2_mean },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <GitCompare className="text-purple-500" />
          Model Comparison
        </h1>
        <p className="text-gray-500 mt-1">Linear Regression (baseline) vs Random Forest (main model)</p>
      </div>

      {/* Winner Badge */}
      {comparison && (
        <div className="card bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={32} />
            <div>
              <p className="font-bold text-lg text-amber-900">
                Recommended Model: {comparison.recommendation}
              </p>
              <p className="text-sm text-amber-700">
                Selected based on R² score and cross-validation performance
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linear Regression */}
        <div className="card border-l-4 border-blue-500">
          <h3 className="font-semibold text-lg text-blue-700 mb-4">📐 Linear Regression</h3>
          <p className="text-xs text-gray-400 mb-4">Baseline Model</p>
          {comparison?.linear_regression && (
            <div className="space-y-3">
              <MetricRow label="MAE" value={`${comparison.linear_regression.mae} kg`} />
              <MetricRow label="RMSE" value={`${comparison.linear_regression.rmse} kg`} />
              <MetricRow label="R² Score" value={comparison.linear_regression.r2_score} highlight />
              <MetricRow label="CV R² (5-fold)" value={`${comparison.linear_regression.cv_r2_mean} ± ${comparison.linear_regression.cv_r2_std}`} />
            </div>
          )}
        </div>

        {/* Random Forest */}
        <div className="card border-l-4 border-emerald-500">
          <h3 className="font-semibold text-lg text-emerald-700 mb-4">🌲 Random Forest</h3>
          <p className="text-xs text-gray-400 mb-4">Main Model (100 trees, max_depth=15)</p>
          {comparison?.random_forest && (
            <div className="space-y-3">
              <MetricRow label="MAE" value={`${comparison.random_forest.mae} kg`} />
              <MetricRow label="RMSE" value={`${comparison.random_forest.rmse} kg`} />
              <MetricRow label="R² Score" value={comparison.random_forest.r2_score} highlight />
              <MetricRow label="CV R² (5-fold)" value={`${comparison.random_forest.cv_r2_mean} ± ${comparison.random_forest.cv_r2_std}`} />
            </div>
          )}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">📊 Metrics Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metricsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="linear" name="Linear Regression" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rf" name="Random Forest" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Importance */}
      {features?.features && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20} />
            Feature Importance (Random Forest)
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Which input features have the most impact on waste prediction
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={features.features.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Explanation */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold mb-3">💡 Model Selection Rationale</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• <strong>Linear Regression</strong> serves as a baseline — it assumes linear relationships between features and waste.</li>
          <li>• <strong>Random Forest</strong> captures non-linear patterns and feature interactions (e.g., holiday + high temp = more waste).</li>
          <li>• We use <strong>5-fold cross-validation</strong> to verify models don't overfit to the training data.</li>
          <li>• The model with higher R² score and lower MAE/RMSE is recommended for production use.</li>
        </ul>
      </div>
    </div>
  );
}

function MetricRow({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center p-2 rounded ${highlight ? 'bg-emerald-50' : 'bg-gray-50'}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-emerald-700 text-lg' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}
