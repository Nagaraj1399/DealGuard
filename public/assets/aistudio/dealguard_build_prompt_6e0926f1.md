# DealGuard — Full Build Prompt (Nexconn Build Challenge 2026)

Paste this entire prompt into an AI coding agent (Claude Code, Codex, Cursor, etc.) in a fresh repo to build the project end to end. Everything the agent needs is below — do not invent features beyond this scope.

## 0. Context the agent must hold throughout

You are building **DealGuard**, a submission for the Nexconn Build Challenge 2026. Judging is 50% completeness/UX, 30% innovation, 20% business/traction. That means: **a small, bulletproof, polished flow beats a large, half-working one.** Do not add scope beyond section 5 without being asked. Never commit real personal data (names, phone numbers, addresses) — this repo is public. Use only synthetic listing/user data. Do not reference any pre-existing proprietary project; this is a clean, new codebase.

## 1. One-line pitch

"Every chat deal dies one of two ways — a scam, or a missed moment. Guardian Copilot watches for both."

DealGuard is a real-estate buyer↔seller chat marketplace built on the Nexconn Chat SDK. An invisible AI layer ("Guardian Copilot") reads every message and (a) flags scam patterns live on the bubble ("Trust Shield"), and (b) detects hot leads about to close or about to walk away and proactively escalates to a human agent with a spoken AI briefing ("Hot-Lead Radar").

## 2. Tech stack

- Next.js 14+, App Router, TypeScript, Tailwind CSS
- Package manager: pnpm
- Deployment target: Vercel
- Chat: `@nexconn/chatui` (Web Components UI kit) + its peer deps `@nexconn/engine`, `@nexconn/chat`, `lit`
  - Install: `pnpm add @nexconn/chatui @nexconn/engine @nexconn/chat lit`
  - Use compatible versions of `@nexconn/engine`/`@nexconn/chat` with the `@nexconn/chatui` release — check npm for the current matching set at build time.
- AI classifier + summarization: Groq API (`https://api.groq.com/openai/v1/chat/completions`, OpenAI-compatible). Use a fast model (e.g. an `llama-3.x` or `gpt-oss` variant available on the account) for low-latency per-message classification.
- Text-to-speech for the agent briefing: use Groq's TTS endpoint if available on the account, otherwise any OpenAI-compatible TTS endpoint the environment provides.
- Data store: start with a single SQLite file (via `better-sqlite3` or Prisma+SQLite) for listings, users, messages-classification-results. This is enough for the hackathon scope — do not build a multi-tenant production DB.

## 3. Environment variables

```
NEXCONN_APP_KEY=
NEXCONN_APP_SECRET=        # server-only, never sent to the client
NEXCONN_API_HOST=          # e.g. https://api.<region>.nexconn.ai — confirm exact host in Nexconn Console
GROQ_API_KEY=
DATABASE_URL=file:./dev.db
```

## 4. Day-1 spike (do this FIRST, before writing app code)

1. Register a Nexconn account, create an app, record the App Key and App Secret from the Nexconn Console.
2. Read `https://docs.nexconn.ai/guides/rest-apis/im-server-integration` (and sibling pages under `docs.nexconn.ai/guides/rest-apis/`) to get the **exact** request signing algorithm for `POST /v4/auth/access-token/issue` (App-Key / Nonce / Signature headers were observed in public docs excerpts but the precise signing recipe — e.g. HMAC variant, string-to-sign format, timestamp field — must be pulled fresh from the live docs, not assumed).
3. Implement a minimal server route that issues a token for a test user ID, then call `NCEngine.initialize({ appKey })` and `NCEngine.connect({ token })` from a throwaway page and confirm `res.isOk` / `res.code === 0`. Send one text message between two test users with `DirectChannel`. This proves real SDK usage end to end before any UI work starts.
4. Confirm whether Nexconn messages support arbitrary custom metadata/custom message types (docs mention a "custom message" type). If yes, use it to attach `{ trustFlag, leadScore }` directly to the message. If this proves awkward within an hour, fall back immediately to: store classification results in your own DB keyed by the Nexconn message ID, and look them up client-side to render badges. Do not lose more than 1 day on this — fallback and move on.

## 5. Scope (build exactly this, nothing more)

**In scope:**
- A `/listings` page showing 5–10 synthetic property listings (title, price, locality, 1 photo placeholder, short description). Seed via a script, not an admin UI.
- Tapping "Chat" on a listing opens a Nexconn Direct Channel between the current (buyer) test user and the listing's seller/agent test user, rendered via `@nexconn/chatui`'s `nc-chat-ui-app-provider` (or the current equivalent custom element — confirm exact element names in the installed package's README/Quickstart).
- Every inbound buyer message triggers a server-side call: send the message text (plus last ~5 messages of context) to Groq with a classification prompt (see section 6) and get back `{ trust_flag: bool, trust_reason: string|null, lead_score: 0-100, risk_of_loss: 0-100 }`.
- If `trust_flag` is true: render a red warning badge on that message bubble with `trust_reason`.
- If `lead_score >= 80` OR `risk_of_loss >= 80`: trigger escalation — (a) post a system message in the buyer↔seller channel ("Connecting you with an agent…"), (b) generate a one-paragraph briefing via Groq summarizing the conversation + why it's escalating, (c) convert that briefing to speech (TTS), (d) post it as a voice/audio message into a separate Group Channel that a "human agent" test user is a member of.
- A minimal `/agent` view showing the agent's Group Channel (also via ChatUI) so the briefing audio message is visible/playable on camera.
- A seed script (`pnpm run seed:demo`) that creates the synthetic listings, the test users (1 buyer, 2–3 sellers, 1 agent), and prints the two scripted demo messages to use when recording the video (see section 8).

**Out of scope — do not build:** live translation, Call SDK / voice-video calling, mobile apps, multi-agent persona relay, payments, real auth/accounts beyond simple test-user IDs, admin CMS for listings.

## 6. Groq classifier contract

System prompt (adapt as needed, keep deterministic and fast):

```
You are a real-time safety and intent classifier for a real-estate buyer-seller chat.
Given the latest buyer message and the last few turns of context, return STRICT JSON:
{
  "trust_flag": boolean,       // true if the message matches a common P2P real-estate scam pattern
                                // (e.g. requests advance/booking payment before a viewing,
                                // pressure to move off-platform, too-good-to-be-true urgency)
  "trust_reason": string|null, // short human-readable reason if trust_flag is true, else null
  "lead_score": number,        // 0-100, how close this buyer is to committing (viewing booked, strong interest)
  "risk_of_loss": number       // 0-100, how likely this buyer is to disengage/walk away right now
}
Return ONLY the JSON object, no prose.
```

Call this once per inbound buyer message. Keep the context window small (last 5 messages) to keep latency low.

## 7. API routes to implement

- `POST /api/nexconn/token` — server issues a signed Nexconn access token for a given test user ID (uses `NEXCONN_APP_SECRET`, never exposed to client).
- `POST /api/nexconn/webhook-or-poll` — receives/polls new messages in a channel and runs the Groq classifier (use Nexconn webhooks if available per `docs.nexconn.ai` webhook guide; otherwise poll on an interval server-side for the hackathon scope).
- `POST /api/copilot/classify` — internal helper wrapping the Groq classifier call.
- `POST /api/copilot/escalate` — builds the briefing summary, calls TTS, and posts the resulting audio message into the agent's Group Channel via the Nexconn Server API.
- `GET /api/listings` — returns the seeded synthetic listings.

## 8. Demo seed data & script

Seed exactly these two scripted buyer messages (used for the two demo-video beats — keep them easy to trigger on demand from the UI, e.g. a "replay demo" button that sends them as the test buyer):

1. Trust Shield beat: `"Please transfer the booking amount to this UPI ID before I show you the flat"` → expect `trust_flag: true`.
2. Hot-Lead Radar beat: `"ok nvm I'll look elsewhere"` → expect high `risk_of_loss`, triggers escalation + briefing.

## 9. UI requirements

- Clean, minimal Tailwind styling — this is 50% of the score, prioritize zero visual bugs over feature count.
- Trust Shield badge: small red pill/icon directly on the flagged message bubble with the reason as a tooltip.
- Hot-Lead escalation: a visible system message plus a playable audio bubble in the agent channel (standard Nexconn voice-message rendering if supported by ChatUI; otherwise a simple `<audio>` element keyed to that message).
- No login flow needed — hardcode/seed test user IDs and a simple user switcher (buyer / seller / agent) for demo purposes.

## 10. Acceptance criteria (verify before calling this done)

- [ ] A real message sent from the buyer UI arrives in the seller's channel via the Nexconn SDK (verifiable in the Nexconn Console's message logs / App Key dashboard).
- [ ] Sending the Trust Shield scripted message shows the red badge within a few seconds, no manual refresh needed.
- [ ] Sending the Hot-Lead scripted message triggers an escalation system message AND a playable audio briefing in the agent's channel.
- [ ] The repo contains zero real personal data — grep for real names/phone numbers/addresses before the final commit.
- [ ] `pnpm run seed:demo` works from a clean clone and reproduces both demo beats.
- [ ] App deploys cleanly to Vercel with the env vars in section 3 set in the Vercel dashboard (not committed).
- [ ] README documents: what Nexconn SDK features are used, how to get an App Key, how to run the seed script, and the one-line pitch.

## 11. What NOT to do

- Don't build translation, Call SDK, or mobile clients.
- Don't add authentication/payments infrastructure.
- Don't over-customize the Nexconn ChatUI beyond what's needed for the two badges — default styling is fine everywhere else.
- Don't guess the Nexconn token-signing algorithm — pull it from live docs during the Day-1 spike, don't hardcode an assumed HMAC recipe.
- Don't commit App Key/App Secret to the repo — use `.env.local` (gitignored) and Vercel env vars.
