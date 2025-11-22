# backend/database.py
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DB_DIR, exist_ok=True)
SQLITE_PATH = os.path.join(DB_DIR, "db.sqlite3")
DATABASE_URL = f"sqlite:///{SQLITE_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PredictionORM(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    ts = Column(DateTime, default=datetime.utcnow, index=True)
    ticker = Column(String, index=True)
    rec = Column(String)
    conf = Column(Float)
    price = Column(Float)
    meta = Column(JSON, default={})

class TradeORM(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, index=True)
    ts = Column(DateTime, default=datetime.utcnow, index=True)
    ticker = Column(String, index=True)
    side = Column(String)
    price = Column(Float)
    lots = Column(Integer)
    follow_recommendation = Column(Boolean, default=False)
    notes = Column(String, nullable=True)

class PredictionOutcomeORM(Base):
    __tablename__ = "prediction_outcomes"
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, index=True)
    returned = Column(Float)
    success = Column(Boolean)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
