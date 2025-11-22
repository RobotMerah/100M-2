import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SignalDetail from './pages/SignalDetail';
import Backtester from './pages/Backtester';
import DataIngestion from './pages/DataIngestion';
import ActiveLearning from './pages/ActiveLearning';
import Documentation from './pages/Documentation';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen bg-idx-bg text-slate-200">
        <Sidebar />
        <main className="flex-1 lg:ml-64 overflow-auto p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/signals" element={<Navigate to="/" replace />} />
            <Route path="/signals/:id" element={<SignalDetail />} />
            <Route path="/backtest" element={<Backtester />} />
            <Route path="/ingestion" element={<DataIngestion />} />
            <Route path="/learning" element={<ActiveLearning />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;