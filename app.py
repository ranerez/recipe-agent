#!/usr/bin/env python3
"""FastAPI web server for the recipe agent."""

import json
import os
import sys
from pathlib import Path
from typing import Literal

import anthropic
from dotenv import load_dotenv, set_key
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

sys.path.insert(0, str(Path(__file__).parent))
from agent import SYSTEM_PROMPT

app = FastAPI(title="Recipe Agent")


@app.middleware("http")
async def redirect_ip_to_localhost(request: Request, call_next):
    if request.url.hostname == "127.0.0.1":
        url = request.url.replace(hostname="localhost")
        return RedirectResponse(url=str(url))
    return await call_next(request)

static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


ENV_PATH = Path(__file__).parent / ".env"


class SetupRequest(BaseModel):
    api_key: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@app.get("/api/status")
async def api_status():
    return JSONResponse({"configured": bool(os.environ.get("ANTHROPIC_API_KEY"))})


@app.post("/api/setup")
async def save_api_key(body: SetupRequest):
    key = body.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty.")
    set_key(str(ENV_PATH), "ANTHROPIC_API_KEY", key)
    os.environ["ANTHROPIC_API_KEY"] = key
    return JSONResponse({"ok": True})


def _get_client() -> anthropic.AsyncAnthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not set on the server.")
    return anthropic.AsyncAnthropic(api_key=api_key)


@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = static_dir / "index.html"
    if html_path.exists():
        return HTMLResponse(content=html_path.read_text())
    raise HTTPException(status_code=404, detail="index.html not found")


@app.post("/api/recipes")
async def stream_recipes(body: ChatRequest):
    if not body.messages:
        raise HTTPException(status_code=400, detail="messages must not be empty")

    client = _get_client()

    async def generate():
        try:
            async with client.messages.stream(
                model="claude-opus-4-7",
                max_tokens=4096,
                cache_control={"type": "ephemeral"},
                system=SYSTEM_PROMPT,
                messages=[{"role": m.role, "content": m.content} for m in body.messages],
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {text.replace(chr(10), chr(92) + 'n')}\n\n"
            yield "data: [DONE]\n\n"
        except anthropic.RateLimitError as e:
            retry_after = None
            if hasattr(e, "response") and e.response is not None:
                retry_after = e.response.headers.get("retry-after")
            msg = str(e)
            kind = "quota" if ("credit" in msg.lower() or "balance" in msg.lower()) else "rate_limit"
            yield f"data: [ERROR:{json.dumps({'kind': kind, 'retry_after': retry_after, 'message': msg})}]\n\n"
        except anthropic.APIStatusError as e:
            kind = "overloaded" if e.status_code == 529 else "api"
            yield f"data: [ERROR:{json.dumps({'kind': kind, 'message': str(e)})}]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
