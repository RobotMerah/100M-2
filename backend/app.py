# backend/app.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import os
import json

from database import SessionLocal, init_db, PredictionORM, TradeORM, PredictionOutcomeORM
from schemas import PredictionIn, TradeIn, SimulateIn, GenericOut
from ingestion import ingest_and_feature, read_intraday_csv
from backtester import IntradayBacktester, BacktestConfig
from models import save_model, load_model
from evaluate_predictions import evaluate_unscored

# initialize DB (creates sqlite file and tables)
init_db()

app = FastAPI(title="IDX Recommender Backend (SQLite)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/predictions", response_model=GenericOut)
def post_prediction(pred: PredictionIn):
    db = SessionLocal()
    obj = PredictionORM(
        ts=pred.ts or datetime.utcnow(),
        ticker=pred.ticker,
        rec=pred.rec,
        conf=pred.conf,
        price=pred.price,
        meta=pred.meta or {}
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    db.close()
    return {"status":"ok", "id": obj.id}

@app.post("/trades", response_model=GenericOut)
def post_trade(trade: TradeIn):
    db = SessionLocal()
    obj = TradeORM(
        ts=trade.ts or datetime.utcnow(),
        ticker=trade.ticker,
        side=trade.side,
        price=trade.price,
        lots=trade.lots,
        follow_recommendation=trade.follow_recommendation,
        notes=trade.notes
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    db.close()
    return {"status":"ok", "id": obj.id}

@app.post("/simulate", response_model=Dict[str, Any])
def post_simulate(sim: SimulateIn):
    # sim.market_csv_path is path to CSV on server (for now)
    if not os.path.exists(sim.market_csv_path):
        raise HTTPException(status_code=400, detail="market_csv_path not found on server")
    market_df = read_intraday_csv(sim.market_csv_path)
    bt = IntradayBacktester(BacktestConfig(
        lot_size=sim.lot_size,
        commission_pct=sim.commission_pct,
        sale_tax_pct=sim.sale_tax_pct,
        manual_delay_min=sim.manual_delay_min,
        slippage_per_lot_pct=sim.slippage_per_lot_pct
    ))
    results = bt.run_signals_df(sim.signals_df(), market_df, sim.user_capital)
    # return simple aggregates
    return {"n_trades": len(results), "results": results.to_dict(orient="records")}

@app.get("/metrics")
def get_metrics():
    db = SessionLocal()
    total_preds = db.query(PredictionORM).count()
    total_trades = db.query(TradeORM).count()
    total_outcomes = db.query(PredictionOutcomeORM).count()
    db.close()
    return {"predictions": total_preds, "trades": total_trades, "outcomes": total_outcomes}

@app.post("/evaluate", response_model=GenericOut)
def schedule_evaluate(background_tasks: BackgroundTasks):
    # run evaluator in background
    background_tasks.add_task(evaluate_unscored)
    return {"status":"evaluation_started"}
