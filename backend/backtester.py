# backend/backtester.py
"""
Backtester for intraday trades with lot constraints, slippage, fees, and manual delay.

Primary class: IntradayBacktester
Methods:
- simulate_trade(....) -> dict with pnl, entry, exit, ret_pct
- run_signals_df(signals_df, market_df, user_config) -> aggregated results
"""
from __future__ import annotations
import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
import logging
logger = logging.getLogger("backtester")
logging.basicConfig(level=logging.INFO)

@dataclass
class BacktestConfig:
    lot_size: int = 100
    commission_pct: float = 0.0005  # e.g., 0.05% per side (configurable)
    sale_tax_pct: float = 0.001     # 0.1% sale tax
    manual_delay_min: int = 1       # default 1-minute delay for manual execution
    slippage_per_lot_pct: float = 0.0002  # baseline slippage per lot as fraction of price
    min_fill_pct: float = 0.5       # acceptable % of lot that must be filled at price

class IntradayBacktester:
    def __init__(self, config: Optional[BacktestConfig] = None):
        self.config = config or BacktestConfig()

    def _find_entry_index(self, market_df: pd.DataFrame, entry_ts):
        # market_df expected sorted ascending by ts
        idx = market_df['ts'].searchsorted(entry_ts)
        return int(idx)

    def simulate_trade(self,
                       market_df: pd.DataFrame,
                       entry_ts: pd.Timestamp,
                       intended_price: float,
                       lots: int,
                       side: str = "BUY",
                       tp_pct: Optional[float] = 0.01,
                       sl_pct: Optional[float] = 0.005) -> Optional[Dict[str,Any]]:
        """
        Simulate executing a trade described at entry_ts, with manual_delay applied.
        market_df: columns ['ts','open','high','low','close','volume'] (volume is shares)
        Returns dict with keys: entry_price, exit_price, pnl (IDR), ret_pct, entry_idx, exit_idx
        """
        cfg = self.config
        if lots <= 0:
            raise ValueError("lots must be > 0")

        idx = self._find_entry_index(market_df, entry_ts)
        # apply manual delay by shifting index forward
        idx += cfg.manual_delay_min
        if idx >= len(market_df):
            logger.debug("Entry index beyond available market data")
            return None
        # naive fill at bar open after manual delay
        entry_row = market_df.iloc[idx]
        # Estimate slippage: proportionate to lots relative to volume of that bar
        bar_volume = max(1.0, entry_row.get('volume', 1.0))
        n_shares = lots * cfg.lot_size
        # slippage model: base + (n_shares / bar_volume) factor
        share_ratio = min(1.0, n_shares / bar_volume)
        slippage_frac = cfg.slippage_per_lot_pct * lots + 0.001 * share_ratio  # small baseline + volume factor
        # direction-specific fill price
        if side.upper() == "BUY":
            entry_price = entry_row['open'] * (1 + slippage_frac)
        else:
            entry_price = entry_row['open'] * (1 - slippage_frac)

        # iterate bars until TP or SL or end of day
        exit_price = None
        exit_idx = None
        for j in range(idx, len(market_df)):
            r = market_df.iloc[j]
            high = r['high']
            low = r['low']
            if side.upper() == "BUY":
                tp_price = entry_price * (1 + tp_pct) if tp_pct else None
                sl_price = entry_price * (1 - sl_pct) if sl_pct else None
                # TP hit first?
                if tp_price is not None and high >= tp_price:
                    exit_price = tp_price
                    exit_idx = j
                    break
                if sl_price is not None and low <= sl_price:
                    exit_price = sl_price
                    exit_idx = j
                    break
            else:
                tp_price = entry_price * (1 - tp_pct) if tp_pct else None
                sl_price = entry_price * (1 + sl_pct) if sl_pct else None
                if tp_price is not None and low <= tp_price:
                    exit_price = tp_price
                    exit_idx = j
                    break
                if sl_price is not None and high >= sl_price:
                    exit_price = sl_price
                    exit_idx = j
                    break
        if exit_price is None:
            # exit at last close
            last = market_df.iloc[-1]
            exit_price = last['close']
            exit_idx = len(market_df)-1

        # compute gross pnl
        if side.upper() == "BUY":
            gross = (exit_price - entry_price) * n_shares
            turnover_entry = entry_price * n_shares
            turnover_exit = exit_price * n_shares
        else:
            gross = (entry_price - exit_price) * n_shares
            turnover_entry = entry_price * n_shares
            turnover_exit = exit_price * n_shares

        # fees
        commission = (turnover_entry + turnover_exit) * cfg.commission_pct
        sale_tax = turnover_exit * cfg.sale_tax_pct  # sale tax on sale only
        net = gross - commission - sale_tax
        ret_pct = net / (turnover_entry if turnover_entry > 0 else 1.0)
        result = {
            "entry_idx": idx,
            "exit_idx": exit_idx,
            "entry_ts": market_df.iloc[idx]['ts'],
            "exit_ts": market_df.iloc[exit_idx]['ts'],
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
        """
        signals_df: columns ['signal_ts','ticker','rec' ('BUY'/'SELL'), 'suggested_lots', 'price']
        Returns a summary DataFrame of results for each simulated trade.
        """
        rows = []
        for _, sig in signals_df.iterrows():
            entry_ts = pd.to_datetime(sig['signal_ts'])
            suggested_lots = int(sig.get('suggested_lots', 1))
            side = sig.get('rec', 'BUY')
            price = float(sig.get('price', 0.0))
            # ensure lot cost <= capital
            lot_cost = suggested_lots * self.config.lot_size * price
            if lot_cost > user_capital:
                logger.info("Skipping signal due to capital constraint: need %s capital, have %s", lot_cost, user_capital)
                continue
            res = self.simulate_trade(market_df, entry_ts, price, suggested_lots, side=side)
            if res is None:
                continue
            res_row = {**sig.to_dict(), **res}
            rows.append(res_row)
        return pd.DataFrame(rows)
