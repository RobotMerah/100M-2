import os
import joblib
import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("models")
logging.basicConfig(level=logging.INFO)

try:
    import lightgbm as lgb
except Exception:
    lgb = None
    logger.warning("LightGBM not installed. Install with: pip install lightgbm")

MODEL_DIR = "backend/model_store"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_lgbm(X_train, y_train, params=None, num_rounds=250):

    if lgb is None:
        raise ImportError("LightGBM not installed")

    default_params = {
        "objective": "binary",
        "metric": ["auc", "binary_logloss"],
        "learning_rate": 0.03,
        "num_leaves": 32,
        "feature_fraction": 0.9,
        "bagging_fraction": 0.8,
        "bagging_freq": 6,
        "verbosity": -1,
        "seed": 42,
    }

    final_params = {**default_params, **(params or {})}

    train_data = lgb.Dataset(X_train, label=y_train)

    model = lgb.train(
        params=final_params,
        train_set=train_data,
        num_boost_round=num_rounds
    )

    logger.info("Model trained successfully.")
    return model

def predict_lgbm(model, X):
    if lgb is None:
        raise ImportError("LightGBM not installed")
    return model.predict(X)

def save_model(model, name="lgbm_model.pkl"):
    path = f"{MODEL_DIR}/{name}"
    joblib.dump(model, path)
    logger.info(f"Saved model to {path}")

def load_model(name="lgbm_model.pkl"):
    path = f"{MODEL_DIR}/{name}"
    if not os.path.exists(path):
        raise FileNotFoundError(f"No model file at {path}")
    return joblib.load(path)
