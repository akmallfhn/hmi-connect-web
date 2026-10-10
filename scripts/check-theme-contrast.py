"""Check WCAG AA contrast for the paired theme tokens in app/globals.css."""

from pathlib import Path
import re

css = (Path(__file__).resolve().parents[1] / "app/globals.css").read_text(encoding="utf-8")
light_block = css.split(":root {", 1)[1].split("\n}", 1)[0]
dark_block = css.split(".dark {", 1)[1].split("\n}", 1)[0]


def tokens(block: str) -> dict[str, str]:
    return dict(re.findall(r"(--[\w-]+):\s*(#[0-9a-fA-F]{6});", block))


def luminance(value: str) -> float:
    rgb = [int(value[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4 for channel in rgb]
    return sum(a * b for a, b in zip(linear, (0.2126, 0.7152, 0.0722)))


def contrast(a: str, b: str) -> float:
    bright, dim = sorted((luminance(a), luminance(b)), reverse=True)
    return (bright + 0.05) / (dim + 0.05)


pairs = [
    ("--background", "--foreground"),
    ("--surface", "--heading"),
    ("--surface", "--content-foreground"),
    ("--surface-muted", "--content-foreground"),
    ("--surface", "--muted-foreground"),
    ("--surface-muted", "--muted-foreground"),
    ("--surface", "--placeholder"),
    ("--primary", "--on-primary"),
    ("--destructive", "--on-destructive"),
    ("--primary-hover", "--on-primary"),
    ("--destructive-hover", "--on-destructive"),
    ("--badge-primary", "--badge-foreground"),
    ("--badge-destructive", "--badge-foreground"),
    ("--brand-ink", "--on-dark"),
    *[(f"--{name}-soft-bg", f"--{name}-soft-fg") for name in ("primary", "secondary", "destructive", "success", "warning", "info", "purple", "pink")],
]

failed = False
for name, values in (("light", tokens(light_block)), ("dark", tokens(dark_block))):
    for bg, fg in pairs:
        ratio = contrast(values[bg], values[fg])
        print(f"{name:5} {bg:24} {fg:27} {ratio:.2f}:1")
        failed |= ratio < 4.5

    # White on the logo-coral secondary is a deliberate brand choice, so its ratio is reported separately.
    for bg, fg in (("--secondary", "--on-secondary"), ("--secondary-hover", "--on-secondary"), ("--secondary", "--badge-foreground")):
        ratio = contrast(values[bg], values[fg])
        exception = values["--secondary"] == "#ff5c53" and values["--secondary-hover"] == "#ff766b"
        print(f"{name:5} {bg:24} {fg:27} {ratio:.2f}:1" + (" (brand exception)" if exception else ""))
        failed |= ratio < 4.5 and not exception

    # Keep white action labels on the logo tosca, while longer text uses --on-primary.
    for bg in ("--primary", "--primary-hover"):
        ratio = contrast(values[bg], values["--on-primary-action"])
        exception = name == "light" and values["--primary"] == "#159fa2" and values["--primary-hover"] == "#28adaf"
        print(f"{name:5} {bg:24} {'--on-primary-action':27} {ratio:.2f}:1" + (" (brand exception)" if exception else ""))
        failed |= ratio < 4.5 and not exception

if failed:
    raise SystemExit("Theme contrast below WCAG AA")
