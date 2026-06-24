# 🔗 LogGPT API Reference

The LogGPT backend is a REST API built with Node.js and Express. It requires JWT bearer token authentication for all non-public endpoints.

---

## 🔑 Authentication

All protected endpoints require the client to supply a valid JSON Web Token (JWT) in the HTTP headers:
```http
Authorization: Bearer <your_jwt_token_here>
```
If the token is missing, expired, or invalid, the API returns a `401 Unauthorized` response.

---

## 👥 Authentication Endpoints (Public)

### 1. Register User
Create a new user account on the platform. On success, a JWT token is returned immediately so the client is logged in.
* **URL**: `/auth/register`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2. Login User
Authenticate credentials and return a token.
* **URL**: `/auth/login`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": 1,
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 📂 Session Endpoints (Protected)

### 1. Create Session
Create an analysis session.
* **URL**: `/sessions`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "name": "Docker Test Session",
    "config": {
      "service": "payment-service"
    }
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "id": 12,
    "user_id": 1,
    "name": "Docker Test Session",
    "status": "processing",
    "config": {
      "service": "payment-service"
    },
    "created_at": "2026-06-24T09:00:00Z"
  }
  ```

### 2. Get All Sessions
Lists all analysis sessions belonging to the authenticated user.
* **URL**: `/sessions`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 12,
      "name": "Docker Test Session",
      "status": "processing",
      "log_count": "150",
      "anomaly_count": "2",
      "created_at": "2026-06-24T09:00:00Z"
    }
  ]
  ```

### 3. Get Session Details
Fetch detailed parameters of a single session.
* **URL**: `/sessions/:id`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  {
    "id": 12,
    "name": "Docker Test Session",
    "status": "processing",
    "config": {
      "service": "payment-service"
    },
    "created_at": "2026-06-24T09:00:00Z",
    "log_count": "150",
    "anomaly_count": "2"
  }
  ```

### 4. Fetch Session Logs
Retrieve parsed log entries belonging to a specific session.
* **URL**: `/sessions/:id/logs`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 45,
      "timestamp": "2026-06-24T08:59:55Z",
      "level": "error",
      "service": "payment-service",
      "message": "Payment gateway timeout after 5 retries",
      "raw": "[2026-06-24T08:59:55Z] [error] payment-service: Payment gateway timeout after 5 retries"
    }
  ]
  ```

### 5. Fetch Session Anomalies
Retrieve detected anomaly incidents belonging to a specific session.
* **URL**: `/sessions/:id/anomalies`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 3,
      "type": "Error Spike",
      "severity": "high",
      "start_time": "2026-06-24T08:59:59Z",
      "description": "Error spike detected: 120x payment gateway timeout",
      "metadata": {
        "confidence": 0.95
      }
    }
  ]
  ```

### 6. Delete Session
Delete a session and all cascade-related logs and anomalies.
* **URL**: `/sessions/:id`
* **Method**: `DELETE`
* **Response (200 OK)**:
  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

---

## 📤 Log Ingestion Endpoints (Protected)

### 1. Ingest/Upload Logs
Upload raw or formatted log lines to trigger parsing, Kafka queue streaming, and ML anomaly evaluation.
* **URL**: `/logs/upload`
* **Method**: `POST`
* **Request Body**:
  * **Formatted Payload** (JSON logs):
    ```json
    {
      "sessionId": 12,
      "service": "payment-service",
      "logs": [
        {
          "timestamp": "2026-06-24T08:59:55Z",
          "level": "error",
          "message": "Payment gateway timeout after 5 retries",
          "service": "payment-service"
        }
      ]
    }
    ```
  * **Raw Text Payload**:
    ```json
    {
      "sessionId": 12,
      "service": "payment-service",
      "logs": [
        "2026-06-24T08:59:55Z [error] Payment gateway timeout"
      ]
    }
    ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Logs sent to kafka successfully",
    "sessionId": 12,
    "count": 1
  }
  ```

---

## 🤖 AI Summary Endpoints (Protected)

### 1. Generate AI Session Summary
Queries the Groq API (using the Llama 3 model) to write a detailed incident summary combining the session status, log metrics, and anomalies detected.
* **URL**: `/sessions/:id/summary`
* **Method**: `POST`
* **Response (200 OK)**:
  ```json
  {
    "summary": "The payment-service experienced a severe error spike between 08:59:50 and 09:00:00, leading to a 95% anomaly confidence. The root cause appears to be 'Payment gateway timeout after 5 retries' accompanied by 'Database connection pool exhausted'. It is recommended to immediately scale up the connection pool and check downstream payment provider latencies."
  }
  ```
