import React, { useState, useEffect } from 'react';
import { MOCK_INGESTION_TASKS } from '../constants';
import { Play, Pause, RefreshCw, FileText, Youtube, Twitter, Newspaper } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { MediaType } from '../types';

const DataIngestion: React.FC = () => {
  const [tasks, setTasks] = useState(MOCK_INGESTION_TASKS);
  const [isStreamActive, setIsStreamActive] = useState(true);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isStreamActive) return;
      
      setTasks(prev => prev.map(task => {
        if (task.status === 'PROCESSING') {
          const newProgress = Math.min(task.progress + Math.random() * 5, 100);
          return {
            ...task,
            progress: newProgress,
            status: newProgress >= 100 ? 'COMPLETED' : 'PROCESSING',
            details: newProgress >= 100 ? 'Indexing complete' : task.details
          };
        }
        return task;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isStreamActive]);

  const getIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.VIDEO: return <Youtube className="h-5 w-5 text-red-400" />;
      case MediaType.SOCIAL: return <Twitter className="h-5 w-5 text-blue-400" />;
      case MediaType.PDF: return <FileText className="h-5 w-5 text-orange-400" />;
      case MediaType.NEWS: return <Newspaper className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Multimodal Ingestion Pipeline</h1>
          <p className="text-slate-400 text-sm">Monitor real-time data feeds from News, Video, and Social sources.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsStreamActive(!isStreamActive)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isStreamActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isStreamActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isStreamActive ? 'Pause Ingestion' : 'Resume Ingestion'}
          </button>
          <button className="flex items-center px-4 py-2 bg-idx-card hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 border border-idx-border">
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Crawl
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-idx-card border border-idx-border rounded-xl p-5">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Throughput (Items/Min)</h3>
          <div className="text-3xl font-mono font-bold text-white">142</div>
          <div className="flex items-center mt-2 text-xs text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            System Operational
          </div>
        </div>
        <div className="bg-idx-card border border-idx-border rounded-xl p-5">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Vector DB Size</h3>
          <div className="text-3xl font-mono font-bold text-white">8.4M <span className="text-lg text-slate-500">vectors</span></div>
          <div className="mt-2 text-xs text-slate-400">Milvus Cluster • 99.9% Uptime</div>
        </div>
        <div className="bg-idx-card border border-idx-border rounded-xl p-5">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">ASR/OCR Cost (Est.)</h3>
          <div className="text-3xl font-mono font-bold text-white">$42.30 <span className="text-lg text-slate-500">/day</span></div>
          <div className="mt-2 text-xs text-slate-400">Whisper Large V3 + Tesseract</div>
        </div>
      </div>

      <div className="bg-idx-card border border-idx-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-idx-border">
          <h3 className="font-semibold text-white">Active Ingestion Tasks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Progress</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-idx-border hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{task.source}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      {getIcon(task.type)}
                      <span className="text-xs">{task.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={task.status} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-idx-accent transition-all duration-500 ease-out" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">{Math.round(task.progress)}%</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {task.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataIngestion;