#!/bin/sh

# Prevent CocoaPods from running as root
export COCOAPODS_ALLOW_ROOT=1

# Install Node.js (via Homebrew, pre-installed on Xcode Cloud)
brew install node

# Go to repository root and install JavaScript dependencies
cd ../..
npm install # or yarn install if using yarn

# Go back to ios directory and install CocoaPods
cd ios
pod install