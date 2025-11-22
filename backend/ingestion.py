import os
import requests
import pandas as pd
from datetime import datetime, timedelta

EODHD_API_KEY = os.getenv("6921d2cc04be88.65793865")
BASE_URL = "https://eodhd.com/api"

class EODHDIngestion:

    def __init__(self):
        if not EODHD_API_KEY:
            raise ValueError("EODHD_API_KEY is missing. Put it inside backend/.env")

    def get_daily(self, ticker: str, exchange="IDX", days=30):
        """
        Fetch daily OHLCV data for an IDX stock.
        """
        url = f"{BASE_URL}/eod/{ticker}.{exchange}"
        
        params = {
            "api_token": EODHD_API_KEY,
            "fmt": "json",
        }

        r = requests.get(url, params=params)
        
        if r.status_code != 200:
            raise RuntimeError(f"EODHD request failed: {r.status_code}, {r.text}")

        df = pd.DataFrame(r.json())
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date", ascending=True)

        return df.tail(days)

    def get_intraday(self, ticker: str, interval="5m", exchange="IDX"):
        """
        Fetch intraday data for an IDX stock.
        Allowed: 1m, 5m, 30m, 1h
        """
        url = f"{BASE_URL}/intraday/{ticker}.{exchange}"

        params = {
            "api_token": EODHD_API_KEY,
            "fmt": "json",
            "interval": interval,
        }

        r = requests.get(url, params=params)

        if r.status_code != 200:
            raise RuntimeError(f"EODHD request failed: {r.status_code}, {r.text}")

        df = pd.DataFrame(r.json())
        if df.empty:
            return df
        
        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df.sort_values("datetime")

        return df

    def get_news(self, ticker: str):
        """
        Fetch news articles related to a stock.
        """
        url = f"{BASE_URL}/news"

        params = {
            "api_token": EODHD_API_KEY,
            "s": ticker,
            "limit": 20
        }

        r = requests.get(url, params=params)

        if r.status_code != 200:
            return []

        return r.json()

