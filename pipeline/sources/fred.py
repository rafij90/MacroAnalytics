"""Fetch observations from the FRED API."""

import os

import requests

API_URL = "https://api.stlouisfed.org/fred/series/observations"


def fetch(series_id: str) -> list[tuple[str, float]]:
    """Return valid FRED observations as (ISO date, value) pairs."""
    api_key = os.environ.get("FRED_API_KEY")
    if not api_key:
        raise RuntimeError("FRED_API_KEY is required to fetch FRED data")

    response = requests.get(
        API_URL,
        params={"series_id": series_id, "api_key": api_key, "file_type": "json"},
        timeout=30,
    )
    response.raise_for_status()
    observations = response.json().get("observations", [])
    return [
        (item["date"], float(item["value"]))
        for item in observations
        if item.get("value") not in (None, ".")
    ]