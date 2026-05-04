#!/bin/bash
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Setting up virtual environment..."
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt --quiet
fi

if [ ! -f ".env" ]; then
  echo "Warning: .env not found. Copy .env.example and add your ANTHROPIC_API_KEY."
fi

URL="http://localhost:8000"
printf "Starting Recipe Agent → \033]8;;%s\033\\%s\033]8;;\033\\\n" "$URL" "$URL"
.venv/bin/uvicorn app:app --reload
