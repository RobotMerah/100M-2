import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_SIGNALS, MOCK_TICKERS, IDR_FORMATTER } from '../constants';
import { ArrowLeft, TrendingUp, AlertTriangle, PlayCircle, FileText, AlertCircle, CheckCircle, Save, BookOpen, BrainCircuit } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Mock 1-minute intraday data generator
const generateIntradayData = (startPrice: number, points: number = 60) => {
  let current = startPrice;
  return Array.from({ length: points }, (_, i) => {
    current = current * (1 + (Math.random() - 0.5) * 0.005);
    return {
      time: `${9 + Math.floor(i / 60)}:${(i % 60).toString().padStart(2, '0')}`,
      price: current
    };
  });
};

const SignalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const signal = MOCK_SIGNALS.find(s => s.id === id) || MOCK_SIGNALS[0];
  const ticker = MOCK_TICKERS.find(t => t.code === signal.ticker) || MOCK_TICKERS[0];
  const chartData = generateIntradayData(ticker.price);

  // Manual Log State
  const [logPrice, setLogPrice] = useState(signal.entryPrice);
  const [logLots, setLogLots] = useState(10);
  const [logNotes, setLogNotes] = useState('');
  const [logged, setLogged] = useState(false);

  const handleLogTrade = () => {
    setLogged(true);
    // In a real app, this would send data to the active learning loop
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Recommendations
      </button>

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-idx-card border border-idx-border rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">{ticker.code}</h1>
                <StatusBadge status={signal.type} />
                {signal.liquidityWarning && (
                  <div className="flex items-center text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Low Liquidity
                  </div>
                )}
              </div>
              <p className="text-slate-400">{ticker.name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-white">{IDR_FORMATTER.format(ticker.price)}</div>
              <div className={`text-sm font-medium ${ticker.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ticker.change > 0 ? '+' : ''}{ticker.change} ({ticker.changePct}%)
              </div>
            </div>
          </div>

          <div className="h-64 w-full relative">
             <div className="absolute top-2 left-2 z-10 bg-idx-card/80 px-2 py-1 rounded text-xs text-slate-400 border border-idx-border">
               Intraday Price Action
             </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(val) => val.toFixed(0)} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value: number) => [IDR_FORMATTER.format(value), "Price"]}
                />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manual Trade Logger */}
        <div className="bg-idx-card border border-idx-border rounded-xl p-6 flex flex-col h-full relative overflow-hidden">
          {logged ? (
             <div className="absolute inset-0 bg-idx-card z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                   <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Trade Logged!</h3>
                <p className="text-slate-400 text-sm mb-6">Your execution data has been saved and will be used to refine future model predictions.</p>
                <button 
                  onClick={() => setLogged(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                >
                  Log Another Trade
                </button>
             </div>
          ) : null}
          
          <div className="flex items-center gap-2 mb-4 border-b border-idx-border pb-2">
            <BookOpen className="h-5 w-5 text-idx-accent" />
            <h3 className="text-lg font-semibold text-white">Manual Trade Journal</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Did you execute this recommendation? Log it here to track performance and train the AI.
          </p>
          
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Execution Price</label>
                <input 
                  type="number" 
                  value={logPrice}
                  onChange={(e) => setLogPrice(Number(e.target.value))}
                  className="w-full bg-idx-bg border border-idx-border rounded p-2 text-white focus:border-idx-accent outline-none font-mono"
                />
              </div>
              <div>
                 <label className="block text-xs text-slate-400 mb-1">Lots (100 shares)</label>
                 <input 
                  type="number" 
                  value={logLots}
                  onChange={(e) => setLogLots(Number(e.target.value))}
                  className="w-full bg-idx-bg border border-idx-border rounded p-2 text-white focus:border-idx-accent outline-none font-mono"
                 />
              </div>
            </div>

            <div>
               <label className="block text-xs text-slate-400 mb-1">Notes / Strategy deviation</label>
               <textarea 
                 value={logNotes}
                 onChange={(e) => setLogNotes(e.target.value)}
                 placeholder="e.g., Entered late due to spread..."
                 className="w-full h-24 bg-idx-bg border border-idx-border rounded p-2 text-white focus:border-idx-accent outline-none text-sm resize-none"
               />
            </div>
            
            <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
               <div className="flex justify-between text-xs mb-1">
                 <span className="text-slate-400">Total Value</span>
                 <span className="text-white font-mono">{IDR_FORMATTER.format(logPrice * logLots * 100)}</span>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-slate-400">Est. Fees (0.26%)</span>
                 <span className="text-rose-400 font-mono">{IDR_FORMATTER.format(logPrice * logLots * 100 * 0.0026)}</span>
               </div>
            </div>
          </div>

          <button 
            onClick={handleLogTrade}
            className="w-full mt-6 bg-idx-accent hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" /> Log Trade
          </button>
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RAG Explanation */}
        <div className="lg:col-span-2 bg-idx-card border border-idx-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="h-5 w-5 text-idx-accent" />
            <h3 className="text-lg font-semibold text-white">AI Reasoning (RAG)</h3>
          </div>
          
          <div className="mb-6">
             <p className="text-slate-300 leading-relaxed text-lg">
              {signal.reasoning}
            </p>
          </div>

          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Evidence Sources</h4>
          <div className="space-y-3">
            {signal.sources.map((source) => (
              <div key={source.id} className="bg-idx-bg border border-idx-border rounded-lg p-4 hover:border-idx-accent/50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {source.type === 'VIDEO' ? <PlayCircle className="h-4 w-4 text-red-400" /> : 
                     source.type === 'NEWS' ? <FileText className="h-4 w-4 text-blue-400" /> : 
                     <AlertCircle className="h-4 w-4 text-orange-400" />}
                    <span className="font-medium text-sm text-white group-hover:text-idx-accent transition-colors">{source.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     {source.startTime && <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">@{source.startTime}</span>}
                     <span className="text-xs text-slate-500">{new Date(source.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 italic border-l-2 border-slate-600 pl-3">
                  "{source.snippet}"
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Relevance: {(source.relevanceScore * 100).toFixed(0)}%</span>
                  <StatusBadge status={source.sentiment} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ensemble & Technicals */}
        <div className="space-y-6">
          {/* Ensemble Models */}
          <div className="bg-idx-card border border-idx-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
               <BrainCircuit className="h-5 w-5 text-purple-400" />
               <h3 className="text-lg font-semibold text-white">Ensemble Consensus</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                   <span>LightGBM (Tabular)</span>
                   <span>{(signal.ensembleDetails.lightGBM * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500" style={{width: `${signal.ensembleDetails.lightGBM * 100}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                   <span>Transformer (Time-Series)</span>
                   <span>{(signal.ensembleDetails.transformer * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500" style={{width: `${signal.ensembleDetails.transformer * 100}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                   <span>FinBERT (Sentiment)</span>
                   <span>{(signal.ensembleDetails.sentimentAnalysis * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500" style={{width: `${signal.ensembleDetails.sentimentAnalysis * 100}%`}}></div>
                </div>
              </div>
              
              <div className="pt-3 mt-2 border-t border-idx-border">
                 <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Final Confidence</span>
                    <span className="text-xl font-bold text-idx-accent">{signal.confidence}%</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Technical Levels */}
          <div className="bg-idx-card border border-idx-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
               <TrendingUp className="h-5 w-5 text-slate-300" />
               <h3 className="text-lg font-semibold text-white">Key Levels</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
               <div className="p-3 bg-idx-bg rounded border border-idx-border">
                  <div className="text-xs text-slate-500 uppercase">Support</div>
                  <div className="font-mono text-emerald-400">{signal.stopLoss}</div>
               </div>
               <div className="p-3 bg-idx-bg rounded border border-idx-border">
                  <div className="text-xs text-slate-500 uppercase">Resistance</div>
                  <div className="font-mono text-rose-400">{signal.targetPrice}</div>
               </div>
               <div className="p-3 bg-idx-bg rounded border border-idx-border">
                  <div className="text-xs text-slate-500 uppercase">RSI (14)</div>
                  <div className="font-mono text-white">{signal.technicalIndicators.rsi}</div>
               </div>
               <div className="p-3 bg-idx-bg rounded border border-idx-border">
                  <div className="text-xs text-slate-500 uppercase">VWAP</div>
                  <div className="font-mono text-white">{signal.technicalIndicators.vwap}</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalDetail;