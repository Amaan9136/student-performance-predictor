import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

def _grade(score):
    if score >= 75: return 'A'
    if score >= 60: return 'B'
    if score >= 50: return 'C'
    if score >= 40: return 'D'
    return 'F'

def _risk(score):
    if score >= 60: return 'low'
    if score >= 45: return 'medium'
    return 'high'

def _synthetic_data():
    np.random.seed(42)
    n = 200
    attendance = np.random.normal(72, 15, n).clip(30, 100)
    avg_internal = np.random.normal(65, 18, n).clip(20, 100)
    assignment = np.random.normal(68, 16, n).clip(20, 100)
    score = (attendance * 0.35 + avg_internal * 0.40 + assignment * 0.25 + np.random.normal(0, 5, n)).clip(0, 100)
    return np.column_stack([attendance, avg_internal, assignment]), score

def train(samples=None):
    if samples and len(samples) >= 20:
        X = np.array([[s['attendance'], s['avg_internal'], s['assignment_score']] for s in samples])
        y = np.array([s['final_score'] for s in samples])
        model = RandomForestRegressor(n_estimators=100, random_state=42)
    else:
        X, y = _synthetic_data()
        if samples and len(samples) > 0:
            Xr = np.array([[s['attendance'], s['avg_internal'], s['assignment_score']] for s in samples])
            yr = np.array([s['final_score'] for s in samples])
            X = np.vstack([X, Xr])
            y = np.concatenate([y, yr])
        model = RandomForestRegressor(n_estimators=100, random_state=42) if len(samples or []) >= 5 else LinearRegression()
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    return model

def _load_or_train():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return train()

def predict(attendance, avg_internal, assignment_score):
    model = _load_or_train()
    X = np.array([[float(attendance), float(avg_internal), float(assignment_score)]])
    raw = float(model.predict(X)[0])
    score = round(max(0, min(100, raw)), 2)
    return {'score': score, 'grade': _grade(score), 'risk': _risk(score)}
