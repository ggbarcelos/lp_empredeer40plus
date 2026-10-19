#!/usr/bin/env python3
"""Atualiza o catálogo local com todos os episódios públicos da playlist."""

import argparse
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path


PLAYLIST_ID = "PLHqcbZC2lqMC1HIn_49bY6Q2CQZqPrk8a"
PLAYLIST_URL = f"https://www.youtube.com/playlist?list={PLAYLIST_ID}"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "youtube-playlist.json"
VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def read_playlist(source_json: Path | None) -> dict:
    if source_json:
        return json.loads(source_json.read_text(encoding="utf-8"))

    result = subprocess.run(
        [
            "yt-dlp",
            "--ignore-config",
            "--no-update",
            "--no-progress",
            "--no-warnings",
            "--skip-download",
            "--dump-single-json",
            PLAYLIST_URL,
        ],
        capture_output=True,
        check=True,
        text=True,
        timeout=900,
    )
    return json.loads(result.stdout)


def build_catalog(source: dict) -> dict:
    if source.get("id") != PLAYLIST_ID:
        raise ValueError("A resposta não pertence à playlist esperada")

    entries = source.get("entries")
    expected_count = source.get("playlist_count")
    if not isinstance(entries, list) or not entries:
        raise ValueError("A playlist não trouxe episódios")
    if expected_count is not None and len(entries) != int(expected_count):
        raise ValueError("A extração da playlist está incompleta")

    videos = []
    seen = set()
    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError("A playlist contém um episódio indisponível")
        video_id = entry.get("id")
        title = str(entry.get("title") or "").strip()
        if not VIDEO_ID.fullmatch(str(video_id or "")) or not title or video_id in seen:
            raise ValueError(f"Episódio inválido ou duplicado: {video_id}")
        seen.add(video_id)

        timestamp = entry.get("timestamp")
        if timestamp is not None:
            published = datetime.fromtimestamp(int(timestamp), timezone.utc)
        else:
            upload_date = str(entry.get("upload_date") or "")
            if not re.fullmatch(r"\d{8}", upload_date):
                raise ValueError(f"Data de publicação ausente: {video_id}")
            published = datetime.strptime(upload_date, "%Y%m%d").replace(tzinfo=timezone.utc)

        videos.append(
            {
                "id": video_id,
                "title": title,
                "published": published.isoformat(timespec="seconds").replace("+00:00", "Z"),
            }
        )

    videos.sort(key=lambda video: (video["published"], video["id"]), reverse=True)
    return {"playlistId": PLAYLIST_ID, "videos": videos}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-json", type=Path, help="Resposta já obtida do yt-dlp")
    args = parser.parse_args()
    catalog = build_catalog(read_playlist(args.source_json))
    content = json.dumps(catalog, ensure_ascii=False, indent=2) + "\n"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != content:
        OUTPUT.write_text(content, encoding="utf-8")
    print(f"Catálogo pronto: {len(catalog['videos'])} episódios, mais recentes primeiro")


if __name__ == "__main__":
    main()
