"""Fetch configured indicators and upsert their latest source data."""

import logging

from pipeline import db
from pipeline.sources import fred, worldbank

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def fetch_for_indicator(indicator: dict) -> list[tuple[str, float]]:
    source = indicator.get("sources") or {}
    source_name = (source.get("name") or "").strip().lower()
    series_id = indicator.get("source_series_id")

    if source_name == "fred":
        return fred.fetch(series_id)
    if source_name in {"world bank", "worldbank"}:
        return worldbank.fetch(indicator["country"], series_id)
    raise ValueError(f"Unsupported data source: {source.get('name')!r}")


def main() -> None:
    client = db.get_client()
    indicators = db.get_indicators(client)
    logger.info("Updating %d indicators", len(indicators))

    failures = 0
    for indicator in indicators:
        code = indicator.get("code", indicator.get("id"))
        try:
            rows = fetch_for_indicator(indicator)
            db.upsert_observations(client, indicator["id"], rows)
            db.mark_updated(client, indicator["id"])
            logger.info("Updated %s with %d observations", code, len(rows))
        except Exception:
            failures += 1
            logger.exception("Failed to update %s", code)

    if failures:
        raise SystemExit(f"{failures} indicator update(s) failed")


if __name__ == "__main__":
    main()