import os
import requests
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Load from .env, never hardcode API keys
EODHD_API_KEY = os.getenv("EODHD_API_KEY")

BASE_URL = "https://eodhd.com/api"

class EODHDIngestion:

    def __init__(self):
        if not EODHD_API_KEY:
            raise ValueError(
                "EODHD_API_KEY is missing. Add it to backend/.env"
            )

    def _fetch(self, url, params):
        """
        Handle retries, rate limits, and JSON errors.
        """
        params["api_token"] = EODHD_API_KEY
        params["fmt"] = "json"

        for _ in range(3):
            try:
                r = requests.get(url, params=params, timeout=10)
                if r.status_code == 429:
                    print("Rate limited → retrying...")
                    time.sleep(3)
                    continue
                r.raise_for_status()
                return r.json()
            except Exception as e:
                print("Retry due to:", e)
                time.sleep(2)

        raise RuntimeError("EODHD request failed after retries.")

    def get_daily(self, ticker, exchange="IDX", days=90):
        url = f"{BASE_URL}/eod/{ticker}.{exchange}"

        data = self._fetch(url, {})
        if not data:
            return pd.DataFrame()

        df = pd.DataFrame(data)
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        return df.sort_values("date").tail(days)

    def get_intraday(self, ticker, interval="5m", exchange="IDX"):
        url = f"{BASE_URL}/intraday/{ticker}.{exchange}"

        raw = self._fetch(url, {"interval": interval})
        if not raw:
            return pd.DataFrame()

        df = pd.DataFrame(raw)
        df["ts"] = pd.to_datetime(df["datetime"], errors="coerce")
        return df.sort_values("ts")

    def get_news(self, ticker):
        url = f"{BASE_URL}/news"
        raw = self._fetch(url, {"s": ticker, "limit": 20})
        return raw if raw else []
