"""Fetch configured source series and upsert their actual observations."""

import logging

from pipeline import db
from pipeline.sources import fred, worldbank

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def fetch_for_series(series: dict) -> list[tuple[str, float]]:
    publisher = series.get("publishers") or {}
    publisher_code = (series.get("publisher_code") or publisher.get("code") or "").upper()
    source_series_id = series.get("source_series_id")

    if not source_series_id:
        raise ValueError(f"Series {series.get('code')!r} has no source_series_id")
    if publisher_code == "FRED":
        return fred.fetch(source_series_id)
    if publisher_code in {"WB", "WORLD_BANK", "WORLDBANK"}:
        return worldbank.fetch(series["country_code"], source_series_id)
    raise ValueError(f"Unsupported publisher: {publisher_code!r}")


def main() -> None:
    client = db.get_client()
    series_list = db.get_series(client)
    logger.info("Updating %d series", len(series_list))

    failures = 0
    for series in series_list:
        code = series.get("code")
        try:
            if series.get("has_actuals") is False:
                logger.info("Skipping forecast-only series %s", code)
                continue
            rows = fetch_for_series(series)
            db.upsert_actuals(client, code, rows)
            db.mark_updated(client, code)
            logger.info("Updated %s with %d observations", code, len(rows))
        except Exception:
            failures += 1
            logger.exception("Failed to update %s", code)

    if failures:
        raise SystemExit(f"{failures} indicator update(s) failed")


if __name__ == "__main__":
    main()