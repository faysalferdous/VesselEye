# VesselEye 3.0 — Bangladesh Naval Research Edition

An independent, civilian maritime open-source research prototype for a potential Bangladesh Navy innovation presentation. This is not an official Bangladesh Navy system, and does not claim approval or affiliation. Use official branding or restricted information only with appropriate written authorization. Not for navigation or operational decisions.

## Run / deploy (free)

- Open `index.html` in a modern browser, or run `python -m http.server 8000` in the project directory and open `http://localhost:8000`.
- Create a public GitHub repository named `VesselEye`. Upload all files in this directory to the repository root, including `.nojekyll`. In Settings → Pages select **Deploy from a branch**, `main`, `/ (root)`, then Save. The site will normally be at `https://YOUR-USERNAME.github.io/VesselEye/`.
- The frontend uses the existing Cloudflare Worker at https://vesseleye-api.lol-to-me-9.workers.dev (API v2.0). No frontend API key, npm install, or build step required. GitHub Pages and Wikidata have their own terms and limits. External sources may need registration.

## Implemented

- Responsive desktop/mobile naval-themed dashboard with a local illustrative map and fictional sample selection/zoom.
- Three dated historical civilian vessel records, available offline; exact/prefix local name and exact IMO search.
- Online Wikidata lookup through the Cloudflare Worker for commercial vessel name, IMO or MMSI; includes manufacturer, registry port, inception, beam and photo source/license links when present. Limited to explicit civilian commercial vessel types; not an exhaustive registry. Rate limits or network errors degrade to local historical records and source links.
- Vessel profile and provenance, saved records (browser-local storage), review checklist, JSON report, CSV directory and printable report (browser Save as PDF).
- Bangladesh commercial port and maritime reference directory.
- No live AIS feed, military monitoring, personal crew data, or automated scraping of restricted databases. Map markers are fictional, not historical or current positions of the real records. No AI API integration or authentication. The automatic summary is local and rule-based.

## Release 3.0

- Automatic Wikimedia Commons image preview when a linked file has supported image metadata, a recognized reusable license, and appropriate attribution. Otherwise the original file link remains available.
- Persistent dark/light theme and commercial-vessel search shortcuts.
- Profile completeness (not an accuracy or verification score), missing fields, reported ownership/manufacturer, and automatic rule-based summaries included in JSON and printable reports.
- Empty results clear the selected profile to prevent accidental exports of unrelated records.
- Existing Cloudflare API, local saved records, historical records, illustrative map, CSV export and review checklist are retained. No GFW token, local comparison tool or live AIS integration.

The Commons image metadata request uses https://www.mediawiki.org/wiki/API:Imageinfo and the original file page for attribution and license details. The browser sends requests to Commons when a record has a photo source. Network or licensing failures fall back to the source link.

Testing: JavaScript syntax check and Chromium fixture-driven tests with the previously captured Wikidata response and mocked Commons metadata/image. Live external requests could not be independently tested in the development environment.

## Data sources and terms

- Wikidata: https://www.wikidata.org/ — structured data CC0; verify community-maintained statements. Public query endpoint may throttle or fail.
- IMO GISIS: https://gisis.imo.org/Public/Default.aspx — external reference; access terms apply.
- Equasis: https://www.equasis.org/ — free registration for search; no scraping or automatic integration.
- Global Fishing Watch: https://globalfishingwatch.org/ — public portal reference; API token and applicable usage terms required for future integration.
- NOAA Marine Cadastre: https://hub.marinecadastre.gov/pages/vesseltraffic — historical US data, external link only.
- Bangladesh: https://dos.gov.bd/ · https://cpa.gov.bd/ · https://mpa.gov.bd/ · https://ppa.gov.bd/ — public reference links only.
- Offline historical facts: https://topsectorlogistiek.nl/wp-content/uploads/2024/05/TSL52.61.005-01-Case-Study-Ever-Given-Accident-report.pdf (Ever Given); https://www.ntsb.gov/investigations/Pages/DCA24MM031.aspx and https://data.ntsb.gov/Docket/Document/docBLOB?FileExtension=pdf&FileName=DALI+-+DCA24MM031+-+Engineering+-+Factual+Report+-+FINAL-Rel.pdf&ID=19228257 (Dali); https://www.ntsb.gov/investigations/pages/dca16mm001.aspx and https://data.ntsb.gov/Docket/Document/docBLOB?FileExtension=.PDF&FileName=3+-+Engineering+El+Faro+Ship+Particulars-Master.PDF&ID=40447403 (El Faro). Historical facts only; never assume current owner or flag.
- Natural Earth public-domain geographic basemap: https://www.naturalearthdata.com/about/terms-of-use/ — inherited simplified map, not a navigation chart.

## Privacy

Search terms are sent to the VesselEye Cloudflare Worker, which queries Wikidata. Do not enter confidential information; infrastructure providers may log requests. Saved records are local to the browser; use Clear saved to remove them. Do not enter confidential data. No user tracking, login, analytics or collection of personal crew records. Review checklist state is session-only.

## Files

`index.html`, `style.css`, `app.js`, `favicon.svg` — application. `.github/workflows/validate.yml` — static CI checks. `map.svg` — original simplified reference asset. `README.md` and `LICENSE` — documentation and code license. Third-party data/links retain their own terms.
