# Self-hosted fonts

`app/globals.css` loads these fonts with `@font-face`. Google Sans is loaded separately
with `next/font/google` in `app/layout.tsx` to preserve its original font files and metrics.

| Family | File | Source |
| --- | --- | --- |
| Geist | `geist/Geist.ttf` | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/geist) |
| Geist Mono | `geist-mono/GeistMono.ttf` | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/geistmono) |
| Stack Sans Headline | `stack-sans-headline/StackSansHeadline.ttf` | `ailene-lms/src/app/fonts/stack-sans-headline` (originally [Google Fonts](https://github.com/google/fonts/tree/main/ofl/stacksansheadline)) |
| Amiri Quran | `amiri-quran/AmiriQuran-Regular.ttf` | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/amiriquran) |
| Crayonize | `crayonize/PintassilgoPrints-Crayonize-Bold.otf` | Moved from `app/fonts` in this repo. |

Each Google Fonts family in this directory retains its `OFL.txt`.
