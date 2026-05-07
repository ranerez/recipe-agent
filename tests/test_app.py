"""Tests for the FastAPI application."""

import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

# Import after env is clear so load_dotenv() finds nothing to override.
with patch.dict(os.environ, {}, clear=False):
    from app import app

client = TestClient(app, raise_server_exceptions=False)

VALID_KEY = "sk-ant-api03-validtestkey0123456789"


# ---------------------------------------------------------------------------
# Security headers
# ---------------------------------------------------------------------------

class TestSecurityHeaders:
    def test_nosniff(self):
        r = client.get("/api/status")
        assert r.headers.get("x-content-type-options") == "nosniff"

    def test_no_frame(self):
        r = client.get("/api/status")
        assert r.headers.get("x-frame-options") == "DENY"

    def test_referrer_policy(self):
        r = client.get("/api/status")
        assert r.headers.get("referrer-policy") == "strict-origin-when-cross-origin"

    def test_xss_protection(self):
        r = client.get("/api/status")
        assert r.headers.get("x-xss-protection") == "1; mode=block"


# ---------------------------------------------------------------------------
# GET /api/status
# ---------------------------------------------------------------------------

class TestApiStatus:
    def test_unconfigured_when_no_key(self, monkeypatch):
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
        r = client.get("/api/status")
        assert r.status_code == 200
        assert r.json() == {"configured": False}

    def test_configured_when_key_present(self, monkeypatch):
        monkeypatch.setenv("ANTHROPIC_API_KEY", VALID_KEY)
        r = client.get("/api/status")
        assert r.status_code == 200
        assert r.json() == {"configured": True}


# ---------------------------------------------------------------------------
# POST /api/setup
# ---------------------------------------------------------------------------

class TestApiSetup:
    def _post(self, key: str):
        with patch("app.set_key"):  # prevent writing to .env
            return client.post("/api/setup", json={"api_key": key})

    def test_valid_key_accepted(self):
        r = self._post(VALID_KEY)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_empty_string_rejected(self):
        r = self._post("")
        assert r.status_code == 422

    def test_whitespace_only_rejected(self):
        # strip() makes it empty, then the pattern check fails
        r = self._post("   ")
        assert r.status_code == 422

    def test_missing_sk_ant_prefix_rejected(self):
        r = self._post("not-a-valid-anthropic-key-12345")
        assert r.status_code == 422

    def test_wrong_prefix_rejected(self):
        r = self._post("sk-openai-validkeyformat1234567")
        assert r.status_code == 422

    def test_too_short_suffix_rejected(self):
        # Pattern requires at least 10 chars after "sk-ant-"
        r = self._post("sk-ant-abc")
        assert r.status_code == 422

    def test_key_too_long_rejected(self):
        r = self._post("sk-ant-" + "a" * 295)  # total > 300 chars
        assert r.status_code == 422

    def test_missing_body_field_rejected(self):
        with patch("app.set_key"):
            r = client.post("/api/setup", json={})
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# POST /api/recipes
# ---------------------------------------------------------------------------

class TestApiRecipes:
    def _post(self, messages: list, monkeypatch=None):
        if monkeypatch:
            monkeypatch.setenv("ANTHROPIC_API_KEY", VALID_KEY)
        return client.post("/api/recipes", json={"messages": messages})

    def test_empty_messages_list_rejected(self):
        r = self._post([])
        assert r.status_code == 422

    def test_too_many_messages_rejected(self):
        msgs = [{"role": "user", "content": "hello"}] * 41
        r = self._post(msgs)
        assert r.status_code == 422

    def test_content_too_long_rejected(self):
        r = self._post([{"role": "user", "content": "x" * 20_001}])
        assert r.status_code == 422

    def test_empty_content_rejected(self):
        r = self._post([{"role": "user", "content": ""}])
        assert r.status_code == 422

    def test_invalid_role_rejected(self):
        r = self._post([{"role": "system", "content": "hello"}])
        assert r.status_code == 422

    def test_missing_api_key_returns_500(self, monkeypatch):
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
        r = self._post([{"role": "user", "content": "chicken and rice"}])
        assert r.status_code == 500

    def test_valid_message_structure_accepted(self, monkeypatch):
        # A structurally valid request should pass validation and reach the
        # Anthropic client. Without a real key it will fail at 500, but that
        # confirms validation itself passed (not 422).
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-invalid-but-past-validation0000")
        with patch("app.anthropic.AsyncAnthropic"):
            r = self._post([{"role": "user", "content": "chicken and rice"}])
        # 422 would mean our validation rejected a valid structure — that's a bug.
        assert r.status_code != 422

    def test_max_message_count_accepted(self, monkeypatch):
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-invalid-but-past-validation0000")
        msgs = [{"role": "user", "content": "hi"}] * 40
        with patch("app.anthropic.AsyncAnthropic"):
            r = self._post(msgs)
        assert r.status_code != 422

    def test_max_content_length_accepted(self, monkeypatch):
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-invalid-but-past-validation0000")
        with patch("app.anthropic.AsyncAnthropic"):
            r = self._post([{"role": "user", "content": "x" * 20_000}])
        assert r.status_code != 422
