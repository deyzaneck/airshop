#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "Installing Node.js dependencies..."
npm install

echo "Building React frontend..."
npm run build

echo "Initializing database..."
cd backend
python init_db.py --sample
cd ..

echo "Build completed successfully!"
