# matrix-bot

A lightweight Matrix bot that authenticates as an Application Service (AS) against Synapse/MAS and forwards incoming Matrix events to an external microservice via webhook or write a textmessage to an existing channel

## Why I build this

I wanted a lightweight bot that triggers commands in my home setup in a dedicated separate microservice, so I could automate commands with an easy to access interface (A Matrix client).

## Features

- Authenticates with Matrix Synapse (and MAS) using AS token / HS token
- Forwards received Matrix room events to a configurable webhook endpoint
- Built-in observability: structured logging (Pino), metrics (Prometheus), tracing (OpenTelemetry), and profiling (Pyroscope) — designed to ship straight into a Grafana stack (Loki, Mimir, Tempo, Pyroscope)
- `/health` and `/metrics` endpoints (using the npm packages [oxlint-config](https://www.npmjs.com/package/@yauseyea/oxlint-config), [node-observability](https://www.npmjs.com/package/@yauseyea/node-observability)
- Tested with Vitest

## How it works

The bot registers as a Matrix Application Service. When it receives an event from the homeserver, it transforms and forwards it as a POST request to a configured webhook URL, e.g.:

```json
{
  "room_id": "room123",
  "event_id": "event111",
  "sender": "sender222",
  "body": "A test message",
  "timestamp": "1234567890"
}
```

## Requirements

- Node.js
- A running Matrix homeserver (Synapse) with Application Service support
- (Optional) Matrix Authentication Service (MAS) if using MAS-based auth
- (Optional) Grafana stack for observability: Loki, Mimir, Tempo, Pyroscope

## Installation

```bash
git clone https://github.com/yauseyea/matrix-bot.git
cd matrix-bot
npm install
```

## Configuration

The bot is configured via environment variables. Copy the `ressources/example.env` file in the project root and rename it to `.env`:

> Adjust variable names above to match your actual `config.ts` — update this section with the real keys your config module reads.

You'll also need a Matrix Application Service registration file (`registration.yaml`) pointing at this bot, registered with your homeserver. see an example in `ressources/registration.yaml`

## Usage

**Production build**

```bash
npm i
npm start
```

## Testing

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

## Linting & Formatting

```bash
npm run lint
npm run lint:fix
npm run format
```

## Endpoints

see ressources/open-api-example.json for more details

| Endpoint          | Description                              |
| ----------------- | -----------------------------------------|
| `/health`         | Liveness/health check                    |
| `/metrics`        | Prometheus-compatible metrics            |
| `/matrix/message` | Responds to a specific Matrix channel    |

## Observability

- **Logs** — structured via Pino, shippable to Loki (`pino-loki`)
- **Metrics** — exposed in Prometheus format via `prom-client`
- **Tracing** — OpenTelemetry auto-instrumentation, exportable via OTLP (e.g. to Tempo)
- **Profiling** — continuous profiling via Pyroscope

## Tech Stack

- [Express](https://expressjs.com/) — HTTP server
- [matrix-bot-sdk](https://github.com/turt2live/matrix-bot-sdk) — Matrix AS integration
- [Pino](https://getpino.io/) — logging
- [Vitest](https://vitest.dev/) — testing
- TypeScript

## License

MIT — see [LICENSE](./LICENSE)

## Author

Andrei Yauseyenka
