# Agent instructions — ChristianityApparently.com

This is the **public, production website repository**. These instructions apply to Claude, ChatGPT, Codex and other coding agents.

## Before changes
1. Read `README.md`, `docs/DEPLOYMENT.md`, `wrangler.jsonc`, relevant existing documentation, code, tests, and recent GitHub changes. Do not redo an investigation when a verified record exists.
2. For cross-agent work, read the **private** `SeanEricKnight/christianity-apparently-ops` repository's `README.md`, `HANDOFF.md`, `CURRENT.md`, `DECISIONS.md`, and `CONTEXT.md` when access is granted. Its existing October 2026 coordination protocol remains authoritative for project handoffs.
3. Consult existing Google Docs/Sheets for editorial research, channel guidance, audit reports and previously recorded verification before assuming information is missing. Treat source dates and verification scope seriously.
4. Cloudflare Workers currently hosts the website; `wrangler.jsonc` and `docs/DEPLOYMENT.md` describe repository deployment configuration. The **live Cloudflare dashboard** is authoritative for live settings. Distinguish repository merge, CI success and production deployment.

## Repositories and information boundaries
- This public repository: site source, generated pages, assets, tests, public-safe operational docs and development instructions.
- Private `SeanEricKnight/christianity-apparently-ops`: decisions, internal context, cross-model handoffs, confidential operational notes, private research and planning.
- Private `SeanEricKnight/christianity-apparently-analytics`: analytics collector code and data.
- Google Docs/Sheets: source manuscripts, editorial working drafts, research, audit records and trackers where appropriate.
- Never move secrets, credentials, internal account identifiers, unpublished sensitive-topic drafts, or private-repo content into this public site. Do not copy Google Docs into deployable files just because they exist.

## Engineering discipline
- Do not hand-edit generated headers/question-page output; follow the canonical generators described in `README.md`.
- Run the applicable static, distribution and browser tests. Record the **exact commit** tested and failures; never re-label an earlier commit's result as current. Do not weaken checks to make a failing build look green.
- Track actionable work in GitHub Issues and PRs. Include documentation changes in the same PR as consequential hosting, architecture, deployment, or site behavior changes.
- Preserve existing docs and update them in place rather than creating competing sources of truth.
- Changes to production deployment, sensitive editorial content, or private/public exposure need the owner's authorization. Merging code alone does not prove the live deployment succeeded.

## For Claude
A dated handoff from ChatGPT is in the private ops repo at `handoffs/2026-10-21-website-documentation-workflow-to-claude.md`. Read it and the ops `HANDOFF.md` index. The GitHub coordination architecture was already approved in early October 2026; **continue it, don't replace it**.
