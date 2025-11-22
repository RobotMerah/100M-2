
import React from 'react';
import { Server, Layers, Database, ArrowRight, BrainCircuit, Terminal, FolderOpen } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="border-b border-idx-border pb-6">
        <h1 className="text-3xl font-bold text-white">System Architecture & Codebase</h1>
        <p className="text-slate-400 mt-2">High-level design and data flow for the Ultimate Multimodal IDX Recommendation AI.</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 flex items-start gap-4">
         <FolderOpen className="h-6 w-6 text-blue-400 mt-1" />
         <div>
            <h3 className="text-blue-400 font-bold mb-1">Backend Code Included</h3>
            <p className="text-sm text-slate-300">
               The prototype now includes the Python backend skeletons necessary to run the AI engine.
               Check the <code>backend/</code> folder in the project root for <code>main.py</code> (FastAPI), 
               <code>models.py</code> (Ensemble Logic), and <code>backtester.py</code> (IDX Simulation).
            </p>
         </div>
      </div>

      {/* Architecture Diagram Visualization */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-idx-accent" />
          Core Components
        </h2>
        
        <div className="bg-idx-card border border-idx-border rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            
            {/* Ingestion Layer */}
            <div className="flex flex-col gap-4">
               <div className="p-4 bg-slate-800 rounded-lg border border-idx-border">
                 <h3 className="text-emerald-400 font-mono text-sm mb-2">Ingestion Layer</h3>
                 <div className="text-xs text-slate-400 space-y-1">
                    <div>Market Data (WS)</div>
                    <div>News Scraper</div>
                    <div>Video (Whisper ASR)</div>
                    <div>PDF (OCR)</div>
                 </div>
               </div>
            </div>

            <div className="flex items-center justify-center">
               <ArrowRight className="h-6 w-6 text-slate-600" />
            </div>

            {/* Processing Layer */}
            <div className="flex flex-col gap-4">
               <div className="p-4 bg-slate-800 rounded-lg border border-idx-border">
                 <h3 className="text-blue-400 font-mono text-sm mb-2">Processing & RAG</h3>
                 <div className="text-xs text-slate-400 space-y-1">
                    <div>Chunking & Cleaning</div>
                    <div>Embedding (BGE-M3)</div>
                    <div>Vector DB (Milvus)</div>
                    <div>Feature Store</div>
                 </div>
               </div>
            </div>

             <div className="flex items-center justify-center">
               <ArrowRight className="h-6 w-6 text-slate-600" />
            </div>

            {/* Inference Layer */}
            <div className="flex flex-col gap-4">
               <div className="p-4 bg-slate-800 rounded-lg border border-idx-border relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-3 h-3 bg-idx-accent rounded-bl animate-pulse"></div>
                 <h3 className="text-purple-400 font-mono text-sm mb-2">Ensemble Model</h3>
                 <div className="text-xs text-slate-400 space-y-1">
                    <div>LightGBM (Tabular)</div>
                    <div>Transformer (Seq)</div>
                    <div>FinBERT (Sentiment)</div>
                    <div>LLM Reasoner</div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
             <div className="border-l-2 border-dashed border-slate-700 h-8"></div>
          </div>
          
          {/* Feedback Loop */}
          <div className="mt-0 flex justify-center">
            <div className="w-full md:w-3/5 p-4 bg-slate-800/50 border border-dashed border-slate-600 rounded-lg flex items-center justify-between">
               <div className="text-left">
                 <h3 className="text-orange-400 font-mono text-sm">Active Learning Loop</h3>
                 <p className="text-xs text-slate-500">Manual trade logs + User corrections → Retraining Queue</p>
               </div>
               <BrainCircuit className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Sequence Flow */}
      <div className="space-y-4">
         <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Terminal className="h-5 w-5 text-idx-accent" />
          Daily Recommendation Sequence
        </h2>
        <div className="bg-idx-card border border-idx-border rounded-xl p-6 font-mono text-sm text-slate-300 overflow-x-auto">
          <pre>{`
1. 06:00 AM > Trigger DailyBatchJob()
   |
   +-> Fetch Overnight News & Global Indices
   +-> Update VectorDB with new articles
   +-> Calculate Pre-market features

2. 07:00 AM > Run EnsemblePrediction()
   |
   +-> Model A (LightGBM): Outputs probability
   +-> Model B (Transformer): Outputs trend vector
   +-> Model C (Sentiment): Outputs aggregation
   |
   +-> Combine -> Weighted Confidence Score

3. 07:30 AM > GenerateExplanations(LLM)
   |
   +-> For Top 10 Tickers:
       Retrieve Top-K Context from VectorDB
       Generate "Reasoning" string
       Extract Citations

4. 08:00 AM > Publish to Dashboard / Notification Service
   |
   +-> User receives "Daily Briefing"

5. 09:00 AM - 04:00 PM > Intraday Monitoring
   |
   +-> User Logs Manual Trade -> Saved to 'training_labels' table
          `}</pre>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-idx-card border border-idx-border rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center"><Server className="h-4 w-4 mr-2"/> Backend Stack</h3>
            <ul className="space-y-2 text-sm text-slate-400">
               <li><strong className="text-slate-200">FastAPI (Python):</strong> High-performance async API.</li>
               <li><strong className="text-slate-200">Celery + Redis:</strong> Async worker queues for ingestion.</li>
               <li><strong className="text-slate-200">PostgreSQL:</strong> User data, trade logs, tabular features.</li>
               <li><strong className="text-slate-200">Milvus:</strong> Vector storage for RAG.</li>
            </ul>
         </div>
         <div className="bg-idx-card border border-idx-border rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center"><Database className="h-4 w-4 mr-2"/> AI Components</h3>
            <ul className="space-y-2 text-sm text-slate-400">
               <li><strong className="text-slate-200">Whisper (OpenAI):</strong> ASR for video/audio.</li>
               <li><strong className="text-slate-200">BGE-M3:</strong> Multilingual embeddings (supports Indonesian).</li>
               <li><strong className="text-slate-200">IndoBERT:</strong> Fine-tuned for sentiment analysis.</li>
               <li><strong className="text-slate-200">Google Gemini:</strong> Reasoning and explanation generation.</li>
            </ul>
         </div>
      </div>
    </div>
  );
};

export default Documentation;
