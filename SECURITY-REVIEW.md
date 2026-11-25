# Defensive security review — VesselEye 4.0.1 / 4.0.2

Review date: 2026-11-25. Scope: public tracked frontend and GitHub workflow at 4.0.1, with a security maintenance patch. This is a source review with regression fixtures, not an independent penetration test or certification.

## Findings and mitigations

| Priority | Observation | Treatment |
|---|---|---|
| High (conditional impact) | Opt-in remote executable AI module ran in the main page origin; mutable third-party delivery chain was not independently reviewed. No compromise observed. | Remove remote execution, pause experimental AI, retain local deterministic summary. |
| Medium | Missing page Content Security Policy. | Meta CSP constrains scripts, connections, frames, objects, base and forms; inline styles retained for compatibility. |
| Medium | Restored browser records trusted arbitrary stored links/provenance. | Validate IDs and identity fields, canonicalize known records and source URLs, mark restored public records unverified. |
| Medium | Unbounded API result arrays and field strings could degrade UI availability. | Cap rendering/normalization and reject oversized declared content lengths. A server-side streaming cap remains necessary. |
| Low–medium | Floating CI action tags and default checkout credential persistence. | Pin verified upstream v4 commit SHAs and disable persisted credentials; retain read-only permissions. |
| Low | External iframe without sandbox; broader CSV formula prefixes and URL credential handling. | Sandbox map, no referrer; expand CSV guards and reject credential-bearing URLs. |

## Checks and limitations

- Reviewed all 10 tracked files in the 4.0.1 tree. No common GitHub/AWS/private-key/JWT or obvious named API credential pattern matched. This does not prove absence of secrets; Git history, deployment logs, private settings and Cloudflare secrets were not scanned.
- No live exploitation, credential testing, load testing or intrusive probing performed. Live HTTP access to the site and Worker was unavailable in the review environment. Cloudflare source, CORS implementation, abuse controls, logs, token scope and account protections remain unverified.
- Regression fixtures test code behavior and selected security invariants, not browser CSP enforcement, real map rendering, external API behavior or complete security coverage.
- GitHub Pages meta CSP cannot enforce frame-ancestors or replace HTTP security headers. Configure security headers at an appropriate hosting layer if required. Same-origin scripts remain trusted; other GitHub Pages projects under the same origin are relevant to the trust boundary.
- The GitHub repository is public: do not commit tokens, operational data, internal documents or confidential queries. Review access and deployment settings, rotate any credential known or suspected to be exposed, verify Worker-side input/rate limits and secret isolation, and enable appropriate account MFA and repository protection. Do not expose a GFW credential through the public Worker.
- Use only for independent civilian research; no authorization for official or operational use is implied.

References: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP ; https://docs.github.com/en/actions/reference/security/secure-use
