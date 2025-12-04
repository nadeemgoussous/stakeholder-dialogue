#!/bin/bash

# Scenario Dialogue Tool - Development Server Startup
# This script initializes and runs the development environment

echo "🚀 Initializing Scenario Dialogue Tool..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
else
  echo "✓ Dependencies already installed"
fi

# Start the development server
echo "🌐 Starting development server..."
npm run dev
