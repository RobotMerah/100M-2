import React from 'react';
import { MOCK_SIGNALS, MOCK_TICKERS, IDR_FORMATTER } from '../constants';
import StatusBadge from '../components/StatusBadge';
import { ArrowRight, TrendingUp, Wallet, AlertTriangle, BookOpen, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const today = new Date().toLocaleDateString('en-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const topPick = MOCK_SIGNALS.find(s => s.type === 'BUY' && s.confidence > 80) || MOCK_SIGNALS[0];

  return (
    <div className="space-y-6">
      {/* Daily Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-idx-border">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Daily Briefing</h1>
          <p className="text-slate-400 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {today}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
           <button className="px-4 py-2 bg-idx-accent hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 transition-all">
             Download Daily Report (PDF)
           </button>
        </div>
      </div>

      {/* Portfolio & Account Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-idx-card border border-idx-border rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-emerald-500/10 transition-colors"></div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2 flex items-center">
            <Wallet className="h-4 w-4 mr-2" /> Capital (IDR)
          </h3>
          <div className="text-3xl font-mono font-bold text-white">{IDR_FORMATTER.format(104250000)}</div>
          <div className="mt-4 flex items-center text-sm text-slate-400">
             <span className="text-emerald-400 font-medium mr-2">+4.25%</span> since inception
          </div>
          <p className="text-xs text-slate-500 mt-1">Goal: Small Cap Growth</p>
        </div>

        <div className="bg-idx-card border border-idx-border rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" /> Realized P&L (Manual)
          </h3>
          <div className="text-3xl font-mono font-bold text-white text-emerald-400">+{IDR_FORMATTER.format(2150000)}</div>
          <div className="mt-4 text-sm text-slate-400">
             5 Winning Trades / 2 Losing
          </div>
        </div>

        <div className="bg-idx-card border border-idx-border rounded-xl p-6">
           <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" /> Active Learning
          </h3>
          <div className="text-3xl font-mono font-bold text-white">14</div>
          <div className="mt-4 text-sm text-slate-400">
             Trades logged for training
          </div>
        </div>
      </div>

      {/* Top Pick Highlight */}
      <div className="bg-gradient-to-br from-idx-card to-slate-900 border border-idx-border rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 bg-idx-accent/20 rounded-bl-xl text-idx-accent font-bold text-sm border-b border-l border-idx-accent/20">
           TOP PICK OF THE DAY
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
               <h2 className="text-4xl font-bold text-white">{topPick.ticker}</h2>
               <StatusBadge status={topPick.type} />
            </div>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
               {topPick.reasoning}
            </p>
            <div className="flex items-center gap-6">
               <div>
                 <div className="text-xs text-slate-500 uppercase">Target</div>
                 <div className="text-xl font-mono text-emerald-400">{IDR_FORMATTER.format(topPick.targetPrice)}</div>
               </div>
               <div>
                 <div className="text-xs text-slate-500 uppercase">Stop Loss</div>
                 <div className="text-xl font-mono text-rose-400">{IDR_FORMATTER.format(topPick.stopLoss)}</div>
               </div>
               <div>
                 <div className="text-xs text-slate-500 uppercase">Exp. Return</div>
                 <div className="text-xl font-mono text-white">{topPick.predictedReturn}%</div>
               </div>
            </div>
          </div>
          <div className="w-full lg:w-1/3 bg-black/20 rounded-xl p-4 border border-white/5">
             <h4 className="text-sm font-semibold text-slate-400 mb-3">Evidence Sources</h4>
             <div className="space-y-2">
                {topPick.sources.map(s => (
                  <div key={s.id} className="text-sm text-slate-300 flex items-start">
                    <span className="mr-2 text-idx-accent">•</span>
                    <span className="line-clamp-2 hover:text-white cursor-pointer">{s.title}</span>
                  </div>
                ))}
             </div>
             <Link to={`/signals/${topPick.id}`} className="mt-4 block w-full text-center py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors">
                View Full Analysis
             </Link>
          </div>
        </div>
      </div>

      {/* Daily Recommendations List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-idx-card border border-idx-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-idx-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Today's Recommendations</h2>
            <Link to="/signals" className="text-sm text-idx-accent hover:text-white transition-colors flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-idx-border">
            {MOCK_SIGNALS.map((signal) => {
              const ticker = MOCK_TICKERS.find(t => t.code === signal.ticker);
              return (
                <Link key={signal.id} to={`/signals/${signal.id}`} className="block p-6 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                        signal.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {signal.ticker}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{ticker?.name}</span>
                          <StatusBadge status={signal.type} size="sm" />
                          {signal.liquidityWarning && (
                            <span className="flex items-center text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Low Liquidity
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-slate-300 line-clamp-1">
                          {signal.reasoning}
                        </div>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-500 uppercase mb-1">Confidence</div>
                      <div className="text-xl font-bold text-white">{signal.confidence}%</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Watchlist */}
        <div className="bg-idx-card border border-idx-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-idx-border">
             <h2 className="text-lg font-semibold text-white">Watchlist</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-idx-border">
                  <th className="text-left pb-2 pl-2">Ticker</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2 pr-2">% Chg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-idx-border/50">
                {MOCK_TICKERS.map((ticker) => (
                   <tr key={ticker.code} className="hover:bg-slate-800/30 transition-colors cursor-pointer">
                     <td className="py-3 pl-2 font-medium text-white">{ticker.code}</td>
                     <td className="py-3 text-right font-mono text-slate-300">{IDR_FORMATTER.format(ticker.price)}</td>
                     <td className={`py-3 pr-2 text-right font-mono ${ticker.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {ticker.changePct > 0 ? '+' : ''}{ticker.changePct}%
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;