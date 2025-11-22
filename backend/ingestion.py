# backend/ingestion.py
"""
Ingestion utilities for market and media data.

Functions:
- read_intraday_csv(path) -> pd.DataFrame
- fetch_intraday_from_api(symbol, start, end, api_config) -> pd.DataFrame
- compute_technical_indicators(df) -> pd.DataFrame (adds VWAP, EMA8, EMA21, ATR14, RSI14)
- load_media_text(path_or_url) -> str
- chunk_text(text, chunk_size=800, overlap=100) -> list[str]
- save_features(df, out_path)
"""
from __future__ import annotations
import pandas as pd
import numpy as np
import requests
import os
import math
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger("ingestion")
logging.basicConfig(level=logging.INFO)

def read_intraday_csv(path: str, time_col: str = "ts") -> pd.DataFrame:
    """
    Read intraday CSV expected columns: ts, open, high, low, close, volume
    ts should be parseable to datetime. Returns sorted DataFrame.
    """
    df = pd.read_csv(path)
    if time_col not in df.columns:
        raise ValueError(f"{time_col} not in CSV columns: {df.columns.tolist()}")
    df[time_col] = pd.to_datetime(df[time_col])
    df = df.sort_values(time_col).reset_index(drop=True)
    # normalize columns
    required = {"open", "high", "low", "close", "volume"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in CSV: {missing}")
    return df

def fetch_intraday_from_api(symbol: str, start: datetime, end: datetime, api_config: Dict[str,Any]) -> pd.DataFrame:
    """
    Fetch intraday data from a simple REST API that returns JSON array of bars.
    api_config: { 'url': 'https://...', 'params': {...}, 'headers': {...} }
    This is a generic connector — adapt to your data provider.
    """
    url = api_config.get("url")
    headers = api_config.get("headers", {})
    params = api_config.get("params", {}).copy()
    params.update({"symbol": symbol, "start": int(start.timestamp()), "end": int(end.timestamp())})
    resp = requests.get(url, params=params, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    # Expecting list of dicts: {ts, open, high, low, close, volume}
    df = pd.DataFrame(data)
    if "ts" in df.columns:
        df["ts"] = pd.to_datetime(df["ts"], unit='s', utc=True).dt.tz_convert(None)
    return df.sort_values("ts").reset_index(drop=True)

def _ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()

def _true_range(df: pd.DataFrame) -> pd.Series:
    # TR = max(high-low, abs(high - prev_close), abs(low - prev_close))
    prev_close = df["close"].shift(1)
    tr1 = df["high"] - df["low"]
    tr2 = (df["high"] - prev_close).abs()
    tr3 = (df["low"] - prev_close).abs()
    return pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

def compute_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds VWAP, EMA8, EMA21, ATR14, RSI14 to df.
    Expects columns: ts, open, high, low, close, volume.
    Returns new DataFrame (copy).
    """
    df = df.copy()
    if "volume" not in df.columns:
        df["volume"] = 0.0
    # VWAP (cumulative VWAP over the session is typical; here we compute rolling VWAP per row)
    typical_price = (df["high"] + df["low"] + df["close"]) / 3
    pv = typical_price * df["volume"]
    # rolling VWAP with expanding window - but intraday you'd want session reset; user can adjust
    # We'll compute rolling VWAP with window = 20 by default for intraday
    window = min(20, max(1, len(df)//10))
    df["vwap"] = (pv.rolling(window=window).sum() / df["volume"].rolling(window=window).sum()).fillna(method="bfill")

    df["ema8"] = _ema(df["close"], span=8)
    df["ema21"] = _ema(df["close"], span=21)

    # ATR(14)
    tr = _true_range(df)
    df["atr14"] = tr.rolling(window=14, min_periods=1).mean()

    # RSI(14)
    delta = df["close"].diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    roll_up = up.rolling(14, min_periods=1).mean()
    roll_down = down.rolling(14, min_periods=1).mean()
    rs = roll_up / (roll_down.replace(0, np.nan))
    df["rsi14"] = 100 - (100 / (1 + rs)).fillna(50)

    # small safety fill
    df = df.fillna(method="ffill").fillna(method="bfill").fillna(0)
    return df

def load_media_text(path_or_url: str, timeout: int = 20) -> str:
    """
    Load news/article/transcript text. Accepts local file path or http(s) URL.
    For large files you probably want to stream or chunk; this is a simple helper.
    """
    if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
        try:
            resp = requests.get(path_or_url, timeout=timeout)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            logger.exception("Failed to fetch URL: %s", path_or_url)
            return ""
    else:
        if not os.path.exists(path_or_url):
            logger.warning("Local file not found: %s", path_or_url)
            return ""
        with open(path_or_url, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """
    Simple whitespace chunker. Returns list of chunks sized ~chunk_size tokens/characters.
    """
    if not text:
        return []
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i+chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
    return chunks

def save_features(df: pd.DataFrame, out_path: str):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    df.to_csv(out_path, index=False)
    logger.info("Saved features to %s", out_path)

# Example convenience pipeline
def ingest_and_feature(path_or_api: str, is_csv: bool = True, **kwargs) -> pd.DataFrame:
    """
    Convenience: read source, compute indicators and return df.
    If is_csv True then path_or_api is a CSV path for intraday bars.
    Otherwise treat as REST API config dict (path_or_api is ignored).
    """
    if is_csv:
        df = read_intraday_csv(path_or_api)
    else:
        # example, user passes api_config dict in kwargs
        api_config = kwargs.get("api_config")
        symbol = kwargs.get("symbol")
        start = kwargs.get("start")
        end = kwargs.get("end")
        df = fetch_intraday_from_api(symbol, start, end, api_config)
    df = compute_technical_indicators(df)
    return df
