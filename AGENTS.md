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

## Value-of-work and token discipline (owner-approved, 2026-10-21)

Protect the owner's time, token budget, and actual outcomes. **Do not optimize for a green test dashboard at any cost.** Before expanding a task, assess: What user-visible failure or material risk does this prevent? How likely/severe is it? What is the cheapest reliable check? What is the stopping rule?

- **Priority:** security, privacy, data loss, broken production, failed deployments, accessibility, incorrect content, and user-visible defects first. Cosmetic differences and infrastructure polish are lower priority unless the owner expressly requests them.
- **Proportionality:** a failing test is evidence to investigate, not automatically a broken product. Classify real defect vs test fragility vs unknown; inspect failure context before rewriting code. Keep substantive tests strong; tune overly sensitive assertions based on evidence, not to hide defects.
- **Timebox:** after one focused investigation or two unsuccessful attempts, reassess cost/benefit. If impact is minor, document it, propose a proportionate follow-up, and move on. Escalate only if materially justified.
- **Lean execution:** read existing GitHub/Google Docs evidence first; batch independent checks; avoid repeating full test suites unnecessarily; prefer targeted checks then one final comprehensive run when warranted; record concise facts and direct links instead of lengthy transcripts.
- **No unbounded rabbit holes:** avoid speculative rewrites, repeated tool calls for marginal certainty, and chasing imperceptible pixel changes when layout/functionality tests pass. Stop when additional evidence is unlikely to change the decision.
- **Risk exception:** never abandon potentially serious security, privacy, accessibility, data-integrity, or production issues merely to save tokens. Report meaningful unresolved risk plainly.

Example: the 2026-10-21 CI header screenshot failures were traced to 3 color-channel-level pixels out of a 390×70 screenshot. That tiny rasterization difference should not consume an open-ended investigation or block an otherwise validated site change. This is a lesson about proportionality, not blanket permission to ignore CI.
