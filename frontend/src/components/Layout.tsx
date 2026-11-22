import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Brain,
  LayoutDashboard,
  Search,
  BarChart3,
  Network,
  History,
  FlaskConical,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/predict', label: 'Meaning Predictor', icon: Search },
  { to: '/analysis', label: 'Semantic Analysis', icon: BarChart3 },
  { to: '/visualization', label: 'Context Visualization', icon: Network },
  { to: '/history', label: 'Prediction History', icon: History },
  { to: '/evaluation', label: 'Model Evaluation', icon: FlaskConical },
  { to: '/about', label: 'About Project', icon: Info },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0f1e] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-[72px]' : 'w-64'
        } flex flex-col bg-[#111827] border-r border-slate-700/50 transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700/50">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shrink-0">
            <Brain size={20} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
              SemanticWSD
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center h-12 border-t border-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
