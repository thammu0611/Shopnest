#!/usr/bin/env bash
# Starts the React dev server on http://localhost:5173
cd "$(dirname "$0")/frontend"
[ -d node_modules ] || npm install
npm run dev
