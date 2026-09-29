"""Supabase connection and persistence helpers for the pipeline."""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


def get_client() -> Client:
    """Create a Supabase client using pipeline-only credentials."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY are required")
    return create_client(url, key)


def get_series(client: Client) -> list[dict]:
    """Load source series with their indicator, country, and publisher metadata."""
    result = client.table("series").select(
        "*, indicators(*), countries(*), publishers(*)"
    ).execute()
    return result.data or []


def upsert_actuals(client: Client, series_code: str, rows: list[tuple[str, float]]) -> None:
    """Insert actual observations and overwrite revised values for existing periods."""
    if not rows:
        return
    data = [
        {"series_code": series_code, "period_date": period_date, "value": value}
        for period_date, value in rows
    ]
    client.table("actuals").upsert(
        data, on_conflict="series_code,period_date"
    ).execute()


def mark_updated(client: Client, series_code: str) -> None:
    """Record a UTC update time for a source series."""
    updated_at_utc = datetime.now(timezone.utc).replace(tzinfo=None).isoformat(timespec="seconds")
    client.table("series").update(
        {"last_updated": updated_at_utc}
    ).eq("code", series_code).execute()