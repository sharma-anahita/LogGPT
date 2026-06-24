# 🚀 LogGPT: Multi-User SaaS Log Analysis & Anomaly Detection

LogGPT is a production-ready, event-driven log parsing, anomaly detection, and AI summarization platform. It enables DevOps and SRE teams to stream system logs in real-time, instantly detect spikes in error frequency, and obtain natural language summaries of incident root causes using Large Language Models (LLMs) via the Groq API.

---

## 🌟 Key Features

* **Real-time Log Ingestion**: Decoupled sync/async ingestion using Apache Kafka.
* **Sliding-Window Anomaly Detection**: Real-time evaluation of error log frequency spikes in a rolling 60-second window.
* **AI-Powered Incident Summaries**: Instant root-cause descriptions using Groq LLM API (Llama 3 models).
* **Multi-Tenant Security**: Strict user authentication and data isolation using JSON Web Tokens (JWT) and PostgreSQL index optimization.
* **Modern Interface**: Next.js dashboard with responsive session logs, real-time analytics, and incident summaries.

---

## 📚 Documentation Index

All system documentation is organized inside the `docs/` folder:

### ⚙️ Getting Started
* ⚡ **[Quick Start Guide](file:///d:/LogGPT/docs/quick_start.md)**: Jump right in. Set up dependencies, environment variables, and verify with the integration test in 5 minutes.
* 💻 **[Installation and Setup](file:///d:/LogGPT/docs/installation.md)**: Detailed step-by-step instructions for running locally (native setup) vs. via Docker Compose.
* 🆘 **[Troubleshooting Guide](file:///d:/LogGPT/docs/troubleshooting.md)**: Common setup pitfalls, Kafka connectivity retries, JWT token resets, and database troubleshooting.

### 🏗️ Architecture & Internals
* 🏗️ **[System Architecture](file:///d:/LogGPT/docs/architecture.md)**: Visual overview, component layout, and description of log ingestion and consumer pipelines.
* 🧠 **[Anomaly Detection & ML Service](file:///d:/LogGPT/docs/anomaly_detection_ml.md)**: Explanation of the Python ML Service, sliding-window algorithms, log normalization techniques, and Groq API prompting.
* 🗄️ **[Database Schema & Security](file:///d:/LogGPT/docs/database_schema.md)**: Entity Relationship (ER) diagrams, indices, and description of tables ensuring strict user data isolation.

### 🔌 API Reference & Manifests
* 🔗 **[API Reference](file:///d:/LogGPT/docs/api_reference.md)**: Complete request and response specifications for registration, sessions, log ingestion, and AI summaries.
* 🔐 **[SaaS Authentication Transition Details](file:///d:/LogGPT/docs/authentication_implementation.md)**: Technical breakdown of how LogGPT transitioned from a single-user demo to a secure SaaS model.
* 📋 **[Workspace Changes Manifest](file:///d:/LogGPT/docs/file_manifest.md)**: Historic list of files modified during the multi-user SaaS implementation.