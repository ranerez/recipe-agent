# Recipe Agent

A dinner recipe assistant powered by Claude. Tell it what ingredients you have on hand and it suggests 2–3 recipes — varying in cuisine, complexity, and cook time.

Uses [prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) so after the first request, responses are ~90% cheaper.

## Setup

**1. Clone and install dependencies**

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

**2. Add your Anthropic API key**

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

You can get a key from [console.anthropic.com](https://console.anthropic.com).

## Run

**Web app (recommended)**

```bash
./run.sh
```

Then open http://localhost:8000 in your browser.

Alternatively, start the server manually:

```bash
.venv/bin/uvicorn app:app --reload
```

**CLI — interactive mode**

```bash
python3 agent.py
```

Keeps prompting for ingredients until you quit.

**CLI — single shot**

```bash
python3 agent.py "chicken, rice, tomatoes, onion"
python3 agent.py "leftover pasta, eggs, parmesan"
```

## Usage

Enter a list of ingredients you have available — leftovers, pantry staples, whatever's in the fridge. The agent suggests 2–3 dinner recipes, always including at least one quick option (under 30 min) and one more elaborate dish from a different cuisine.

Each recipe includes:
- Prep and cook time, difficulty, and serving size
- Full ingredient list (with a note on anything you'd need to buy)
- Step-by-step instructions with temperatures and visual cues
- Optional tips for substitutions or variations

Common pantry staples (oil, salt, pepper, basic spices) are assumed to be on hand.
