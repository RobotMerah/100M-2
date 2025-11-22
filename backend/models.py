# backend/models.py
import os
import joblib
import logging
import pandas as pd
import numpy as np

logger = logging.getLogger("models")
logging.basicConfig(level=logging.INFO)

try:
    import lightgbm as lgb
except Exception:
    lgb = None
    logger.warning("LightGBM not installed. To train models install lightgbm.")

def train_lgbm(X_train: pd.DataFrame, y_train: pd.Series, params: dict = None, num_boost_round: int = 200):
    if lgb is None:
        raise ImportError("lightgbm not installed")
    default_params = {
        "objective": "binary",
        "metric": "auc",
        "verbosity": -1,
        "boosting_type": "gbdt",
        "learning_rate": 0.05,
        "num_leaves": 31,
        "feature_fraction": 0.9,
        "bagging_fraction": 0.8,
        "bagging_freq": 5,
        "seed": 42
    }
    params = {**default_params, **(params or {})}
    dtrain = lgb.Dataset(X_train, label=y_train)
    model = lgb.train(params, dtrain, num_boost_round=num_boost_round)
    logger.info("LightGBM trained.")
    return model

def predict_lgbm(model, X: pd.DataFrame):
    if lgb is None:
        raise ImportError("lightgbm not installed")
    return model.predict(X)

def save_model(model, path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(model, path)
    logger.info("Saved model to %s", path)

def load_model(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    return joblib.load(path)
