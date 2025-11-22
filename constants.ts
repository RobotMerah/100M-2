import { Ticker, SignalType, TradeSignal, MediaType, IngestionTask } from './types';

export const MOCK_TICKERS: Ticker[] = [
  { code: 'BBCA', name: 'Bank Central Asia Tbk', price: 9850, change: 125, changePct: 1.28, volume: 45000000, sector: 'Finance' },
  { code: 'BBRI', name: 'Bank Rakyat Indonesia', price: 5600, change: -50, changePct: -0.88, volume: 82000000, sector: 'Finance' },
  { code: 'TLKM', name: 'Telkom Indonesia', price: 3200, change: 40, changePct: 1.26, volume: 35000000, sector: 'Infra' },
  { code: 'ASII', name: 'Astra International', price: 5100, change: 0, changePct: 0.0, volume: 12000000, sector: 'Consumer' },
  { code: 'GOTO', name: 'GoTo Gojek Tokopedia', price: 54, change: -2, changePct: -3.57, volume: 950000000, sector: 'Tech' },
  { code: 'AMMN', name: 'Amman Mineral', price: 8400, change: 200, changePct: 2.44, volume: 8000000, sector: 'Energy' },
  { code: 'BRPT', name: 'Barito Pacific', price: 1020, change: 15, changePct: 1.49, volume: 15000000, sector: 'Energy' },
];

export const MOCK_SIGNALS: TradeSignal[] = [
  {
    id: 'rec-2023-10-25-BBCA',
    ticker: 'BBCA',
    type: SignalType.BUY,
    confidence: 92,
    timestamp: '2023-10-25T08:30:00', // Pre-market
    entryPrice: 9850,
    stopLoss: 9700,
    targetPrice: 10200,
    predictedReturn: 3.55,
    technicalIndicators: { rsi: 45, ema20: 9800, vwap: 9825 },
    ensembleDetails: {
      lightGBM: 0.89,
      transformer: 0.94,
      sentimentAnalysis: 0.92,
      combinedScore: 0.92
    },
    reasoning: "Strong institutional accumulation detected near VWAP support. Multimodal analysis indicates positive sentiment from recent CEO interview regarding loan growth outlook in Q4. LightGBM and Transformer models both align on a bullish breakout probability.",
    sources: [
      {
        id: 'vid-101',
        type: MediaType.VIDEO,
        title: 'BBCA Q3 Earnings Call & Guidance',
        timestamp: '2023-10-24T14:00:00',
        snippet: "...we are seeing robust demand in the corporate lending sector, outpacing our initial conservative estimates...",
        sentiment: 'POSITIVE',
        relevanceScore: 0.95,
        startTime: '14:32'
      },
      {
        id: 'news-202',
        type: MediaType.NEWS,
        title: 'Analyst upgrades Indonesian Banking Sector',
        timestamp: '2023-10-25T07:30:00',
        snippet: "Mandiri Sekuritas maintains overweight rating on big banks, citing improved NIM.",
        sentiment: 'POSITIVE',
        relevanceScore: 0.82
      }
    ]
  },
  {
    id: 'rec-2023-10-25-GOTO',
    ticker: 'GOTO',
    type: SignalType.SELL,
    confidence: 78,
    timestamp: '2023-10-25T08:30:00',
    entryPrice: 54,
    stopLoss: 56,
    targetPrice: 50,
    predictedReturn: -7.4, // Expected drop
    technicalIndicators: { rsi: 68, ema20: 53, vwap: 54.2 },
    ensembleDetails: {
      lightGBM: 0.82,
      transformer: 0.65,
      sentimentAnalysis: 0.95, // Very confident negative sentiment
      combinedScore: 0.78
    },
    reasoning: "Price action failing to hold above EMA20. Social sentiment analysis shows spike in negative retail sentiment following news of potential regulatory tightening. Transformer model uncertainty is high, but sentiment heavily weights the Sell decision.",
    sources: [
      {
        id: 'soc-505',
        type: MediaType.SOCIAL,
        title: 'Trending Topic: #RegulasiECommerce',
        timestamp: '2023-10-24T21:00:00',
        snippet: "High volume of negative mentions regarding new ministry trade rules impacting platform fees.",
        sentiment: 'NEGATIVE',
        relevanceScore: 0.88
      }
    ]
  },
  {
    id: 'rec-2023-10-25-BRPT',
    ticker: 'BRPT',
    type: SignalType.BUY,
    confidence: 84,
    timestamp: '2023-10-25T08:30:00',
    entryPrice: 1020,
    stopLoss: 980,
    targetPrice: 1150,
    predictedReturn: 12.7,
    technicalIndicators: { rsi: 52, ema20: 1005, vwap: 1010 },
    ensembleDetails: {
      lightGBM: 0.75,
      transformer: 0.88,
      sentimentAnalysis: 0.80,
      combinedScore: 0.84
    },
    liquidityWarning: true,
    reasoning: "Potential breakout detected by Transformer time-series model on Energy sector rotation. Liquidity is lower than top caps, but renewable energy news flow is supporting the momentum.",
    sources: [
      {
        id: 'news-303',
        type: MediaType.NEWS,
        title: 'Indonesia Renewable Energy Plan Update',
        timestamp: '2023-10-24T18:00:00',
        snippet: "Government announces new incentives for geothermal expansion.",
        sentiment: 'POSITIVE',
        relevanceScore: 0.79
      }
    ]
  }
];

export const MOCK_INGESTION_TASKS: IngestionTask[] = [
  { id: 'task-1', source: 'CNBC Indonesia Market Open (YouTube)', type: MediaType.VIDEO, status: 'PROCESSING', progress: 45, details: 'Transcribing audio (Whisper)...' },
  { id: 'task-2', source: 'IDX Corporate Disclosure: ASII', type: MediaType.PDF, status: 'COMPLETED', progress: 100, details: 'Indexed 14 chunks to Vector DB' },
  { id: 'task-3', source: 'Bisnis.com RSS Feed', type: MediaType.NEWS, status: 'COMPLETED', progress: 100, details: 'Ingested 24 articles' },
  { id: 'task-4', source: 'Twitter Stream @IDX_Live', type: MediaType.SOCIAL, status: 'PENDING', progress: 0, details: 'Waiting for slot...' },
];

export const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});