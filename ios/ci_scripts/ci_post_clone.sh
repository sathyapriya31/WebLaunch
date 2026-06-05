#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Xcode Cloud Post-Clone Script ==="

# Navigate to project root
cd ../..
echo "📍 Current directory: $(pwd)"

# Install Node dependencies
if [ -f yarn.lock ]; then
  echo "📦 Installing Node dependencies using yarn..."
  yarn install
elif [ -f package-lock.json ]; then
  echo "📦 Installing Node dependencies using npm..."
  npm ci
else
  echo "📦 Installing Node dependencies..."
  npm install
fi

# Navigate to iOS directory and run pod install
cd ios
echo "📍 Current directory: $(pwd)"
echo "🚀 Running pod install..."
pod install

echo "=== Post-Clone Configuration Complete ==="

 
