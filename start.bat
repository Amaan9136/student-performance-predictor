@echo off
setlocal enabledelayedexpansion
echo.
echo ============================================================
echo   Student Performance Predictor — Startup Script
echo ============================================================
python --version >nul 2>&1 || (echo ERROR: Python not found! & pause & exit /b)
node -v >nul 2>&1 || (echo ERROR: Node.js not found! & pause & exit /b)
echo.
echo [1/3] Setting up backend...
cd backend
call conda activate base
if not exist .env copy .env.example .env >nul
set BACKEND_MODE=development
for /f "tokens=1,2 delims==" %%A in (.env) do (
  if /i "%%A"=="PROJECT_MODE" set BACKEND_MODE=%%B
)
set BACKEND_MODE=!BACKEND_MODE: =!
echo [INFO] Backend PROJECT_MODE: !BACKEND_MODE!
python seed.py
start "Backend" cmd /k "cd /d %cd% && call conda activate base && python app.py"
cd ..
echo.
echo [2/3] Waiting for backend to boot...
timeout /t 5 >nul
echo.
echo [3/3] Setting up frontend...
cd frontend
if not exist .env (
  echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > .env
  echo PROJECT_MODE=development >> .env
)
set FRONTEND_MODE=development
for /f "tokens=1,2 delims==" %%A in (.env) do (
  if /i "%%A"=="PROJECT_MODE" set FRONTEND_MODE=%%B
)
set FRONTEND_MODE=!FRONTEND_MODE: =!
echo [INFO] Frontend PROJECT_MODE: !FRONTEND_MODE!
if not exist node_modules call npm install --legacy-peer-deps >nul 2>&1
if /i "!FRONTEND_MODE!"=="production" (
  if exist .next rmdir /s /q .next
  call npm run build
  start "Frontend" cmd /k "cd /d %cd% && npm run start"
) else (
  start "Frontend" cmd /k "cd /d %cd% && npm run dev"
)
cd ..
echo.
echo ============================================================
echo   Student Performance Predictor Running
echo ============================================================
echo   Frontend  http://localhost:3000
echo   Backend   http://localhost:5000
echo   Admin     http://localhost:3000/admin
echo ============================================================
pause
