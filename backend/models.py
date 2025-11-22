# backend/models.py
"""
Model utilities: LightGBM train/predict wrappers + basic calibration helpers.

Functions/classes:
- train_lgbm(X_train, y_train, params=None, num_boost_round=100)
- predict_lgbm(model, X)
- save_model(model, path)
- load_model(path)
- calibrate_probs_isotonic(probs, y_true) -> returns sklearn IsotonicRegression model and calibration plot data
"""

from __future__ import annotations
import os
import joblib
import numpy as np
import pandas as pd
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger("models")
logging.basicConfig(level=logging.INFO)

# Optional import LightGBM if installed; if not, instruct user to pip install lightgbm
try:
    import lightgbm as lgb
except Exception as e:
    lgb = None
    logger.warning("lightgbm not available. Install with `pip install lightgbm` to enable training.")

def train_lgbm(X_train: pd.DataFrame, y_train: pd.Series, params: Optional[Dict[str,Any]] = None, num_boost_round: int = 200):
    if lgb is None:
        raise ImportError("lightgbm is not installed. pip install lightgbm")
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
    logger.info("Trained LightGBM model.")
    return model

def predict_lgbm(model, X: pd.DataFrame) -> np.ndarray:
    if lgb is None:
        raise ImportError("lightgbm is not installed.")
    return model.predict(X)

def save_model(model, path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(model, path)
    logger.info("Saved model to %s", path)

def load_model(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    return joblib.load(path)

# Basic calibration helper (isotonic)
def calibrate_probs_isotonic(probs: np.ndarray, y_true: np.ndarray):
    from sklearn.isotonic import IsotonicRegression
    ir = IsotonicRegression(out_of_bounds='clip')
    ir.fit(probs, y_true)
    return ir

# Quick convenience function that returns feature importance if model is LGBM
def feature_importance(model):
    if lgb is None:
        return None
    try:
        fi = model.feature_importance(importance_type='gain')
        names = model.feature_name()
        return dict(zip(names, fi))
    except Exception:
        return None
