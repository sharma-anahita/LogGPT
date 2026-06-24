# ⚙️ Installation and Setup Guide

This document describes how to set up, configure, and run LogGPT both locally (native development) and via Docker Compose.

---

## 📋 Prerequisites

Before starting, make sure you have the following installed:
* **Node.js** (v18 or higher) & **npm**
* **Python** (v3.10 or higher) & **pip**
* **Docker** & **Docker Compose** (if running via containerized stack)
* **PostgreSQL** (if running locally)
* **Apache Kafka** (if running locally)
* **Groq API Key** (for AI-driven log/anomaly summarization)

---

## 🌍 Environment Variables

Create a `.env` file in the project root directory. Below is the reference environment configuration:

```env
# Server Port
PORT=5000

# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=loggpt
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_SSL=false
# Alternatively, use DATABASE_URL (takes precedence)
# DATABASE_URL=postgresql://user:pass@host:port/dbname

# Authentication (JWT)
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Apache Kafka
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=logs-topic

# AI / Large Language Model (Groq API)
GROQ_API_KEY=gsk_your_groq_api_key_goes_here
LLM_MODEL=llama-3.1-8b-instant
```

---

## 🐳 Running with Docker Compose (Recommended)

Docker Compose starts Zookeeper, Kafka, PostgreSQL, the Backend, and the ML Service automatically.

1. **Start the containers**:
   ```bash
   docker-compose up --build -d
   ```
2. **Initialize the Database**:
   Since the tables need to be created in the Postgres container:
   ```bash
   docker-compose exec backend node init-db.js
   ```
3. **Run the Frontend**:
   Since the frontend is run separately in development mode:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` to access the application.

---

## 💻 Running Locally (Native Setup)

For active development, you may want to run services individually.

### 1. Database Setup
1. Ensure your PostgreSQL service is running.
2. Initialize the schema:
   ```bash
   cd backend
   npm install
   node init-db.js
   ```

### 2. Kafka Setup
Ensure Zookeeper and Kafka are running on your system.
* Topic creation (optional, auto-creation is enabled in the producer):
  ```bash
  kafka-topics.sh --create --topic logs-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
  ```

### 3. Start Backend API Server
The backend hosts the API and the background log consumer.
```bash
cd backend
npm install
npm start
```
The server will run at `http://localhost:5000`.

### 4. Start ML Anomaly Detection Service
1. Create a virtual environment and install dependencies:
   ```bash
   cd ml-service
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   
   pip install -r requirements.txt
   ```
2. Run the FastAPI application:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The ML Service starts a background thread that connects to Kafka and begins monitoring the logs.

### 5. Start Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the platform.

---

## 🧪 Verifying the Installation

You can run an end-to-end integration test of the backend pipeline using the test script:
```bash
# In the root folder (make sure backend & Kafka are running)
node test-full-pipeline.js
```
The script will programmatically:
1. Create a test session.
2. Send test logs to Kafka.
3. Wait 5 seconds for the consumer.
4. Retrieve the logs and session parameters from the database to confirm success.
