# Student Performance Predictor

ML-powered academic analytics platform — Next.js 15 + Flask + MongoDB + Ollama (LLM).

## Quick Start

### Option A — Windows (Double-click)
```
start.bat
```

### Option B — Manual

**Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python seed.py
python app.py
```

**Frontend**
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
npm run dev
```

## URLs
| Service  | URL                              |
|----------|----------------------------------|
| Frontend | http://localhost:3000            |
| Backend  | http://localhost:5000            |
| Admin    | http://localhost:3000/admin      |

## Default Credentials
| Role    | Username  | Password    |
|---------|-----------|-------------|
| Admin   | admin     | admin123    |
| Faculty | faculty1  | faculty123  |
| Faculty | register new account at /auth/register | — |

## Ollama Setup (AI Advice)
```bash
# Install Ollama from https://ollama.ai
ollama pull mistral-large-3:675b-cloud
# Ollama runs at http://localhost:11434 by default
```

## Project Structure
```
student-performance-predictor/
├── backend/
│   ├── app.py              ← Flask entry point
│   ├── config.py           ← Env config
│   ├── seed.py             ← DB seeder
│   ├── requirements.txt
│   ├── models/             ← PyMongo collections
│   ├── routes/             ← API blueprints
│   ├── middleware/         ← JWT auth
│   ├── ml/
│   │   ├── predictor.py    ← RandomForest model
│   │   └── ollama_client.py← LLM integration
│   └── utils/
├── frontend/
│   ├── app/                ← Next.js App Router pages
│   ├── components/         ← Shared UI & layout
│   ├── stores/             ← Zustand state
│   ├── services/           ← Axios API layer
│   └── hooks/              ← Custom React hooks
├── start.bat               ← Windows startup
├── clean_cache.py          ← Cache cleaner
└── README.md
```

## ML Model
- **Algorithm**: RandomForestRegressor (scikit-learn)
- **Fallback**: LinearRegression when < 20 samples
- **Features**: Attendance (%), Avg Internal Marks, Assignment Score
- **Output**: Predicted % → Grade (A/B/C/D/F) + Risk Level (low/medium/high)
- **Bootstrap**: 200 synthetic samples generated on first run
- **Model file**: `backend/ml/model.pkl`

## Grade Scale
| Grade | Score   |
|-------|---------|
| A     | ≥ 75%   |
| B     | 60–74%  |
| C     | 50–59%  |
| D     | 40–49%  |
| F     | < 40%   |

## Environment Variables

**`backend/.env`**
```
MONGO_URI=mongodb://localhost:27017/student-performance
JWT_SECRET=changethisinproduction
JWT_EXPIRY=86400
PROJECT_MODE=development
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral-large-3:675b-cloud
PORT=5000
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Reset
```bash
python clean_cache.py
```
