@echo off
echo Starting Face Attendance System...

:: 1. Start Backend API
start "Backend API" cmd /k "python -m api.main"

:: 2. Start Frontend
cd frontend
start "Frontend Dashboard" cmd /k "npm run dev"
cd ..

:: 3. Start Recognition System
echo Waiting for API to initialize...
timeout /t 5
start "Recognition System" cmd /k "python scripts/run_system.py"

echo.
echo ========================================================
echo SYSTEM STARTED
echo 1. Backend: http://localhost:8000
echo 2. Frontend: http://localhost:3000
echo 3. Recognition: Camera Window
echo ========================================================
echo.
pause
