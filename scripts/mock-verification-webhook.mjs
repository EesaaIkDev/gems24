#!/usr/bin/env node
/**
 * Posts a correctly-signed mock decision at the verificationWebhook endpoint.
 *
 * Real providers only call publicly reachable HTTPS URLs, so an end-to-end run
 * cannot reach localhost. This reproduces the signing scheme the webhook
 * expects (HMAC-SHA256 hex over the raw request body) so the decision path can
 * be exercised locally without a tunnel.
 *
 * Usage:
 *   VERIFICATION_WEBHOOK_SECRET=devsecret node scripts/mock-verification-webhook.mjs \
 *     --url http://localhost:4400/api/functions/verificationWebhook \
 *     --reference <provider_ref or attempt id> \
 *     --status approved
 *
 * Statuses: approved | declined | resubmission_requested | review | expired | abandoned
 *
 * Pass --tamper to alter the body after signing; the endpoint must answer 401.
 */

import { createHmac } from "node:crypto";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const flag = (name) => process.argv.includes(`--${name}`);

const secret = process.env.VERIFICATION_WEBHOOK_SECRET;
if (!secret) {
  console.error("VERIFICATION_WEBHOOK_SECRET is required.");
  process.exit(1);
}

const url = arg("url", "http://localhost:4400/api/functions/verificationWebhook");
const status = arg("status", "approved");
const reference = arg("reference", "");
const eventId = arg("event", `evt_${Date.now()}`);

if (!reference) {
  console.error("--reference is required (the Verification row's provider_ref).");
  process.exit(1);
}

const REASONS = {
  declined: ["Document could not be authenticated", 102],
  resubmission_requested: ["Document is not fully visible", 201],
};
const [reason, reasonCode] = REASONS[status] || [null, null];

const payload = { reference, status, eventId, reason, reasonCode };

// Sign the exact bytes that are sent.
const raw = JSON.stringify(payload);
const signature = createHmac("sha256", secret).update(raw).digest("hex");
const body = flag("tamper") ? raw.replace(reference, `${reference}x`) : raw;

const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json", "x-hmac-signature": signature },
  body,
});

console.log(`${flag("tamper") ? "TAMPERED " : ""}${status} -> HTTP ${res.status}`);
console.log(await res.text());

if (flag("tamper") && res.status !== 401) {
  console.error("FAIL: tampered payload was not rejected with 401");
  process.exit(1);
}
if (!flag("tamper") && res.status !== 200) {
  console.error("FAIL: signed payload was not accepted");
  process.exit(1);
}
