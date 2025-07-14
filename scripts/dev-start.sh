#!/bin/bash

PORT=5177
PROJECT_NAME="member-copilot-profile"

echo "🔍 Checking if dev server is already running on port $PORT..."

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $PORT is already in use. Stopping existing process..."
    
    # Kill processes using the port
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    
    # Wait a moment for cleanup
    sleep 2
    
    echo "✅ Existing process terminated"
else
    echo "✅ Port $PORT is available"
fi

echo "🚀 Starting development server..."
npm run dev 