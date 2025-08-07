#!/bin/bash

# TournaMind Code Cleanup Script
# This script helps maintain clean code by running various cleanup tasks

echo "🧹 Starting TournaMind code cleanup..."

# 1. Remove node_modules and reinstall for fresh dependencies
echo "📦 Cleaning node_modules..."
rm -rf node_modules package-lock.json
npm install

# 2. Run linting with auto-fix where possible
echo "🔍 Running ESLint with auto-fix..."
npm run lint -- --fix 2>/dev/null || true

# 3. Check for unused dependencies
echo "📊 Checking for unused dependencies..."
npx depcheck --ignore-bins

# 4. Format code with Prettier (if available)
echo "🎨 Formatting code..."
npx prettier --write "src/**/*.{ts,tsx,js,jsx}" 2>/dev/null || echo "Prettier not configured"

# 5. Run TypeScript check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit

echo "✅ Cleanup complete! Check the output above for any remaining issues."
