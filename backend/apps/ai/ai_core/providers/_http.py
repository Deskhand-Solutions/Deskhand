"""
Minimal JSON-over-HTTP helper for provider clients.

Uses the stdlib ``urllib`` so no extra dependency (requests/httpx) is required.
Synchronous with a strict timeout — long-running inference must move to Celery
later (see architecture rules); for now we never block HTTP with unbounded work.
"""

import json
import urllib.error
import urllib.request

from apps.ai.ai_core.exceptions import AIError

_DEFAULT_TIMEOUT = 30


def post_json(
    url: str,
    *,
    headers: dict[str, str],
    payload: dict,
    timeout: int = _DEFAULT_TIMEOUT,
) -> dict:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise AIError(f"Provider HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise AIError(f"Provider request failed: {exc.reason}") from exc
    except (ValueError, json.JSONDecodeError) as exc:
        raise AIError(f"Invalid provider response: {exc}") from exc
