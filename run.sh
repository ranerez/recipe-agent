#!/usr/bin/env bash
set -e

# Resolve the real directory of this script, following symlinks.
SOURCE="${BASH_SOURCE[0]:-$0}"
while [ -L "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ "$SOURCE" != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
cd "$SCRIPT_DIR"

PYTHON="${PYTHON:-python3}"
VENV_DIR="$SCRIPT_DIR/.venv"

if [ ! -d "$VENV_DIR" ]; then
  echo "Setting up virtual environment..."
  "$PYTHON" -m venv "$VENV_DIR"
  "$VENV_DIR/bin/pip" install -r "$SCRIPT_DIR/requirements.txt" --quiet
fi

if [ ! -f "$SCRIPT_DIR/.env" ]; then
  echo "Warning: .env not found. Copy .env.example and add your ANTHROPIC_API_KEY."
fi

echo "Starting Recipe Agent"
echo "→ http://localhost:8000"
exec "$VENV_DIR/bin/uvicorn" app:app --reload --host localhost
