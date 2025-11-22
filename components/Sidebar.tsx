import React from 'react';
import { LayoutDashboard, LineChart, BrainCircuit, Database, Activity, Settings, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Daily Recommendations' },
    { path: '/signals', icon: Activity, label: 'Recommendations List' },
    { path: '/backtest', icon: LineChart, label: 'Strategy Simulator' },
    { path: '/learning', icon: BrainCircuit, label: 'Review & Retrain' },
    { path: '/ingestion', icon: Database, label: 'Multimodal Sources' },
  ];

  return (
    <aside className="w-20 lg:w-64 h-screen bg-idx-bg border-r border-idx-border flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-idx-border">
        <div className="h-8 w-8 bg-idx-accent rounded-md flex items-center justify-center mr-0 lg:mr-3">
          <span className="text-white font-bold text-lg">U</span>
        </div>
        <span className="text-white font-bold text-lg hidden lg:block tracking-tight">Ultimate<span className="text-idx-accent">IDX</span></span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-center lg:justify-start px-3 py-3 rounded-lg transition-colors duration-200 ${
              isActive(item.path)
                ? 'bg-idx-accent/10 text-idx-accent border border-idx-accent/20'
                : 'text-slate-400 hover:bg-idx-card hover:text-slate-200'
            }`}
          >
            <item.icon className="h-5 w-5 lg:mr-3" />
            <span className="hidden lg:block font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-idx-border">
        <Link to="/docs" className="flex items-center justify-center lg:justify-start p-2 text-slate-500 hover:text-slate-300 cursor-pointer">
          <FileText className="h-5 w-5 lg:mr-3" />
          <span className="hidden lg:block text-sm">Architecture & API</span>
        </Link>
        <div className="flex items-center justify-center lg:justify-start p-2 text-slate-500 hover:text-slate-300 cursor-pointer mt-1">
          <Settings className="h-5 w-5 lg:mr-3" />
          <span className="hidden lg:block text-sm">Settings</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;