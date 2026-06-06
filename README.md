# LogGPT — AI-Powered Log Observability Platform

<div align="center">

![LogGPT Banner](https://img.shields.io/badge/LogGPT-AI%20Observability-00f0ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzAwZjBmZiIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01LTEwIDV6TTIgMTJsMTAgNSAxMC01LTEwLTUtMTAgNXoiLz48L3N2Zz4=)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-3.9-231F20?style=flat-square&logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**Understand your infrastructure like never before.**

LogGPT is a production-grade AI observability platform that ingests logs, detects anomalies in real-time using machine learning, and generates human-readable incident summaries powered by LLMs — all in a stunning glassmorphism UI.

[Live Demo](#) · [Report Bug](issues) · [Request Feature](issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture--system-design)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Example Workflow](#-example-workflow)
- [Challenges Solved](#-challenges-solved)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

LogGPT is a **full-stack, event-driven log analysis platform** built for SREs, DevOps engineers, and platform teams who need immediate, intelligent visibility into their infrastructure. 

The platform ingests raw logs (JSON, plaintext, CSV) through a Kafka-backed pipeline, processes them in real-time, and uses a **sliding-window frequency anomaly detector** to flag error spikes. When anomalies are found, an LLM (via Groq API) generates plain-English incident summaries — so your team understands *what's happening* without digging through raw log output.

```
Upload Logs → Kafka → ML Anomaly Detection → LLM Summarization → Dashboard
```

> **Portfolio Note:** This project demonstrates event-driven microservice architecture, async ML pipelines, and modern full-stack development practices suitable for production workloads.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔴 **Real-time Anomaly Detection** | Sliding-window frequency analysis flags error spikes the moment they cross configurable thresholds |
| 🤖 **LLM Incident Summaries** | Groq-powered LLM generates concise, actionable incident summaries from raw log patterns |
| 📡 **Kafka-backed Ingestion** | Async log pipeline decouples upload from processing; gracefully falls back to direct DB writes if Kafka is unavailable |
| 📂 **Multi-format Log Support** | Accepts JSON objects, JSON arrays, plaintext (newline-delimited), and CSV — auto-parsed on upload |
| 🔐 **JWT + Google OAuth** | Secure authentication with email/password (bcrypt) and Google Identity Services sign-in |
| 🗂️ **Session Management** | Organize logs into named sessions; view per-session log counts, anomaly counts, and status at a glance |
| 💎 **Glassmorphism UI** | Premium dark UI built with Next.js, Framer Motion, and Tailwind CSS — responsive and animated |
| 🐳 **Fully Dockerized** | One-command local setup via Docker Compose; production-ready for Render, Vercel, Neon/Supabase |

---

## 🏗️ Architecture / System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│   Next.js 14 · Framer Motion · Tailwind CSS · Glassmorphism UI     │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / REST
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js / Express)                  │
│  Auth (JWT + Google OAuth) · Session CRUD · Log Upload · Summaries │
└───────┬───────────────────────────────────────────┬─────────────────┘
        │ Kafka Produce                             │ Direct DB fallback
        ▼                                           │
┌───────────────────┐                               │
│   Apache Kafka    │                               │
│   (logs-topic)    │                               │
└───────┬───────────┘                               │
        │                                           │
        ├──────────────────────────┐                │
        │ Consume                  │ Consume         │
        ▼                          ▼                 │
┌──────────────────┐   ┌──────────────────────┐    │
│  Backend Worker  │   │  ML Service (Python)  │    │
│  (log storage)   │   │  FastAPI + Kafka      │    │
│                  │   │  Frequency Detector   │    │
│                  │   │  Groq LLM Summaries   │    │
└────────┬─────────┘   └──────────┬────────────┘    │
         │                        │                  │
         └──────────┬─────────────┘◄─────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │   PostgreSQL DB   │
         │  (Neon / Local)   │
         │                   │
         │  users            │
         │  sessions         │
         │  logs             │
         │  anomalies        │
         └──────────────────┘
```

### Data Flow

1. **Upload** — User uploads logs (file or paste) via the frontend
2. **Parse** — Backend's `logParser.js` normalizes logs to a standard schema
3. **Produce** — Parsed logs are batched and sent to Kafka `logs-topic`
4. **Consume (Storage)** — Backend's embedded Kafka consumer reads and persists logs to PostgreSQL
5. **Consume (ML)** — The Python ML service reads the same topic, runs frequency anomaly detection per session
6. **Anomaly Storage** — Detected anomalies (with LLM descriptions) are written to the `anomalies` table
7. **Display** — Frontend polls the API to render logs, anomalies, and AI summaries in real-time

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14 | React framework, routing, API proxying |
| Framer Motion | 10 | Page transitions, animated components |
| Tailwind CSS | 3 | Utility-first styling |
| Axios | 1.6 | HTTP client with JWT interceptors |
| date-fns | 2.30 | Timestamp formatting |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | 5 | REST API framework |
| KafkaJS | 2.2 | Kafka producer/consumer |
| pg | 8.20 | PostgreSQL client |
| jsonwebtoken | 9.0 | JWT signing/verification |
| bcryptjs | 2.4 | Password hashing |

### ML Service
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 | Runtime |
| FastAPI | 0.115 | HTTP health endpoint |
| kafka-python | 2.0 | Kafka consumer |
| psycopg2 | 2.9 | PostgreSQL client |
| Groq API | — | LLM inference (llama3-8b-8192) |

### Infrastructure
| Technology | Purpose |
|---|---|
| Apache Kafka 3.9 | Async message streaming |
| PostgreSQL 15 | Primary datastore |
| Docker Compose | Local orchestration |
| Neon / Supabase | Cloud PostgreSQL (production) |
| Render | Backend + ML service hosting |
| Vercel | Frontend hosting |

---

## 📁 Folder Structure

```
loggpt/
├── frontend/                    # Next.js 14 application
│   ├── app/
│   │   ├── layout.jsx           # Root layout + providers
│   │   ├── page.jsx             # Landing page
│   │   ├── login/page.jsx       # Login with email & Google
│   │   ├── register/page.jsx    # Registration page
│   │   └── workspace/page.jsx   # Protected workspace
│   ├── components/
│   │   ├── workspace/
│   │   │   ├── Sidebar.jsx      # Session list + navigation
│   │   │   ├── MainContent.jsx  # Logs, anomalies, upload
│   │   │   ├── UploadForm.jsx   # Drag-and-drop log uploader
│   │   │   ├── LogsPanel.jsx    # Paginated log viewer
│   │   │   ├── AnomaliesPanel.jsx   # Anomaly cards
│   │   │   ├── AISummaryPanel.jsx   # LLM summary with typewriter
│   │   │   └── Header.jsx       # Session header / stats
│   │   ├── dialogs/             # Reusable modal dialogs
│   │   ├── AnimatedBackground.jsx
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── AIDemoSection.jsx    # Live animated demo
│   │   └── CTASection.jsx
│   ├── services/
│   │   ├── api.js               # Axios instance + API helpers
│   │   └── auth.js              # Token management + auth calls
│   ├── next.config.js           # Rewrites to proxy /api/* → backend
│   └── tailwind.config.js
│
├── backend/                     # Node.js / Express API
│   ├── src/
│   │   ├── app.js               # Express app entry point
│   │   ├── config/database.js   # PostgreSQL pool
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, Google OAuth
│   │   │   ├── logController.js     # Log upload + Kafka producer
│   │   │   └── sessionController.js # Session CRUD + logs/anomalies
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT verification
│   │   ├── producers/
│   │   │   └── kafkaProducer.js     # Kafka producer (singleton)
│   │   ├── consumers/
│   │   │   └── logConsumer.js       # Kafka consumer (log storage)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── logRoutes.js
│   │   │   ├── sessionRoutes.js
│   │   │   └── summaryRoutes.js     # Groq LLM summary endpoint
│   │   └── utils/
│   │       └── logParser.js         # Multi-format log normalization
│   ├── init-db.js               # One-time DB schema setup script
│   └── Dockerfile
│
├── ml-service/                  # Python anomaly detection service
│   ├── app/
│   │   ├── main.py              # FastAPI app + lifespan startup
│   │   ├── kafka_consumer.py    # Kafka consumer + pipeline orchestration
│   │   └── anomaly_detector.py  # Sliding-window detector + LLM summary
│   ├── requirements.txt
│   └── Dockerfile
│
├── kafka/
│   └── Dockerfile               # Apache Kafka (KRaft mode, no Zookeeper)
│
├── shared/
│   └── schemas/log.schema.json  # JSON Schema for normalized log events
│
└── docker-compose.yml           # Full local stack orchestration
```

---

## 🚀 Installation

### Prerequisites

- [Docker](https://docker.com/) & Docker Compose
- [Node.js 20+](https://nodejs.org/) (for local frontend development)
- [Python 3.11+](https://python.org/) (for local ML service development)
- A [Groq API key](https://console.groq.com/) (free tier available)

### Option 1 — Docker Compose (Recommended)

Clone and spin up the full stack with a single command:

```bash
git clone https://github.com/your-username/loggpt.git
cd loggpt

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your values (see Configuration section)

# Initialize the database schema
docker compose run --rm backend node init-db.js

# Start all services
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| ML Service | http://localhost:8000 |
| Kafka | localhost:9092 |
| PostgreSQL | localhost:5432 |

### Option 2 — Local Development

**1. Start infrastructure only:**
```bash
docker compose up zookeeper kafka postgres -d
```

**2. Backend:**
```bash
cd backend
npm install
cp .env.example .env   # fill in values
node init-db.js        # run once to create tables
npm run dev            # starts on port 5000
```

**3. ML Service:**
```bash
cd ml-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**4. Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # starts on port 3000
```

---

## ⚙️ Configuration

### Root `.env` (Docker Compose / Backend / ML Service)

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=loggpt
POSTGRES_HOST=postgres          # 'postgres' in Docker, 'localhost' locally
POSTGRES_PORT=5432

# OR use a connection string (Neon / Supabase):
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Auth
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Kafka
KAFKA_BROKER=kafka:29092        # 'kafka:29092' in Docker, 'localhost:9092' locally

# LLM
GROQ_API_KEY=gsk_your_groq_api_key
LLM_MODEL=llama3-8b-8192

# CORS (comma-separated frontend origins)
CORS_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app
```

### Frontend `.env.local`

```env
# Backend API base URL (used for auth calls)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Backend URL for Next.js rewrites (/api/* proxy)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Getting a Groq API Key

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create a new API key
3. The free tier is sufficient for development and moderate usage

### Setting Up Google OAuth *(optional)*

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add your frontend URL to Authorized JavaScript origins
4. Copy the Client ID into `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

---

## 📖 Usage Guide

### 1. Create an Account
Navigate to `/register` and sign up with email/password or Google.

### 2. Create a Session
In the workspace sidebar, click **+ New Session** and give it a meaningful name (e.g., `"Payment Service — June 3"`).

### 3. Upload Logs
In the main panel, either:
- **Drag and drop** a `.log`, `.json`, or `.txt` file onto the upload area
- **Paste** raw log text directly into the text area

Supported formats:
```
# Plaintext
2024-06-01T12:00:00Z ERROR payment-service Connection timeout

# JSON Lines
{"timestamp":"2024-06-01T12:01:00Z","level":"error","service":"auth","message":"Token expired"}

# JSON Array
[{"level":"warn","message":"High latency detected"}, ...]
```

### 4. View Results
After upload, the dashboard automatically displays:
- **Logs Panel** — Paginated, color-coded log entries with timestamps
- **Anomalies Panel** — ML-detected anomalies with severity badges and confidence scores
- **AI Summary** — Click "Generate AI Summary" for a plain-English incident analysis

### 5. Manage Sessions
- Switch between sessions using the sidebar
- Delete sessions using the 🗑️ button (removes all associated logs and anomalies)

---

## 📡 API Reference

All protected endpoints require `Authorization: Bearer <jwt_token>` header.

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register with email + password | ❌ |
| `POST` | `/auth/login` | Login, receive JWT | ❌ |
| `POST` | `/auth/google` | Google OAuth sign-in | ❌ |

**Register / Login payload:**
```json
{ "email": "user@example.com", "password": "securepassword" }
```

### Sessions

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/sessions` | List all user sessions | ✅ |
| `POST` | `/sessions` | Create a new session | ✅ |
| `GET` | `/sessions/:id` | Get session details + counts | ✅ |
| `GET` | `/sessions/:id/logs` | Get session logs (paginated) | ✅ |
| `GET` | `/sessions/:id/anomalies` | Get session anomalies | ✅ |
| `POST` | `/sessions/:id/summary` | Generate LLM incident summary | ✅ |
| `PATCH` | `/sessions/:id/status` | Update session status | ✅ |
| `DELETE` | `/sessions/:id` | Delete session and all data | ✅ |

**Query params for logs/anomalies:** `?limit=100&offset=0` (max limit: 1000)

### Logs

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/logs/upload` | Upload and process log batch | ✅ |

**Upload payload:**
```json
{
  "sessionName": "My Incident",
  "sessionId": 42,
  "service": "payment-service",
  "logs": [
    "2024-06-01T12:00:00Z ERROR Connection failed",
    {"level": "error", "message": "Timeout", "service": "db"}
  ]
}
```

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Backend health check |
| `GET` | `http://ml-service:8000/health` | ML service health check |

---

## 🔄 Example Workflow

Here's a realistic end-to-end scenario:

```bash
# 1. Register a user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"sre@company.com","password":"secure123"}'
# → { "token": "eyJhbGci..." }

# 2. Upload logs to a new session
curl -X POST http://localhost:5000/logs/upload \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "DB Outage - June 2024",
    "service": "database",
    "logs": [
      "2024-06-01T12:00:00Z INFO Service started",
      "2024-06-01T12:01:00Z ERROR Connection pool exhausted",
      "2024-06-01T12:01:01Z ERROR Query timeout after 30s",
      "2024-06-01T12:01:02Z ERROR Retry failed - circuit breaker open"
    ]
  }'
# → { "sessionId": 7, "count": 4 }

# 3. Get anomalies detected by the ML service
curl http://localhost:5000/sessions/7/anomalies \
  -H "Authorization: Bearer eyJhbGci..."
# → [{ "type": "Error Spike", "severity": "high", "confidence": 0.95, ... }]

# 4. Get an AI-generated incident summary
curl -X POST http://localhost:5000/sessions/7/summary \
  -H "Authorization: Bearer eyJhbGci..."
# → { "summary": "The database service is experiencing severe connection pool
#     exhaustion, likely caused by a surge in concurrent queries..." }
```

---

## 🧩 Challenges Solved

### 1. Kafka Unavailability in Production
**Problem:** On cold-start cloud deployments (Render free tier), Kafka isn't always ready when the backend starts.

**Solution:** Implemented a dual-path upload strategy. The backend first attempts to send logs via Kafka with a configurable timeout (`KAFKA_UPLOAD_TIMEOUT_MS`). On failure, it automatically falls back to direct PostgreSQL inserts, keeping uploads functional even when Kafka is unavailable. The response includes `fallbackToDb: true` so clients can observe this behavior.

### 2. ML Service Startup Race Condition
**Problem:** The Python ML service would crash immediately on startup if Kafka wasn't ready yet.

**Solution:** Implemented exponential backoff retry logic in `create_consumer_with_retry()` — up to 15 attempts with waits that cap at 30 seconds. The FastAPI health endpoint stays responsive during retries, so orchestrators don't kill the container prematurely.

### 3. Multi-format Log Parsing
**Problem:** Real-world logs arrive in many formats — structured JSON, JSON lines, plaintext with varying timestamp formats, and mixed arrays.

**Solution:** The `logParser.js` utility auto-detects format (JSON object, JSON string, or plaintext), normalizes field names (case-insensitive), extracts timestamps via regex, and infers log levels. This means users can paste almost any log format without pre-processing.

### 4. Per-session Anomaly Detection State
**Problem:** The ML service must maintain separate detection windows for each session simultaneously, without cross-contaminating anomaly signals.

**Solution:** Used a `detectors` dictionary keyed by `sessionId` in the Kafka consumer. Each session gets its own `FrequencyAnomalyDetector` instance with independent sliding windows and error counters.

### 5. CORS in Multi-origin Deployments
**Problem:** Frontend deployed on Vercel (dynamic preview URLs) needed to communicate with a backend on Render.

**Solution:** Made allowed origins configurable via `CORS_ORIGIN` environment variable (comma-separated), merged at runtime with a hardcoded list of known origins. This supports both production deployments and local development without code changes.

---

## 🔮 Future Improvements

- [ ] **WebSocket / SSE streaming** — Push log and anomaly updates to the frontend in real-time instead of polling
- [ ] **Advanced anomaly algorithms** — Add DBSCAN clustering, Z-score detection, and seasonal decomposition alongside the frequency detector
- [ ] **Alerting integrations** — Slack, PagerDuty, and webhook notifications when anomalies are detected
- [ ] **Log search** — Full-text search across log messages using PostgreSQL `tsvector` or Elasticsearch
- [ ] **Multi-tenant teams** — Workspace sharing with role-based access control (RBAC)
- [ ] **Log retention policies** — Automatic pruning of old logs with configurable TTL per session
- [ ] **Metrics dashboard** — Time-series charts of log volume, error rates, and anomaly frequency using Recharts
- [ ] **Custom anomaly rules** — Let users define threshold rules via the UI (e.g., "alert if >10 errors/minute")
- [ ] **Export** — Download session data as CSV or JSON
- [ ] **API key auth** — Token-based authentication for programmatic log ingestion from CI/CD pipelines

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Make** your changes and add tests where relevant
4. **Ensure** Docker Compose startup works: `docker compose up --build`
5. **Commit** with a clear message: `git commit -m "feat: add WebSocket support for live log streaming"`
6. **Push** and open a **Pull Request** against `main`

### Development Guidelines

- Follow the existing code style (ESLint for JS, standard Python formatting)
- Keep PRs focused — one feature or fix per PR
- Update this README if you add new environment variables or endpoints
- Mark any assumptions or trade-offs in PR description comments

### Reporting Issues

Please include:
- Your OS and Docker version
- The service that's failing (frontend / backend / ml-service)
- Relevant logs from `docker compose logs <service>`
- Steps to reproduce

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

> *Assumption: MIT license inferred from open-source conventions; no LICENSE file was present in the repository. Add one by running `npx license-generator mit` in the project root.*

---

<div align="center">

Built with ❤️ for the SRE and DevOps community.

**LogGPT** — *Because your logs deserve better than `grep`.*

</div>
