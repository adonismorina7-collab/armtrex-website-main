#!/usr/bin/env python3
"""
Armtrex contact-form mail relay.

A tiny, dependency-free HTTP service that accepts the website's contact-form
POST and relays it as an email through Proton's SMTP submission server. It runs
on localhost only; nginx reverse-proxies /api/contact to it. Secrets come from
the environment (see /etc/armtrex-contact.env), never from this file or the repo.

Also relays KYC / product-access-request submissions forwarded here by the
Armtrex Cloudflare Worker (worker/index.js, KYC_RELAY_URL option) — see
/api/kyc below. That route is meant to be called server-to-server by the
Worker, not directly by browsers, so it's gated by a shared secret
(KYC_RELAY_SECRET) instead of the Origin check used for /api/contact.

Endpoints:
  GET  /api/contact/health  -> {"ok": true}
  POST /api/contact         -> {"ok": true} | {"ok": false, "error": "..."}
  POST /api/kyc             -> {"ok": true} | {"ok": false, "error": "..."}
"""
import json
import os
import re
import ssl
import smtplib
import time
import threading
from email import policy
from email.parser import BytesParser
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# ---- Config (from environment) -------------------------------------------
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.protonmail.ch")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")          # full Proton address
SMTP_PASS = os.environ.get("SMTP_PASS", "")          # Proton SMTP token
MAIL_TO = os.environ.get("MAIL_TO", "info@armtrex.co.uk")
MAIL_FROM = os.environ.get("MAIL_FROM", SMTP_USER)   # must be a Proton address
LISTEN_HOST = os.environ.get("LISTEN_HOST", "127.0.0.1")
LISTEN_PORT = int(os.environ.get("LISTEN_PORT", "8080"))

# KYC-specific config
KYC_MAIL_TO = os.environ.get("KYC_MAIL_TO", MAIL_TO)     # security team inbox
KYC_RELAY_SECRET = os.environ.get("KYC_RELAY_SECRET", "")  # shared secret; Worker sends this in X-Relay-Secret

# Comma-separated list of origins allowed to POST here, e.g.
# "https://armtrex.co.uk,https://www.armtrex.co.uk". Same-origin browser requests already
# don't send a hostile Origin, so this mainly blocks other sites' scripts
# from driving the form directly. Empty = skip the check (dev convenience).
ALLOWED_ORIGINS = {
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()
}

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

MAX_BODY = 64 * 1024           # 64 KB request cap (/api/contact, JSON only)
MAX_KYC_BODY = 20 * 1024 * 1024  # 20 MB request cap (/api/kyc, has file attachments)
MAX_FIELD = 5000               # per-field char cap
RATE_MAX = 5                   # max submissions ...
RATE_WINDOW = 60               # ... per this many seconds, per IP
KYC_RATE_MAX = 5               # KYC submissions ...
KYC_RATE_WINDOW = 300          # ... per this many seconds, per IP

_hits = {}                    # ip -> [timestamps]
_hits_lock = threading.Lock()
_kyc_hits = {}
_kyc_hits_lock = threading.Lock()


def _rate_ok(ip: str) -> bool:
    now = time.time()
    with _hits_lock:
        times = [t for t in _hits.get(ip, []) if now - t < RATE_WINDOW]
        if len(times) >= RATE_MAX:
            _hits[ip] = times
            return False
        times.append(now)
        _hits[ip] = times
        return True


def _kyc_rate_ok(ip: str) -> bool:
    now = time.time()
    with _kyc_hits_lock:
        times = [t for t in _kyc_hits.get(ip, []) if now - t < KYC_RATE_WINDOW]
        if len(times) >= KYC_RATE_MAX:
            _kyc_hits[ip] = times
            return False
        times.append(now)
        _kyc_hits[ip] = times
        return True


def _clean(s, limit=MAX_FIELD):
    return str(s or "").strip()[:limit]


def _one_line(s):
    # Header-injection guard: collapse any CR/LF so a value can't smuggle headers.
    return _clean(s).replace("\r", " ").replace("\n", " ")


def send_mail(data: dict):
    name = _one_line(data.get("name"))
    email = _one_line(data.get("email"))
    company = _one_line(data.get("company"))
    subject = _one_line(data.get("subject"))
    message = _clean(data.get("message"))

    if not (name and email and subject and message):
        raise ValueError("missing required fields")
    if not EMAIL_RE.match(email):
        raise ValueError("invalid email")

    body = (
        f"New enquiry from the Armtrex website\n"
        f"{'-' * 40}\n"
        f"Name:    {name}\n"
        f"Email:   {email}\n"
        f"Company: {company or '-'}\n"
        f"Subject: {subject}\n"
        f"{'-' * 40}\n\n"
        f"{message}\n"
    )

    msg = EmailMessage()
    msg["Subject"] = f"[Website Enquiry] {subject}"
    msg["From"] = MAIL_FROM
    msg["To"] = MAIL_TO
    msg["Reply-To"] = f"{name} <{email}>"
    msg.set_content(body)

    ctx = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=20, context=ctx) as s:
            s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
            s.starttls(context=ctx)
            s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)


def parse_multipart(content_type: str, body: bytes):
    """Parse a multipart/form-data body into (fields, files) using the
    stdlib email package (feed it a synthetic MIME message rather than
    hand-rolling boundary splitting). files is a list of
    {name, filename, content_type, data} dicts."""
    header = f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode("utf-8")
    msg = BytesParser(policy=policy.default).parsebytes(header + body)

    fields = {}
    files = []
    if not msg.is_multipart():
        raise ValueError("not multipart")

    for part in msg.iter_parts():
        disp = part.get("Content-Disposition", "")
        if "form-data" not in disp:
            continue
        name = part.get_param("name", header="Content-Disposition")
        filename = part.get_param("filename", header="Content-Disposition")
        if filename:
            data = part.get_payload(decode=True) or b""
            files.append({
                "name": name,
                "filename": filename,
                "content_type": part.get_content_type() or "application/octet-stream",
                "data": data,
            })
        else:
            payload = part.get_payload(decode=True) or b""
            charset = part.get_content_charset() or "utf-8"
            try:
                fields[name] = payload.decode(charset, errors="replace")
            except LookupError:
                fields[name] = payload.decode("utf-8", errors="replace")

    return fields, files


def send_kyc_mail(fields: dict, files: list):
    name = _one_line(fields.get("fullLegalName"))
    title = _one_line(fields.get("title"))
    employer = _one_line(fields.get("employerName"))
    declaration = _clean(fields.get("declaration"))

    required = ["fullLegalName", "dob", "citizenships", "passportNumber", "passportCountry", "employerName", "title"]
    missing = [k for k in required if not _clean(fields.get(k))]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")
    if declaration != "true":
        raise ValueError("declaration not accepted")
    if not any(f["name"] == "passportCopy" for f in files):
        raise ValueError("passport copy attachment is required")

    ordered = [
        ("Full Legal Name", "fullLegalName"), ("Previous Name(s)", "previousNames"),
        ("Date of Birth", "dob"), ("Citizenship(s)", "citizenships"),
        ("Passport Number", "passportNumber"), ("Passport Issuing Country", "passportCountry"),
        ("Passport Date of Issue", "passportIssue"), ("Passport Date of Expiry", "passportExpiry"),
        ("Employer Name", "employerName"), ("Employer ID Code", "employerId"),
        ("Employer Address", "employerAddress"), ("Employer Website", "employerWebsite"),
        ("Official Contact", "officialContact"), ("Title", "title"), ("Tenure", "tenure"),
        ("Military Rank", "militaryRank"), ("Security Clearance Level", "clearanceLevel"),
        ("Government Service History", "govServiceHistory"), ("Current Government Affiliation", "govAffiliation"),
        ("End-User Status", "endUserStatus"),
    ]
    lines = [f"{label}: {_clean(fields.get(key), limit=4000) or '-'}" for label, key in ordered]
    attached = ", ".join(f["filename"] for f in files) or "-"

    body = (
        "New KYC / product-access request from the Armtrex website\n"
        + "-" * 40 + "\n"
        + "\n".join(lines)
        + f"\nAttachments: {attached}\n"
        + "-" * 40 + "\n\n"
        "No commercial, technical, or contractual negotiation should take place, and no controlled\n"
        "product information should be disclosed, until this request has been reviewed and cleared.\n"
        "If cleared, generate a 14-day access link with scripts/generate-access-link.mjs and reply\n"
        "to the requester directly.\n"
    )

    msg = EmailMessage()
    msg["Subject"] = f"[KYC Request] {name or 'Unnamed'} — {title or '-'} @ {employer or '-'}"
    msg["From"] = MAIL_FROM
    msg["To"] = KYC_MAIL_TO
    msg.set_content(body)

    for f in files:
        maintype, _, subtype = (f["content_type"] or "application/octet-stream").partition("/")
        msg.add_attachment(
            f["data"],
            maintype=maintype or "application",
            subtype=subtype or "octet-stream",
            filename=f["filename"],
        )

    ctx = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=30, context=ctx) as s:
            s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as s:
            s.starttls(context=ctx)
            s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)


class Handler(BaseHTTPRequestHandler):
    server_version = "armtrex-contact/1.0"

    def _json(self, code, payload):
        data = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.rstrip("/") == "/api/contact/health":
            return self._json(200, {"ok": True})
        return self._json(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        if self.path.rstrip("/") == "/api/kyc":
            return self._handle_kyc()
        if self.path.rstrip("/") != "/api/contact":
            return self._json(404, {"ok": False, "error": "not found"})

        if ALLOWED_ORIGINS:
            origin = self.headers.get("Origin", "")
            if origin and origin not in ALLOWED_ORIGINS:
                return self._json(403, {"ok": False, "error": "forbidden origin"})

        ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        if not _rate_ok(ip):
            return self._json(429, {"ok": False, "error": "too many requests"})

        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            return self._json(400, {"ok": False, "error": "bad request"})

        try:
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return self._json(400, {"ok": False, "error": "invalid json"})

        # Honeypot: real users never fill this hidden field.
        if _clean(data.get("_gotcha")):
            return self._json(200, {"ok": True})  # silently accept + drop

        try:
            send_mail(data)
        except ValueError as e:
            return self._json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self.log_message("send failed: %s", e)
            return self._json(502, {"ok": False, "error": "mail delivery failed"})

        return self._json(200, {"ok": True})

    def _handle_kyc(self):
        # Server-to-server only: called by the Cloudflare Worker's KYC_RELAY_URL
        # option, never directly by browsers, so it's gated by a shared secret
        # rather than the Origin check used for /api/contact.
        if KYC_RELAY_SECRET:
            if self.headers.get("X-Relay-Secret", "") != KYC_RELAY_SECRET:
                return self._json(403, {"ok": False, "error": "forbidden"})
        else:
            self.log_message("warning: KYC_RELAY_SECRET is unset — /api/kyc is unauthenticated")

        ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        if not _kyc_rate_ok(ip):
            return self._json(429, {"ok": False, "error": "too many requests"})

        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            return self._json(400, {"ok": False, "error": "expected multipart/form-data"})

        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_KYC_BODY:
            return self._json(400, {"ok": False, "error": "bad request"})

        body = self.rfile.read(length)

        try:
            fields, files = parse_multipart(content_type, body)
        except Exception:
            return self._json(400, {"ok": False, "error": "invalid multipart body"})

        # Honeypot: real submissions never fill this hidden field.
        if _clean(fields.get("_gotcha")):
            return self._json(200, {"ok": True})  # silently accept + drop

        try:
            send_kyc_mail(fields, files)
        except ValueError as e:
            return self._json(400, {"ok": False, "error": str(e)})
        except Exception as e:
            self.log_message("KYC send failed: %s", e)
            return self._json(502, {"ok": False, "error": "mail delivery failed"})

        return self._json(200, {"ok": True})

    def log_message(self, fmt, *args):  # concise stderr logging
        import sys
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main():
    srv = ThreadingHTTPServer((LISTEN_HOST, LISTEN_PORT), Handler)
    print(f"armtrex-contact listening on {LISTEN_HOST}:{LISTEN_PORT} -> {SMTP_HOST}:{SMTP_PORT}")
    srv.serve_forever()


if __name__ == "__main__":
    main()
