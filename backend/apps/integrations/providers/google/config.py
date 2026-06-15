import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_OAUTH_SCOPES = [
    "openid",
    "email",
    "https://www.googleapis.com/auth/gmail.readonly",
]
