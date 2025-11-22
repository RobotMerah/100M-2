import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Save, AlertCircle } from 'lucide-react';
import { IDR_FORMATTER } from '../constants';

const Backtester: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  // Mock backtest simulation
  const runBacktest = () => {
    setRunning(true);
    setProgress(0);
    setResults(null);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunning(false);
          generateResults();
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const generateResults = () => {
    const initialEquity = 100000000;
    const data = [];
    let equity = initialEquity;
    for (let i = 0; i < 30; i++) {
      const change = (Math.random() - 0.38) * 2000000; // Biased slightly positive
      equity += change;
      data.push({ day: i + 1, equity });
    }
    setResults({
      equityCurve: data,
      totalReturn: 18.4,
      sharpeRatio: 2.1,
      maxDrawdown: -3.8,
      trades: 45,
      winRate: 64
    });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategy Simulator</h1>
          <p className="text-sm text-slate-400">Simulate small capital growth with realistic Indonesian market costs.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-idx-card border border-idx-border rounded-lg text-sm text-slate-300 hover:text-white">
            <Save className="h-4 w-4 mr-2" /> Save Config
          </button>
          <button 
            onClick={runBacktest}
            disabled={running}
            className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold text-white transition-all ${
              running ? 'bg-slate-600 cursor-not-allowed' : 'bg-idx-accent hover:bg-blue-600 shadow-lg shadow-blue-500/20'
            }`}
          >
            <Play className={`h-4 w-4 mr-2 ${running ? 'animate-spin' : ''}`} />
            {running ? `Running ${progress}%` : 'Run Backtest'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Config Panel */}
        <div className="lg:col-span-3 bg-idx-card border border-idx-border rounded-xl p-5 overflow-y-auto">
          <div className="mb-6 p-3 bg-slate-800/50 border border-idx-border rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-idx-accent mt-0.5" />
            <p className="text-xs text-slate-400">Includes IDX Levy, VAT, and 0.1% Sales Tax automatic calculation.</p>
          </div>

          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">Configuration</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Strategy Model</label>
              <select className="w-full bg-idx-bg border border-idx-border rounded p-2 text-sm text-white outline-none focus:border-idx-accent">
                <option>Ensemble: GBM + Transformer</option>
                <option>Pure Technical (VWAP)</option>
                <option>Sentiment Driven</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Initial Capital (IDR)</label>
              <input type="number" defaultValue={100000000} className="w-full bg-idx-bg border border-idx-border rounded p-2 text-sm text-white outline-none focus:border-idx-accent font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                <input type="date" className="w-full bg-idx-bg border border-idx-border rounded p-2 text-sm text-white outline-none focus:border-idx-accent" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">End Date</label>
                <input type="date" className="w-full bg-idx-bg border border-idx-border rounded p-2 text-sm text-white outline-none focus:border-idx-accent" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Execution</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-500 block">Slippage %</span>
                  <input type="number" defaultValue={0.5} className="w-full bg-idx-bg border border-idx-border rounded p-2 text-sm text-white outline-none focus:border-idx-accent" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Commission %</span>
                  <input type="number" defaultValue={0.15} className="w-full bg-idx-bg border border-idx-border rounded p-2 text-sm text-white outline-none focus:border-idx-accent" />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-idx-border">
               <div className="flex items-center mb-2">
                 <input type="checkbox" id="reinvest" defaultChecked className="mr-2 accent-idx-accent" />
                 <label htmlFor="reinvest" className="text-sm text-slate-300">Compound Profits</label>
               </div>
               <div className="flex items-center">
                 <input type="checkbox" id="lots" defaultChecked className="mr-2 accent-idx-accent" />
                 <label htmlFor="lots" className="text-sm text-slate-300">Enforce Lot Size (100)</label>
               </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'CAGR', value: results ? `+${results.totalReturn}%` : '--', color: 'text-emerald-400' },
              { label: 'Sharpe Ratio', value: results ? results.sharpeRatio : '--', color: 'text-white' },
              { label: 'Max Drawdown', value: results ? `${results.maxDrawdown}%` : '--', color: 'text-rose-400' },
              { label: 'Win Rate', value: results ? `${results.winRate}%` : '--', color: 'text-blue-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-idx-card border border-idx-border rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-mono font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="flex-1 bg-idx-card border border-idx-border rounded-xl p-4 min-h-[300px]">
            {results ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.equityCurve}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tickFormatter={(val) => (val/1000000).toFixed(0) + 'M'} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    formatter={(value: number) => IDR_FORMATTER.format(value)}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#10b981" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                 <div className="bg-idx-bg p-4 rounded-full mb-4">
                   <Play className="h-8 w-8 opacity-50" />
                 </div>
                 <p>Run backtest to visualize equity curve</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtester;