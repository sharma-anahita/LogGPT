# 🧠 Anomaly Detection and ML Service

LogGPT features a real-time anomaly detection pipeline. The pipeline uses a custom sliding-window frequency detector and Large Language Model (LLM) aggregation via the Groq API to provide instant troubleshooting descriptions of system failures.

---

## 📈 The Ingest and Streaming Pipeline

The log pipeline uses Apache Kafka to buffer logs, ensuring that ingestion does not bottleneck frontend file uploads.

1. **Producer**: The Node.js Backend receives logs, maps each log object to include standard fields (`user_id`, `session_id`, `timestamp`, `level`, `service`, `message`, `raw`), and streams them to the Kafka topic `logs-topic`.
2. **Parallel Consumers**:
   * **Node.js Consumer**: Consumes messages and saves them sequentially to PostgreSQL.
   * **Python ML Consumer**: Consumes the same stream to run the real-time anomaly analysis.

---

## 🕒 Sliding-Window Anomaly Detection

The ML Service defines a class `FrequencyAnomalyDetector` (in `ml-service/app/anomaly_detector.py`) that operates on a rolling window:

* **Scope**: A separate detector instance is instantiated dynamically for each `sessionId` stream.
* **Rolling Window**: Keeps track of `ERROR` level log timestamps in a `deque` (double-ended queue) window of **60 seconds**.
* **Spike Threshold**:
  * If the count of errors within the last 60 seconds is greater than the configured `error_threshold` (default is 50), it triggers an anomaly event.
* **Severity Classification**:
  * **Low**: Error count exceeds `error_threshold`.
  * **Medium**: Error count exceeds `error_threshold * 1.5` (75 errors/min).
  * **High**: Error count exceeds `error_threshold * 2` (100 errors/min).

```python
# From anomaly_detector.py
def add_log(self, log):
    self.log_buffer.append(log)  # recent log buffer

    level = log.get('level', '').lower()
    if level != 'error':
        return False, None, None

    ts = log.get('timestamp')
    try:
        log_time = datetime.fromisoformat(ts.replace('Z', '+00:00'))
    except Exception:
        log_time = datetime.utcnow()
        
    self.error_logs.append(log_time)
    self._remove_old_logs(log_time)  # removes logs outside rolling window
    
    severity = self.get_severity()
    if severity:
        return True, list(self.log_buffer), severity
    return False, None, None
```

---

## 🧼 Log Aggregation & Normalization

Before sending logs to the LLM for summarization, we must normalize and group redundant log messages. Otherwise, thousands of duplicate lines (like "User 4858 failed login at 10:00:01" vs "User 4859 failed login at 10:00:02") would blow up token counts and create noise.

The service cleans log lines using a Regex filter that removes:
1. Long hex strings (such as UUIDs, trace IDs, database hashes).
2. Numbers (such as IDs, quantities, ports).
3. Repeating spaces.

```python
def normalize(msg):
    msg = re.sub(r'\b[0-9a-fA-F]{8,}\b', '', msg)  # remove UUIDs
    msg = re.sub(r'\d+', '', msg)                  # remove numbers
    msg = re.sub(r'\s+', ' ', msg).strip()         # clean whitespace
    return msg.lower()
```

After normalization, the messages are grouped and aggregated using Python's `Counter`, producing unique counts (e.g. `120x payment gateway timeout`).

---

## 🤖 LLM Summarization via Groq

If an anomaly is triggered and a `GROQ_API_KEY` is present in the environment:
1. The aggregated, normalized log counts are prepared (e.g. `["120x db connection timeout", "40x gateway connection error"]`).
2. An API request is sent to `https://api.groq.com/openai/v1/chat/completions`.
3. The server uses a specified LLM (default is `llama-3.1-8b-instant` or `llama3-8b-8192`) to generate a concise summary.

### Prompt Template:
```text
You are a helpful assistant. Given the following list of frequent error messages, write a short paragraph summarizing what is happening in the system.
Errors:
120x db connection timeout
40x gateway connection error
```

### Incident Description Save:
The LLM response is caught and saved directly into the `anomalies` table under the `description` column. In the UI, this displays as a highly professional SRE summary describing the exact failure cascade.
