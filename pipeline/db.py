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


def get_indicators(client: Client) -> list[dict]:
    """Load indicators together with their source name."""
    result = client.table("indicators").select("*, sources(name)").execute()
    return result.data or []


def upsert_observations(client: Client, indicator_id: int, rows: list[tuple[str, float]]) -> None:
    """Insert new observations and overwrite revised values for existing dates."""
    if not rows:
        return
    data = [
        {"indicator_id": indicator_id, "date": date, "value": value}
        for date, value in rows
    ]
    client.table("observations").upsert(
        data, on_conflict="indicator_id,date"
    ).execute()


def mark_updated(client: Client, indicator_id: int) -> None:
    """Record when an indicator was successfully refreshed."""
    client.table("indicators").update(
        {"last_updated": datetime.now(timezone.utc).isoformat()}
    ).eq("id", indicator_id).execute()