import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  BarChart3, Upload, GitCompare, Workflow, 
  ChefHat, Play, Home, ArrowLeft 
} from 'lucide-react';

interface LayoutProps {
  mode: 'business' | 'personal';
}

const businessNav = [
  { path: '/business', label: 'Dashboard', icon: BarChart3 },
  { path: '/business/predict', label: 'AI Predict', icon: Workflow },
  { path: '/business/upload', label: 'Upload CSV', icon: Upload },
  { path: '/business/compare', label: 'Compare Models', icon: GitCompare },
  { path: '/business/pipeline', label: 'AI Pipeline', icon: Workflow },
];

const personalNav = [
  { path: '/personal', label: 'Recipe Finder', icon: ChefHat },
  { path: '/personal/tutorials', label: 'Tutorials', icon: Play },
];

export default function Layout({ mode }: LayoutProps) {
  const location = useLocation();
  const nav = mode === 'business' ? businessNav : personalNav;
  const bgColor = mode === 'business' ? 'bg-slate-900' : 'bg-emerald-900';

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`${bgColor} text-white w-64 flex flex-col`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🍽️ SmartKitchen AI
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {mode === 'business' ? 'Business Mode' : 'Personal Mode'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-white/15 text-white font-medium' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link
            to={mode === 'business' ? '/personal' : '/business'}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mt-2"
          >
            <Home size={16} />
            Switch to {mode === 'business' ? 'Personal' : 'Business'} Mode
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  );
}
