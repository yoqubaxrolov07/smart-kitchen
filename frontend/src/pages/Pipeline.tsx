import { useEffect, useState } from 'react';
import { Workflow, CheckCircle, Database, Trash2, Settings, Brain, BarChart3, Monitor } from 'lucide-react';
import { getPipeline } from '../api/client';

const STEP_ICONS = [Database, Trash2, Settings, Brain, BarChart3, Monitor];
const STEP_COLORS = ['bg-blue-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-emerald-500', 'bg-cyan-500'];

export default function Pipeline() {
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPipeline()
      .then(res => setPipeline(res.data.pipeline))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Workflow className="text-purple-500" />
          AI Development Pipeline
        </h1>
        <p className="text-gray-500 mt-1">
          End-to-end machine learning workflow — from data collection to deployment
        </p>
      </div>

      {/* Pipeline Visual Flow */}
      <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
        <h3 className="text-lg font-semibold mb-6 text-white/80">Pipeline Overview</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {pipeline.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg ${STEP_COLORS[i]} font-medium text-white text-xs`}>
                {step.name}
              </span>
              {i < pipeline.length - 1 && (
                <span className="text-white/40 text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Steps */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {pipeline.map((step, i) => {
            const Icon = STEP_ICONS[i] || Workflow;
            return (
              <div key={i} className="relative flex gap-6">
                {/* Step number circle */}
                <div className={`relative z-10 w-16 h-16 rounded-full ${STEP_COLORS[i]} flex items-center justify-center shadow-lg`}>
                  <Icon size={24} className="text-white" />
                </div>

                {/* Content card */}
                <div className="flex-1 card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">
                        Step {step.step}: {step.name}
                      </h3>
                      <p className="text-gray-600 mt-2">{step.description}</p>
                    </div>
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium">
                      <CheckCircle size={12} />
                      {step.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.tech.split(', ').map((t: string, j: number) => (
                      <span key={j} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="card bg-purple-50 border-purple-100">
        <h3 className="font-semibold text-purple-900 mb-3">🎯 Pipeline Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-700">6</p>
            <p className="text-xs text-gray-600">Pipeline Steps</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-700">1,200+</p>
            <p className="text-xs text-gray-600">Training Rows</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-700">17</p>
            <p className="text-xs text-gray-600">Features Used</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-700">2</p>
            <p className="text-xs text-gray-600">Models Trained</p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">🛠️ Technology Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Python', role: 'Backend & ML' },
            { name: 'Scikit-learn', role: 'Model Training' },
            { name: 'Pandas', role: 'Data Processing' },
            { name: 'Flask', role: 'REST API' },
            { name: 'React', role: 'Frontend UI' },
            { name: 'TypeScript', role: 'Type Safety' },
            { name: 'Tailwind CSS', role: 'Styling' },
            { name: 'Recharts', role: 'Visualizations' },
          ].map((tech, i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-sm">{tech.name}</p>
              <p className="text-xs text-gray-500">{tech.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
