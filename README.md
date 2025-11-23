# ElevenLabs voice-agent Expo demo

An Expo (React Native) showcase for a **car-leasing concierge** built with the `@elevenlabs/react-native`
SDK. The agent narrates lease options, captures driver profiles, and can demo multiple delivery
packages for a leasing organization. The ElevenLabs agent can:

- start/end real-time conversations via LiveKit
- call client tools to **navigate tabs** and **edit the intake form**
- submit, reset, or read the form payload to prove full duplex control

The UI is built with Expo Router + TypeScript and targets development builds (Expo Go does **not** support the ElevenLabs native modules).

## Prerequisites

- Node.js ≥ 20.19 (per React Native 0.81 requirement)
- Xcode 15 / Android Studio (or Expo dev clients) for running native builds
- ElevenLabs Agent ID with microphone permissions enabled

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables in `app.json`/`app.config.ts` or via shell before `expo start`:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `EXPO_PUBLIC_ELEVENLABS_AGENT_ID` | ✅ | Agent ID to dial (shown in the console header) |
   | `EXPO_PUBLIC_ELEVENLABS_TOKEN_URL` | optional | Custom token endpoint if you proxy ElevenLabs |
   | `EXPO_PUBLIC_DEMO_USER_ID` | optional | Static user identifier for conversation metadata |

3. Launch the dev server and build target:

   ```bash
   npx expo start --dev-client
   ```

   Use `npm run ios`, `npm run android`, or `npm run web` for shortcuts.

## ElevenLabs agent configuration

Define the following *client tools* in the ElevenLabs dashboard so the agent can drive the demo:

| Tool name | Expected payload | Effect |
| --- | --- | --- |
| `navigate_screen` | `{ "screen": "home" | "services" | "intake" }` | switches the active tab |
| `fill_intake_form` | `{ "field": "email", "value": "demo@11labs.io" }` or `{ "values": { "name": "...", "notes": "..." } }` | updates any intake form field |
| `submit_intake_form` | none | triggers the same submit handler as the UI button |
| `reset_intake_form` | none | clears all fields |
| `read_intake_form` | none | returns the current JSON payload (useful for summarizing) |

All tools return a string response so the agent can narrate the outcome.

## App tour

- **Overview tab** – dealership-friendly story, curated prompts (e.g., “find me an SUV under $650/mo”), and the live `VoiceAgentConsole`.
- **Services tab** – three implementation packages tailored to showroom, digital desk, and fleet/franchise teams.
- **Intake tab** – driver & vehicle profile backed by `IntakeFormContext`; the agent fills or submits it hands-free.

Global providers live in `app/_layout.tsx`:

1. `ElevenLabsProvider` (SDK wiring)
2. `IntakeFormProvider` (state + helpers)
3. `VoiceAgentProvider` (client tool registry, navigation hooks, logs, mic control)

## Useful scripts

```bash
npm run lint     # ESLint via expo
npm run ios      # Start iOS dev client
npm run android  # Start Android dev client
npm run web      # Web preview (voice agent disabled)
```

> ℹ️ LiveKit & ElevenLabs require a development build (not Expo Go). Use `expo prebuild`/`run` workflows or Expo Dev Clients.
