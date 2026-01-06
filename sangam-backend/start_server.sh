#!/bin/bash
# Start script for Sangam Backend

cd "$(dirname "$0")"
source ../venv/bin/activate

echo "🚀 Starting Sangam Backend..."
echo "📍 Backend will be available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000

