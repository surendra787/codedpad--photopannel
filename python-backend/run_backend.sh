#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================================"
echo "  CodedPad - Automated FastAPI Backend Setup & Runner"
echo "========================================================"

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 could not be found. Please install Python 3."
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "[1/3] Creating virtual environment (venv)..."
    python3 -m venv venv
fi

echo "[2/3] Activating virtual environment..."
source venv/bin/activate

echo "[3/3] Installing dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

echo "========================================================"
echo "  Backend is Ready!"
echo "  Swagger UI: http://127.0.0.1:8000/docs"
echo "  Health API: http://127.0.0.1:8000/api/health"
echo "========================================================"

uvicorn main:app --reload --host 127.0.0.1 --port 8000
