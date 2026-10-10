"""Inventory UI color usage before and after the www dark-theme migration."""

from collections import defaultdict
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
FILES = sorted(
    p for base in ("components", "app/(www)", "app/globals.css")
    for p in (ROOT / base).rglob("*")
    if p.is_file() and p.suffix in {".tsx", ".ts", ".css"}
)
CATEGORIES = {
    "white/black utilities": r"\b(?:bg|text|border|ring|fill|stroke)-(?:white|black)(?:/[0-9]+)?\b",
    "gray scale utilities": r"\b(?:bg|text|border|divide|ring)-(?:gray|slate|zinc|neutral|stone)-\d+(?:/[0-9]+)?\b",
    "soft color utilities": r"\b(?:bg|border)-(?:[a-z]+)-(?:50|100|200)(?:/[0-9]+)?\b|\btext-(?:[a-z]+)-(?:600|700|800)(?:/[0-9]+)?\b",
    "hex/rgb/hsl": r"#[a-fA-F0-9]{3,8}\b|\b(?:rgba?|hsla?)\(",
    "inline style": r"\bstyle\s*=\s*\{",
    "SVG fill/stroke": r"\b(?:fill|stroke)\s*=\s*[\"'{]",
    "divider/border utilities": r"<hr\b|\b(?:border-[tb]|divide-[xy])(?:-[^\s\"'`}]*)?",
    "ring/shadow utilities": r"\b(?:ring|shadow)(?:-[^\s\"'`}]*)?",
}

print("| Category | Matches | Files |")
print("| --- | ---: | ---: |")
affected = set()
for category, pattern in CATEGORIES.items():
    hits = defaultdict(int)
    for path in FILES:
        count = len(re.findall(pattern, path.read_text(encoding="utf-8")))
        if count:
            hits[path] = count
            affected.add(path)
    print(f"| {category} | {sum(hits.values())} | {len(hits)} |")

print(f"\nAffected files: {len(affected)}")
for path in sorted(affected):
    print(path.relative_to(ROOT).as_posix())

print("\nComponent inventory:")
for path in sorted((ROOT / "components").rglob("*.tsx")):
    print(path.relative_to(ROOT).as_posix())
print("\nwww route/layout inventory:")
for path in sorted((ROOT / "app/(www)").rglob("*.tsx")):
    print(path.relative_to(ROOT).as_posix())
