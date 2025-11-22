from __future__ import annotations
import pandas as pd
import numpy as np
from dataclasses import dataclass
import logging

logger = logging.getLogger("backtester")
logging.basicConfig(level=logging.INFO)

@dataclass
class BacktestConfig:
    lot_size: int = 100
    commission_pct: float = 0.0003
    sale_tax_pct: float = 0.001
    slippage_pct: float = 0.0005
    delay_bars: int = 1

class IntradayBacktester:

    def __init__(self, config=None):
        self.config = config or BacktestConfig()

    def _align_ts(self, market_df):
        if "ts" not in market_df.columns:
            if "datetime" in market_df.columns:
                market_df["ts"] = pd.to_datetime(market_df["datetime"])
            else:
                raise ValueError("Market dataframe missing ts/datetime column")
        return market_df

    def simulate(self, df, signal_ts, lots, side, tp_pct=0.01, sl_pct=0.005):

        df = self._align_ts(df)

        cfg = self.config
        idx = df["ts"].searchsorted(pd.to_datetime(signal_ts))
        idx += cfg.delay_bars

        if idx >= len(df):
            return None

        entry_row = df.iloc[idx]
        entry = entry_row["open"] * (1 + cfg.slippage_pct if side=="BUY" else 1 - cfg.slippage_pct)

        for j in range(idx, len(df)):
            r = df.iloc[j]
            high, low = r["high"], r["low"]

            tp = entry * (1 + tp_pct) if side=="BUY" else entry * (1 - tp_pct)
            sl = entry * (1 - sl_pct) if side=="BUY" else entry * (1 + sl_pct)

            if side == "BUY":
                if high >= tp:
                    exit_price = tp; break
                if low <= sl:
                    exit_price = sl; break
            else:
                if low <= tp:
                    exit_price = tp; break
                if high >= sl:
                    exit_price = sl; break
        else:
            exit_price = df.iloc[-1]["close"]
            j = len(df)-1

        n_shares = lots * cfg.lot_size
        gross = (exit_price-entry)*n_shares if side=="BUY" else (entry-exit_price)*n_shares

        commission = (entry*n_shares + exit_price*n_shares)*cfg.commission_pct
        tax = exit_price*n_shares*cfg.sale_tax_pct

        net = gross - commission - tax

        return {
            "entry_price": float(entry),
            "exit_price": float(exit_price),
            "lots": lots,
            "net": float(net),
            "ret_pct": float(net / (entry*n_shares))
        }
