#!/bin/bash

# Quick test script for button functionality
echo "🧪 Kandypack Logistics Frontend - Button Test Script"
echo "=================================================="
echo ""

cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env from .env.example..."
    cp .env.example .env
fi

echo "✅ Environment ready!"
echo ""
echo "🚀 Starting development server..."
echo "   Access the app at: http://localhost:8080"
echo ""
echo "📋 Test Checklist:"
echo "   [ ] Navigate to /orders → Click 'New Order' → Modal opens"
echo "   [ ] Navigate to /orders → Click 'Filter' → Filter modal opens"
echo "   [ ] Navigate to /orders → Click 'View Details' on any order → Details modal opens"
echo "   [ ] Navigate to /orders → Click 'Update Status' → Status modal opens"
echo "   [ ] Navigate to /trains → Click 'Add Train Trip' → Modal opens and saves"
echo "   [ ] Navigate to /routes → Click 'Add New Route' → Navigate to form page"
echo "   [ ] Navigate to /routes → Click 'View Map' on any route → Map page loads"
echo "   [ ] Navigate to /routes → Click 'Manage' → Manage page loads"
echo "   [ ] Navigate to /drivers → Click 'Add Staff Member' → Form page loads"
echo "   [ ] Fill and submit forms → Toast notifications appear"
echo ""
echo "Press Ctrl+C to stop the server when done testing"
echo ""

npm run dev
