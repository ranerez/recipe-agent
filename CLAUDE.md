# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env   # then add ANTHROPIC_API_KEY

# Run — interactive mode (keeps prompting)
python agent.py

# Run — single-shot (ingredients as argument)
python agent.py "chicken, rice, tomatoes, onion"
python agent.py "leftover pasta, eggs, parmesan"
```

## Architecture

Single-file agent (`agent.py`) using the Anthropic Python SDK.

**Key design decisions:**

- **Prompt caching** — The `SYSTEM_PROMPT` is intentionally large (>4096 tokens, the minimum for Opus 4.7 caching). It contains a full culinary knowledge base: pantry assumptions, cuisine guides, substitution tables, cooking technique reference, etc. The first request writes the cache at 1.25× cost; subsequent requests read it at 0.1× cost (~90% cheaper).

- **Streaming** — Uses `client.messages.stream()` so recipes appear token-by-token rather than waiting for the full response.

- **Two modes** — `python agent.py` launches interactive mode (loop); `python agent.py "..."` is single-shot for scripts/pipes.

- **Model** — `claude-opus-4-7` with `max_tokens=4096` for output. No thinking enabled (not needed for recipe generation).

## Prompt cache threshold

Opus 4.7 requires ≥ 4096 tokens in the cached prefix. The system prompt currently sits at ~4593 tokens. If the prompt is trimmed below 4096, caching silently stops working (no error, just no `cache_creation_input_tokens` in usage). Run this to check:

```bash
python -c "
import anthropic, re
from dotenv import load_dotenv; load_dotenv()
src = open('agent.py').read()
prompt = re.search(r'SYSTEM_PROMPT = \"\"\"(.+?)\"\"\"', src, re.DOTALL).group(1)
client = anthropic.Anthropic()
r = client.messages.count_tokens(model='claude-opus-4-7',
    system=[{'type':'text','text':prompt}], messages=[{'role':'user','content':'test'}])
print(f'{r.input_tokens} tokens (need >= 4096)')
"
```
