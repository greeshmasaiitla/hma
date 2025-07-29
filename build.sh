#!/bin/bash

# Install backend dependencies
cd backends
npm install

# Install frontend dependencies and build
cd ../frontend
npm install
npm run build

# Go back to backend
cd ../backends 