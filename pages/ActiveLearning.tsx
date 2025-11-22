import React, { useState } from 'react';
import { MOCK_SIGNALS } from '../constants';
import { Check, X, AlertCircle, MessageSquare, SkipForward } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const ActiveLearning: React.FC = () => {
  // Use the first signal as the mock "current task"
  const [currentSignalIndex, setCurrentSignalIndex] = useState(0);
  const currentSignal = MOCK_SIGNALS[currentSignalIndex % MOCK_SIGNALS.length];
  
  const [feedback, setFeedback] = useState('');
  const [history, setHistory] = useState<{id: string, correct: boolean}[]>([]);

  const handleVote = (correct: boolean) => {
    setHistory([{id: currentSignal.id, correct}, ...history]);
    setFeedback('');
    // Move to "next" signal (cycling for demo)
    setCurrentSignalIndex(prev => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-white">Model Improvement Loop</h1>
        <p className="text-slate-400 mt-2">Review uncertain historical signals to retrain the model. Correct labeling improves accuracy.</p>
      </div>

      <div className="bg-idx-card border border-idx-border rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-slate-800 to-idx-card p-4 border-b border-idx-border flex justify-between items-center">
          <div className="flex items-center gap-2">
             <AlertCircle className="h-5 w-5 text-idx-warning" />
             <span className="text-white font-medium">Review Required: Uncertainty Score 0.85</span>
          </div>
          <span className="text-slate-400 text-sm font-mono">ID: {currentSignal.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Context Side */}
          <div className="p-8 border-r border-idx-border">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-4xl font-bold text-white mb-1">{currentSignal.ticker}</h2>
                  <div className="flex gap-2">
                    <StatusBadge status={currentSignal.type} />
                    <span className="text-slate-400 text-sm flex items-center">
                       Predicted Return: <span className="text-white font-bold ml-1">{currentSignal.predictedReturn}%</span>
                    </span>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-sm text-slate-500">Signal Time</div>
                  <div className="text-white font-mono">{new Date(currentSignal.timestamp).toLocaleString()}</div>
               </div>
            </div>

            <div className="bg-idx-bg rounded-lg p-4 mb-6">
              <p className="text-slate-300 italic leading-relaxed">"{currentSignal.reasoning}"</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Key Drivers</h4>
              <ul className="space-y-2">
                 {currentSignal.sources.map(s => (
                   <li key={s.id} className="flex items-start text-sm text-slate-300">
                     <span className="mr-2">•</span>
                     <span className="line-clamp-2">{s.snippet}</span>
                   </li>
                 ))}
              </ul>
            </div>
          </div>

          {/* Action Side */}
          <div className="p-8 flex flex-col justify-center bg-idx-bg/50">
            <h3 className="text-xl font-semibold text-white text-center mb-8">Was this signal profitable/valid?</h3>
            
            <div className="flex justify-center gap-6 mb-8">
              <button 
                onClick={() => handleVote(false)}
                className="group flex flex-col items-center p-6 bg-idx-card border border-idx-border hover:border-rose-500 hover:bg-rose-500/10 rounded-xl transition-all w-32"
              >
                <div className="h-12 w-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-3 group-hover:bg-rose-500 text-rose-400 group-hover:text-white transition-colors">
                   <X className="h-6 w-6" />
                </div>
                <span className="font-medium text-slate-300 group-hover:text-white">No</span>
              </button>

              <button 
                onClick={() => handleVote(true)}
                className="group flex flex-col items-center p-6 bg-idx-card border border-idx-border hover:border-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all w-32"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-white transition-colors">
                   <Check className="h-6 w-6" />
                </div>
                <span className="font-medium text-slate-300 group-hover:text-white">Yes</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MessageSquare className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add optional notes for the research team..."
                className="block w-full pl-10 pr-3 py-3 border border-idx-border rounded-lg leading-5 bg-idx-bg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-idx-accent focus:ring-1 focus:ring-idx-accent sm:text-sm"
              />
            </div>
            
            <button onClick={() => setCurrentSignalIndex(prev => prev + 1)} className="mt-4 text-center text-sm text-slate-500 hover:text-white flex items-center justify-center">
               <SkipForward className="h-4 w-4 mr-1" /> Skip this sample
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
         <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Recent Labels</h3>
         <div className="bg-idx-card border border-idx-border rounded-xl overflow-hidden">
           {history.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No signals reviewed yet.</div>
           ) : (
             <table className="w-full text-sm">
               <thead className="bg-slate-800/50 text-slate-400">
                 <tr>
                   <th className="px-6 py-3 text-left">Signal ID</th>
                   <th className="px-6 py-3 text-left">Verdict</th>
                   <th className="px-6 py-3 text-left">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-idx-border">
                 {history.map((h, i) => (
                   <tr key={i}>
                     <td className="px-6 py-4 text-slate-300 font-mono">{h.id}</td>
                     <td className="px-6 py-4">
                       {h.correct ? <span className="text-emerald-400 font-medium">Valid</span> : <span className="text-rose-400 font-medium">Invalid</span>}
                     </td>
                     <td className="px-6 py-4 text-slate-500">Queued for retraining</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>
      </div>
    </div>
  );
};

export default ActiveLearning;