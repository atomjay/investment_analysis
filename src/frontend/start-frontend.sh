#!/bin/bash

# Start the Next.js frontend server with proper network binding
# This script ensures the frontend is accessible from all network interfaces

echo "🚀 Starting iBank Frontend Server..."

# Check if port 3000 is already in use
if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. Stopping existing processes..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
    sleep 2
fi

# Start Next.js with network binding to all interfaces
echo "🌐 Starting Next.js server on all network interfaces..."
npx next dev -H 0.0.0.0 -p 3000 > next.log 2>&1 &

# Wait for server to start
sleep 3

# Check if server is running
if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Frontend server started successfully!"
    echo "🔗 Access URLs:"
    echo "   - Local:   http://localhost:3000"
    echo "   - Network: http://0.0.0.0:3000"
    echo "📋 Logs are saved to: next.log"
    echo "🛑 To stop: pkill -f 'next dev'"
else
    echo "❌ Failed to start frontend server"
    echo "📋 Check next.log for errors"
    exit 1
fi