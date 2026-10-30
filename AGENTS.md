# AGENTS.md

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `vite.config.js`: Vite config and Base44 Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the Base44 project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` before finishing code changes.
- Backend function tests run the real `base44/functions/*/entry.ts` handlers against an in-memory SDK mock: `deno test --allow-env --allow-read --config tests/backend/deno.json tests/backend`. Add a case there when changing permissions, the store webhook, listings, chat or connections.
- Listing reads are server-filtered and cursor-paginated through `src/hooks/usePagedListings.js` (`filter(query, { sort, limit, cursor })`). For multi-value filters use `{ field: { $in: [...] } }`, never the bare-array shorthand — verified on the live backend that the shorthand drops results with cursor pages. Marketplace order sorts on the server-stamped `Listing.placement` (grade, then newest).
- Presence writes go through `src/lib/presence.js` (foreground + every 4 min, throttled); keep `ACTIVE_WINDOW_MS` above `HEARTBEAT_MS` and the push-mute window in `pushNewMessage` in step with it.
- Verification runs on Shufti Pro's hosted page (`base44/shared/shufti.ts`). `submitVerification` starts/resumes a request (rate limited, link reused while valid); `shuftiCallback` is the only path that grants a badge and always re-reads the result from Shufti's `/status` endpoint after checking the `Signature` header. Levels: buyer = optional KYC, trader = KYC + AML, Platinum = business (KYB + KYC + AML). AML matches never auto-revoke: first screening → `status: review`, after approval → `Trader.aml_flagged`; admins decide via `reviewVerification` (`/admin/verifications`). Secrets: `SHUFTI_CLIENT_ID`, `SHUFTI_SECRET_KEY`, optional `SHUFTI_ONGOING_AML=1` (production accounts only), `SHUFTI_CALLBACK_URL`, `SHUFTI_REDIRECT_URL`.
- Account kinds: trader accounts are `trader_kind` `individual` (Bronze–Gold; Gold is the top trader plan) or `business` (Platinum only). Enforced by `tierAllowed` in `base44/shared/traders.ts` (store webhook + discount codes); chosen at signup, one-way switch via `upgradeToBusiness`. Business details live on Trader (`legal_business_name`, `business_type`, private `registration_number`, `year_founded`, `team_size`, `website`, `contact_role`); verification level `business` follows the kind. `curatePlatinum` (admin) seeds/removes `is_demo` sample businesses.
- Plans bill every 3 months (store products `gems24_<tier>_yearly`, mapped by `tierFromProduct`). Slots = `MONTHLY_SLOTS[tier]` (Bronze 2, Silver 4, Gold 6, Platinum 10) × the cycle month (30-day months from `Trader.subscription_start_date`, capped at 3; renewals stay at 3), plus referral and loyalty bonuses (`LOYALTY_STEP` per uninterrupted renewal). `effectiveLimit` in `base44/shared/traders.ts` is enforced; `src/lib/referral.js` mirrors it. Expiration, or 2 days past `plan_renews_at` without a renewal, drops to 0.
- Haptics: use `haptic(type)` from `src/lib/despia.js` (no-op outside the Despia app, never throws) — `light` for tabs/filter toggles, `heavy` for primary confirmations, `success` when an action completes, `error` for validation/failed lookups (`useErrorHaptic(error)` fires it whenever an error message appears). External pages in the app must open via `window.open(url, "_blank")` directly in the tap handler (see `src/lib/openExternal.js`).
- Security model: plan, referral, verification and listing-badge fields are server-only (FLS `write: admin`); chats, messages and connections are created only by backend functions and readable only by their participants (stamped user ids); phone/contact email/presence are owner-only and shared with accepted connections via `connectedProfile`.
