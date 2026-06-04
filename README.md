# PDFChop

Another PDF tool. Yes, another one. Except this one doesn't ask you to sign up, doesn't watermark your files, doesn't have a "free tier" that expires, and doesn't upload your documents to some server in a country with questionable privacy laws.

Radical concept, I know.

## What it does

- Merge PDFs — combine files, groundbreaking
- Split PDF — cut it up, revolutionary
- Compress PDF — make it smaller, stunning innovation
- Reorder pages — drag things around like it's 2024
- Delete pages — remove the ones you don't want, wild
- Rotate pages — for when you scan something sideways like everyone does
- Edit PDF — add text, draw, highlight, sign, without paying Adobe $20/month
- Images to PDF — exactly what it says
- PDF to Images — also exactly what it says

Everything runs in your browser. Your files never touch a server. No account required. No limits. No upsells on every other click.

## Stack

Next.js, Tailwind, pdf-lib, PDF.js, Fabric.js. Nothing exotic.

## Why does this exist

Because every other PDF tool online is either paywalled, jittery, plastered with ads, or makes you create an account just to rotate a single page. This one doesn't do any of that. Also it's for my personal use.

# Changelog

All notable changes to this project will be documented here.
Notable meaning things that actually matter, not "updated dependencies" or "fixed typo in comment."

---

## [1.0.0] - 2025-06-04

### Added
- Merge PDFs — combine multiple files into one, like everyone has needed since PDFs were invented
- Split PDF — extract pages or blow the whole thing apart into individual files
- Compress PDF — lossless compression, because email still has attachment limits in the year of our lord 2025
- Reorder pages — drag and drop, with live thumbnails so you can see what you are actually moving
- Delete pages — visually select and remove pages without accidentally nuking the wrong ones
- Rotate pages — individually or all at once, for the scanners among us
- Edit PDF — add text, draw freehand, highlight, drop rectangles, sign, erase; the stuff Adobe charges a subscription for
- Images to PDF — batch JPG and PNG into a single document
- PDF to Images — export every page as a PNG, one click per page or all at once
- Everything runs client-side, no uploads, no server, no account, no watermarks, no limits

### Technical
- Next.js 14 app router
- pdf-lib for all PDF manipulation
- PDF.js with local worker to avoid the version mismatch that every other project falls into
- Fabric.js for the canvas editor
- Tailwind for styling

---

## What's coming eventually

- Form filling — check boxes and fill fields without Acrobat
- Password protection — encrypt and decrypt PDFs
- OCR — make scanned PDFs searchable
- Word / PPT to PDF — requires a server, will happen when it happens