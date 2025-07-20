#!/bin/bash

# Live API Test Setup Script - Phase 3D
# This script helps set up the environment for testing with live OpenAI API

echo "🔧 Setting up Live API Testing Environment"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    touch .env
    echo "# OpenAI API Configuration" >> .env
    echo "VITE_OPENAI_API_KEY=" >> .env
    echo "ENABLE_LIVE_API_TESTS=false" >> .env
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Check if API key is set
if [ -z "$VITE_OPENAI_API_KEY" ]; then
    echo "⚠️  VITE_OPENAI_API_KEY not set in environment"
    echo "📝 Please add your OpenAI API key to .env file:"
    echo "   VITE_OPENAI_API_KEY=your_api_key_here"
    echo ""
    echo "🔗 Get your API key from: https://platform.openai.com/api-keys"
else
    echo "✅ VITE_OPENAI_API_KEY is set"
fi

# Enable live API tests
echo "🔧 Enabling live API tests..."
export ENABLE_LIVE_API_TESTS=true
echo "ENABLE_LIVE_API_TESTS=true" >> .env

echo ""
echo "🚀 Live API Testing Setup Complete!"
echo "=================================="
echo ""
echo "To run live API tests:"
echo "1. Add your OpenAI API key to .env file"
echo "2. Run: npm test -- src/services/ai/external/__tests__/LiveAPIIntegration.test.ts"
echo ""
echo "To run all tests (including live API tests):"
echo "   npm test -- src/services/ai/external/__tests__/"
echo ""
echo "To run only unit tests (without live API):"
echo "   npm test -- --testPathIgnorePatterns=LiveAPIIntegration.test.ts"
echo ""
echo "💡 Tips:"
echo "- Live API tests will be skipped if API key is not set"
echo "- Tests have longer timeouts (30 seconds) for API calls"
echo "- Results include timing information for performance analysis"
echo "- Failed API calls are logged with detailed error information" 