# backend/backtester.py
from __future__ import annotations
import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import Optional, Dict, Any
import logging
logger = logging.getLogger("backtester")
logging.basicConfig(level=logging.INFO)

@dataclass
class BacktestConfig:
    lot_size: int = 100
    commission_pct: float = 0.0005
    sale_tax_pct: float = 0.001
    manual_delay_min: int = 1
    slippage_per_lot_pct: float = 0.0002
    min_fill_pct: float = 0.5

class IntradayBacktester:
    def __init__(self, config: Optional[BacktestConfig] = None):
        self.config = config or BacktestConfig()

    def _find_entry_index(self, market_df: pd.DataFrame, entry_ts):
        idx = market_df['ts'].searchsorted(entry_ts)
        return int(idx)

    def simulate_trade(self,
                       market_df: pd.DataFrame,
                       entry_ts: pd.Timestamp,
                       intended_price: float,
                       lots: int,
                       side: str = "BUY",
                       tp_pct: Optional[float] = 0.01,
                       sl_pct: Optional[float] = 0.005):
        cfg = self.config
        if lots <= 0:
            raise ValueError("lots must be > 0")
        idx = self._find_entry_index(market_df, entry_ts)
        idx += cfg.manual_delay_min
        if idx >= len(market_df):
            logger.debug("Entry index beyond available market data")
            return None
        entry_row = market_df.iloc[idx]
        bar_volume = max(1.0, entry_row.get('volume', 1.0))
        n_shares = lots * cfg.lot_size
        share_ratio = min(1.0, n_shares / bar_volume)
        slippage_frac = cfg.slippage_per_lot_pct * lots + 0.001 * share_ratio
        if side.upper() == "BUY":
            entry_price = entry_row['open'] * (1 + slippage_frac)
        else:
            entry_price = entry_row['open'] * (1 - slippage_frac)
        exit_price = None
        exit_idx = None
        for j in range(idx, len(market_df)):
            r = market_df.iloc[j]
            high = r['high']
            low = r['low']
            if side.upper() == "BUY":
                tp_price = entry_price * (1 + tp_pct) if tp_pct else None
                sl_price = entry_price * (1 - sl_pct) if sl_pct else None
                if tp_price is not None and high >= tp_price:
                    exit_price = tp_price; exit_idx = j; break
                if sl_price is not None and low <= sl_price:
                    exit_price = sl_price; exit_idx = j; break
            else:
                tp_price = entry_price * (1 - tp_pct) if tp_pct else None
                sl_price = entry_price * (1 + sl_pct) if sl_pct else None
                if tp_price is not None and low <= tp_price:
                    exit_price = tp_price; exit_idx = j; break
                if sl_price is not None and high >= sl_price:
                    exit_price = sl_price; exit_idx = j; break
        if exit_price is None:
            last = market_df.iloc[-1]
            exit_price = last['close']; exit_idx = len(market_df)-1
        if side.upper() == "BUY":
            gross = (exit_price - entry_price) * n_shares
        else:
            gross = (entry_price - exit_price) * n_shares
        turnover_entry = entry_price * n_shares
        turnover_exit = exit_price * n_shares
        commission = (turnover_entry + turnover_exit) * cfg.commission_pct
        sale_tax = turnover_exit * cfg.sale_tax_pct
        net = gross - commission - sale_tax
        ret_pct = net / (turnover_entry if turnover_entry > 0 else 1.0)
        result = {
            "entry_idx": idx,
            "exit_idx": exit_idx,
            "entry_ts": str(market_df.iloc[idx]['ts']),
            "exit_ts": str(market_df.iloc[exit_idx]['ts']),
            "entry_price": float(entry_price),
            "exit_price": float(exit_price),
            "lots": lots,
            "n_shares": n_shares,
            "gross": float(gross),
            "commission": float(commission),
            "sale_tax": float(sale_tax),
            "net_pnl": float(net),
            "ret_pct": float(ret_pct)
        }
        return result

    def run_signals_df(self, signals_df: pd.DataFrame, market_df: pd.DataFrame, user_capital: float) -> pd.DataFrame:
        rows = []
        for _, sig in signals_df.iterrows():
            entry_ts = pd.to_datetime(sig['signal_ts'])
            suggested_lots = int(sig.get('suggested_lots', 1))
            side = sig.get('rec', 'BUY')
            price = float(sig.get('price', 0.0))
            lot_cost = suggested_lots * self.config.lot_size * price
            if lot_cost > user_capital:
                continue
            res = self.simulate_trade(market_df, entry_ts, price, suggested_lots, side=side)
            if res is None:
                continue
            res_row = {**sig.to_dict(), **res}
            rows.append(res_row)
        return pd.DataFrame(rows)
