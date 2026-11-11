@echo off
echo ========================================================
echo   CodedPad - Automated FastAPI Backend Setup & Runner
echo ========================================================
echo.

cd /d "%~dp0"

REM 1. Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH!
    echo Please download and install Python from https://www.python.org/
    echo Make sure to check "Add python.exe to PATH" during installation.
    pause
    exit /b 1
)

REM 2. Create virtual environment if it does not exist
if not exist "venv\Scripts\activate.bat" (
    echo [1/3] Creating virtual environment (.venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo [Virtual Environment Created Successfully]
)

REM 3. Activate virtual environment
echo [2/3] Activating virtual environment...
call venv\Scripts\activate.bat

REM 4. Install / Update packages
echo [3/3] Installing dependencies from requirements.txt...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install packages!
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   Backend is Ready!
echo   Swagger UI: http://127.0.0.1:8000/docs
echo   Health API: http://127.0.0.1:8000/api/health
echo ========================================================
echo.

uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
