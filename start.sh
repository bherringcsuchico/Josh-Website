#!/bin/bash

# Script to start both frontend and backend applications

echo "Starting Josh-Website application..."

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\nStopping applications..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Start MongoDB if not running
if ! docker ps | grep -q mongodb; then
    echo "Starting MongoDB..."
    if docker ps -a | grep -q mongodb; then
        docker start mongodb
    else
        docker run -d -p 27017:27017 --name mongodb mongo:latest
    fi
    echo "Waiting for MongoDB to be ready..."
    sleep 3
fi

# Check and install backend dependencies
echo "Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Start backend
echo "Starting backend server..."
npm start &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Check and install frontend dependencies
echo "Checking frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "Starting frontend server..."
npm start &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo -e "\nBoth applications are running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo -e "\nPress Ctrl+C to stop both applications"

# Wait for both processes
wait
