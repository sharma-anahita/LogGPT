# 🆘 Troubleshooting Guide

This guide contains common issues, configuration mistakes, and setup errors you might encounter while developing, deploying, or testing LogGPT, along with their solutions.

---

## 🔐 Authentication & Session Issues

### 1. "No token provided" or "Token is invalid"
* **Symptom**: API endpoints return `401 Unauthorized` or requests fail with "No token provided".
* **Reason**: The client is either not logged in or the JWT saved in the browser's `localStorage` is missing/corrupted.
* **Solution**:
  1. Open the browser console and check if a token is saved:
     ```javascript
     localStorage.getItem("token")
     ```
  2. Clear the browser's storage and log in again:
     ```javascript
     localStorage.clear()
     ```
  3. Ensure that your frontend service has the correct environment variable `NEXT_PUBLIC_API_URL` pointing to the backend (default: `http://localhost:5000`).

### 2. "JWT_SECRET not found" on startup
* **Symptom**: Backend crashes immediately on boot.
* **Reason**: The environment variable `JWT_SECRET` is missing.
* **Solution**: Edit your `.env` file in the root directory (or in the `backend/` folder) and add:
  ```env
  JWT_SECRET=use_a_strong_random_secret_here
  ```

---

## 🗄️ Database Connection Issues

### 1. "Database connection failed" or "init-db failed"
* **Symptom**: Running `node init-db.js` fails with connection timeout or credentials errors.
* **Reason**: PostgreSQL is either not running, or the configuration variables in `.env` do not match.
* **Solution**:
  1. Ensure the PostgreSQL service is active:
     ```bash
     # Windows (Services GUI or PowerShell)
     Start-Service postgresql-x64-15
     
     # Linux
     sudo systemctl status postgresql
     ```
  2. Double-check `.env` credentials:
     ```env
     POSTGRES_USER=postgres
     POSTGRES_PASSWORD=your_actual_password
     POSTGRES_DB=loggpt
     POSTGRES_HOST=localhost
     POSTGRES_PORT=5432
     ```

### 2. "Session not found" after database re-initialization
* **Symptom**: Uploading logs fails with "Session not found" or "Invalid session ID".
* **Reason**: Running `node init-db.js` drops all tables (sessions, logs, anomalies). If the frontend browser keeps an old `sessionId` in local state, it will fail.
* **Solution**: Log out of the Next.js frontend, log in again, and create a brand-new session.

---

## 🥛 Kafka Message Queue Issues

### 1. "No brokers available" or Consumer Connection Retries
* **Symptom**: Backend console or ML Service console prints warnings like `[WARN] Kafka not available (attempt 1/15), retrying in 2s...`
* **Reason**: Kafka takes a few seconds to start up (especially inside Docker), or the broker URL is incorrect.
* **Solution**:
  * **Wait for Startup**: Both the backend consumer and the ML consumer use exponential backoff retries. If the warning disappears and you see `[✓] Connected to Kafka`, it has self-healed.
  * **Verify Host**: Inside Docker Compose, the services must communicate using `kafka:29092` (internal Docker bridge network). Outside Docker (running natively), services must communicate using `localhost:9092`. Ensure `KAFKA_BROKER` matches:
    ```env
    # Running natively on host:
    KAFKA_BROKER=localhost:9092
    
    # Running in Docker:
    KAFKA_BROKER=kafka:29092
    ```

### 2. Logs are uploaded but do not appear in the Dashboard
* **Symptom**: `POST /logs/upload` returns success, but `GET /sessions/:id/logs` returns an empty array.
* **Reason**: The Kafka consumer failed to write logs to the database, or Kafka is stuck.
* **Solution**:
  1. Check the logs of the backend container/process. You should see:
     ```text
     [Kafka] Sent X logs to topic 'logs-topic'
     [KAFKA] Message from session Y: ...
     [DB] Log saved
     ```
  2. If you see `Sent logs` but no `Message from session`, check if the consumer connected successfully on startup. Restart the backend process to trigger connection re-negotiation.

---

## 📦 Python ML Service Failures

### 1. "ModuleNotFoundError: No module named 'app'"
* **Symptom**: Running the Python service yields import errors.
* **Reason**: Python is run from the wrong directory or PYTHONPATH is not configured.
* **Solution**: Run the application from the `ml-service/` root directory using:
  ```bash
  python -m uvicorn app.main:app
  ```
  Do **not** cd into `app/` and run `uvicorn main:app`, as this breaks module resolution for importing `app.anomaly_detector`.
