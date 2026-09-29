"""Fetch annual indicators from the World Bank Indicators API."""

import requests

API_URL = "https://api.worldbank.org/v2/country/{country}/indicator/{indicator}"


def fetch(country: str, indicator_id: str) -> list[tuple[str, float]]:
    """Return available World Bank observations as (year, value) pairs."""
    response = requests.get(
        API_URL.format(country=country, indicator=indicator_id),
        params={"format": "json", "per_page": 20000},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list) or len(payload) < 2 or payload[1] is None:
        return []
    return [
        (
            f"{item['date']}-01-01" if len(str(item["date"])) == 4 else str(item["date"]),
            float(item["value"]),
        )
        for item in payload[1]
        if item.get("date") and item.get("value") is not None
    ]