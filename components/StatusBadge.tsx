import React from 'react';

interface StatusBadgeProps {
  status: 'BUY' | 'SELL' | 'HOLD' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'PENDING';
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClass = '';
  
  switch (status) {
    case 'BUY':
    case 'POSITIVE':
    case 'COMPLETED':
      colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      break;
    case 'SELL':
    case 'NEGATIVE':
    case 'FAILED':
      colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      break;
    case 'HOLD':
    case 'NEUTRAL':
    case 'PENDING':
      colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      break;
    case 'PROCESSING':
      colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      break;
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center justify-center rounded-full border font-medium ${colorClass} ${sizeClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;