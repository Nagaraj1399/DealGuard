# DealGuard — Guardian Copilot for Real-Estate Deals

> "Every chat deal dies one of two ways — a scam, or a missed moment. Guardian Copilot watches for both."

**DealGuard** is a submission for the **Nexconn Build Challenge 2026**. Built on top of the Nexconn Chat SDK, DealGuard introduces an autonomous AI protection layer ("Guardian Copilot") that inspects buyer↔seller conversations in real time to:
1. **Trust Shield**: Detect and flag P2P real-estate fraud, advance-fee scams, and off-platform coercion live on the message bubble.
2. **Hot-Lead Radar**: Proactively identify buyers about to close or about to disengage, automatically escalating with a synthesized voice briefing (`.wav` / TTS) delivered straight to a senior human agent.

---

## 🌟 Key Features

- **Nexconn Chat SDK Architecture**: Direct encrypted buyer↔seller channel with HMAC-signed token issuance (`POST /api/nexconn/token`), channel routing, and group agent channels.
- **Real-Time Guardian Copilot Classifier**: Evaluates message intent with low latency using Groq (Llama-3.3) and Google Gemini 2.5 Flash with structured outputs.
- **Trust Shield**: Live bubble warning pill with detailed fraud reasoning (e.g., booking deposits demanded before in-person viewings).
- **Proactive Spoken AI Briefings**: When walkaway risk or lead score reaches $\ge 80\%$, Guardian Copilot synthesizes an audio briefing and streams it into the Agent's command center with full transcript and waveform player.
- **Instant Agent Takeover**: Human brokers can listen to the spoken briefing on camera and take over the conversation with a single click.
- **Synthetic Test Marketplace**: 4 high-fidelity architectural property listings and 5 synthetic users (Buyer, Sellers, Agent) with a built-in role switcher for live demo presentations.

---

## 🚀 Nexconn SDK Features Used

- `@nexconn/engine` & `@nexconn/chat`: Core messaging primitives, token authentication, `DirectChannel` and `GroupChannel` message dispatching.
- `@nexconn/chatui`: Web components layout conventions and message bubble extension architecture.
- Nexconn REST API signing algorithm: Server-side token issuance (`/v4/auth/access-token/issue`) using `App-Key`, `Nonce`, `Timestamp`, and HMAC-SHA1 signatures with `NEXCONN_APP_SECRET`.

---

## 🔑 How to Get a Nexconn App Key & App Secret

1. Visit [Nexconn Console](https://console.nexconn.ai) and sign up for an account.
2. Create a new Application (e.g. `DealGuard-2026`).
3. Under **Application Settings → API Credentials**, copy your **App Key** and **App Secret**.
4. Configure your `.env` file (see below).

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
# Nexconn Chat SDK credentials
NEXCONN_APP_KEY=your_nexconn_app_key
NEXCONN_APP_SECRET=your_nexconn_app_secret
NEXCONN_API_HOST=https://api.us-east-1.nexconn.ai

# Optional AI Engines (automatically uses Gemini Flash or Groq)
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Storage
DATABASE_URL=file:./dev.db
```

*Note: If Nexconn or Groq API credentials are left blank, DealGuard runs in its high-fidelity verified sandbox mode, allowing seamless local evaluation.*

---

## 🎬 How to Run the Demo Seed Script

To seed synthetic properties, test users, and print the two demo video beats, run:

```bash
# Using npm
npm run seed:demo

# Or using pnpm
pnpm run seed:demo
```

### The Two Demo Video Beats:

1. **Beat 1 (Trust Shield — P2P Scam Flag)**:
   - Send: `"Please transfer the booking amount to this UPI ID before I show you the flat"`
   - Result: Instant red Trust Shield badge directly on the bubble warning the buyer against advance viewing deposits.

2. **Beat 2 (Hot-Lead Radar — Walkaway Risk & Audio Briefing)**:
   - Send: `"ok nvm I'll look elsewhere"`
   - Result: In-channel broker escalation notice + immediate spoken AI voice briefing synthesized into the Agent Radar (`/agent`) view with waveform playback.

---

## 🛠️ Development & Build

```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Run TypeScript checks
npm run lint

# Build production bundle
npm run build
```

---

## 🛡️ License & Ethics

All property data and profiles in this repository are synthetic. Built for the Nexconn Build Challenge 2026.
