# backend/ingestion.py
from __future__ import annotations
import pandas as pd
import numpy as np
import os
import requests
import logging
from datetime import datetime
from typing import Dict, Any, List

logger = logging.getLogger("ingestion")
logging.basicConfig(level=logging.INFO)

def read_intraday_csv(path: str, time_col: str = "ts") -> pd.DataFrame:
    df = pd.read_csv(path)
    if time_col not in df.columns:
        raise ValueError(f"{time_col} not in CSV columns: {df.columns.tolist()}")
    df[time_col] = pd.to_datetime(df[time_col])
    df = df.sort_values(time_col).reset_index(drop=True)
    required = {"open", "high", "low", "close", "volume"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in CSV: {missing}")
    return df

def _ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()

def _true_range(df: pd.DataFrame) -> pd.Series:
    prev_close = df["close"].shift(1)
    tr1 = df["high"] - df["low"]
    tr2 = (df["high"] - prev_close).abs()
    tr3 = (df["low"] - prev_close).abs()
    return pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

def compute_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "volume" not in df.columns:
        df["volume"] = 0.0
    typical_price = (df["high"] + df["low"] + df["close"]) / 3
    pv = typical_price * df["volume"]
    window = min(20, max(1, len(df)//10))
    df["vwap"] = (pv.rolling(window=window).sum() / df["volume"].rolling(window=window).sum()).fillna(method="bfill")
    df["ema8"] = _ema(df["close"], span=8)
    df["ema21"] = _ema(df["close"], span=21)
    tr = _true_range(df)
    df["atr14"] = tr.rolling(window=14, min_periods=1).mean()
    delta = df["close"].diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    roll_up = up.rolling(14, min_periods=1).mean()
    roll_down = down.rolling(14, min_periods=1).mean()
    rs = roll_up / (roll_down.replace(0, np.nan))
    df["rsi14"] = 100 - (100 / (1 + rs)).fillna(50)
    df = df.fillna(method="ffill").fillna(method="bfill").fillna(0)
    return df

def ingest_and_feature(csv_path: str) -> pd.DataFrame:
    df = read_intraday_csv(csv_path)
    df = compute_technical_indicators(df)
    return df
