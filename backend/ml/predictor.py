import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')
DATA_DIR = os.path.join(BASE_DIR, 'data')
FULL_PATH = os.path.join(DATA_DIR, 'full_data.csv')
TRAIN_PATH = os.path.join(DATA_DIR, 'train_data.csv')
TEST_PATH = os.path.join(DATA_DIR, 'test_data.csv')

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

def _save_splits(data):
    os.makedirs(DATA_DIR, exist_ok=True)
    np.savetxt(FULL_PATH, data, delimiter=',')
    idx = np.arange(len(data))
    np.random.shuffle(idx)
    split = int(len(data) * 0.8)
    train_idx, test_idx = idx[:split], idx[split:]
    np.savetxt(TRAIN_PATH, data[train_idx], delimiter=',')
    np.savetxt(TEST_PATH, data[test_idx], delimiter=',')
    return train_idx, test_idx

def _synthetic_data():
    np.random.seed(42)
    n = 200
    attendance = np.random.normal(72, 15, n).clip(30, 100)
    avg_internal = np.random.normal(65, 18, n).clip(20, 100)
    assignment = np.random.normal(68, 16, n).clip(20, 100)
    score = (attendance * 0.35 + avg_internal * 0.40 + assignment * 0.25 + np.random.normal(0, 5, n)).clip(0, 100)
    X = np.column_stack([attendance, avg_internal, assignment])
    data = np.column_stack([X, score])
    _save_splits(data)
    return X, score

def train(samples=None):
    if samples and len(samples) >= 20:
        X = np.array([[s['attendance'], s['avg_internal'], s['assignment_score']] for s in samples])
        y = np.array([s['final_score'] for s in samples])
        data = np.column_stack([X, y])
        _save_splits(data)
        model = RandomForestRegressor(n_estimators=100, random_state=42)
    else:
        X, y = _synthetic_data()
        if samples and len(samples) > 0:
            Xr = np.array([[s['attendance'], s['avg_internal'], s['assignment_score']] for s in samples])
            yr = np.array([s['final_score'] for s in samples])
            X = np.vstack([X, Xr])
            y = np.concatenate([y, yr])
            data = np.column_stack([X, y])
            _save_splits(data)
        model = RandomForestRegressor(n_estimators=100, random_state=42) if len(samples or []) >= 5 else LinearRegression()
    if os.path.exists(TRAIN_PATH):
        train_data = np.loadtxt(TRAIN_PATH, delimiter=',')
        if len(train_data) > 0:
            X = train_data[:, :3]
            y = train_data[:, 3]
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

def get_viz_data():
    result = {'train': [], 'test': [], 'full': []}
    if os.path.exists(TRAIN_PATH):
        d = np.loadtxt(TRAIN_PATH, delimiter=',')
        if d.ndim == 1: d = d.reshape(1, -1)
        result['train'] = [{'attendance': float(r[0]), 'avg_internal': float(r[1]), 'assignment_score': float(r[2]), 'score': float(r[3])} for r in d]
    if os.path.exists(TEST_PATH):
        d = np.loadtxt(TEST_PATH, delimiter=',')
        if d.ndim == 1: d = d.reshape(1, -1)
        result['test'] = [{'attendance': float(r[0]), 'avg_internal': float(r[1]), 'assignment_score': float(r[2]), 'score': float(r[3])} for r in d]
    if os.path.exists(FULL_PATH):
        d = np.loadtxt(FULL_PATH, delimiter=',')
        if d.ndim == 1: d = d.reshape(1, -1)
        result['full'] = [{'attendance': float(r[0]), 'avg_internal': float(r[1]), 'assignment_score': float(r[2]), 'score': float(r[3])} for r in d]
    return result