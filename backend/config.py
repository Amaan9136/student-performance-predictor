import os
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/student-performance')
JWT_SECRET = os.getenv('JWT_SECRET', 'supersecret_change_in_prod')
JWT_EXPIRY = int(os.getenv('JWT_EXPIRY_DAYS', 30)) * 86400
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3.2')
PROJECT_MODE = os.getenv('PROJECT_MODE', 'development').strip().lower()
IS_PROD = PROJECT_MODE == 'production'
