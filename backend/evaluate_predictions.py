# backend/evaluate_predictions.py
"""
Simple evaluator: finds predictions without outcomes and computes next-N-minute return
based on a provided market CSV per ticker (expects CSVs in backend/sample_data/<TICKER>.csv)
Adapt this to your market data provider for live use.
"""
import os
from database import SessionLocal, PredictionORM, PredictionOutcomeORM
from ingestion import read_intraday_csv
from datetime import timedelta
import pandas as pd
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("evaluator")

SAMPLE_DATA_DIR = os.path.join(os.path.dirname(__file__), "sample_data")

def evaluate_unscored(horizon_min: int = 60):
    db = SessionLocal()
    # find predictions without outcome
    preds = db.query(PredictionORM).all()
    for p in preds:
        has = db.query(PredictionOutcomeORM).filter(PredictionOutcomeORM.prediction_id == p.id).first()
        if has:
            continue
        # attempt to find market CSV for ticker
        csv_path = os.path.join(SAMPLE_DATA_DIR, f"{p.ticker}.csv")
        if not os.path.exists(csv_path):
            logger.info("No sample market file for %s at %s", p.ticker, csv_path)
            continue
        df = read_intraday_csv(csv_path)
        # find price at p.ts and price at p.ts + horizon_min
        start_ts = p.ts
        end_ts = p.ts + timedelta(minutes=horizon_min)
        # ensure ts column is datetime
        df['ts'] = pd.to_datetime(df['ts'])
        window = df[(df['ts'] >= start_ts) & (df['ts'] <= end_ts)]
        if window.empty:
            logger.info("No intraday window for %s at %s", p.ticker, p.ts)
            continue
        entry_price = p.price
        exit_price = window.iloc[-1]['close']
        ret = (exit_price - entry_price) / entry_price
        if p.rec.upper() == "BUY":
            success = ret > 0
        elif p.rec.upper() == "SELL":
            success = ret < 0
        else:
            success = abs(ret) < 0.001
        outcome = PredictionOutcomeORM(prediction_id=p.id, returned=ret, success=success)
        db.add(outcome)
        db.commit()
        logger.info("Evaluated prediction %s: ret=%.5f success=%s", p.id, ret, success)
    db.close()

if __name__ == "__main__":
    evaluate_unscored()
