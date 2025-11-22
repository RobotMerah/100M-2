# backend/schemas.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List
import pandas as pd
import json

class PredictionIn(BaseModel):
    ticker: str
    rec: str
    conf: float = Field(..., ge=0.0, le=1.0)
    price: float
    ts: Optional[datetime] = None
    meta: Optional[Dict[str, Any]] = None

class TradeIn(BaseModel):
    ticker: str
    side: str
    price: float
    lots: int
    ts: Optional[datetime] = None
    follow_recommendation: bool = False
    notes: Optional[str] = None

class SimulateSignal(BaseModel):
    signal_ts: datetime
    ticker: str
    rec: str
    suggested_lots: int
    price: float

class SimulateIn(BaseModel):
    signals: List[SimulateSignal]
    market_csv_path: str
    user_capital: float = 100000.0
    lot_size: int = 100
    commission_pct: float = 0.0005
    sale_tax_pct: float = 0.001
    manual_delay_min: int = 1
    slippage_per_lot_pct: float = 0.0002

    def signals_df(self):
        rows = []
        for s in self.signals:
            rows.append({
                "signal_ts": s.signal_ts,
                "ticker": s.ticker,
                "rec": s.rec,
                "suggested_lots": s.suggested_lots,
                "price": s.price
            })
        import pandas as pd
        return pd.DataFrame(rows)

class GenericOut(BaseModel):
    status: str
    id: Optional[int] = None
