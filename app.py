#!/usr/bin/env python3
"""FastAPI web server for the recipe agent."""

import os
import sys
from pathlib import Path
from typing import Literal

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, StreamingResponse
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


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


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
        async with client.messages.stream(
            model="claude-opus-4-7",
            max_tokens=4096,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": m.role, "content": m.content} for m in body.messages],
        ) as stream:
            async for text in stream.text_stream:
                yield f"data: {text.replace(chr(10), chr(92) + 'n')}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
