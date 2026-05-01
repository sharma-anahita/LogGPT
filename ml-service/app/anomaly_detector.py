# anomaly_detector.py
from collections import deque, Counter
from datetime import datetime, timedelta
import re
import requests

class FrequencyAnomalyDetector:
    def __init__(self, window_seconds=60, error_threshold=50, buffer_size=200):
        self.window_seconds = window_seconds
        self.error_threshold = error_threshold
        self.error_logs = deque()  # stores timestamps of ERROR logs
        self.log_buffer = deque(maxlen=buffer_size)  # stores recent logs

    def get_severity(self):
        count = len(self.error_logs)
        if count > self.error_threshold * 2:
            return "HIGH"
        elif count > self.error_threshold * 1.5:
            return "MEDIUM"
        elif count > self.error_threshold:
            return "LOW"
        else:
            return None

    def add_log(self, log):
        # Add every log to the buffer
        self.log_buffer.append(log)

        # Only consider logs with level ERROR for anomaly detection
        level = log.get('level', '').lower()
        if level != 'error':
            return False, None, None
        # Parse timestamp
        ts = log.get('timestamp')
        try:
            log_time = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        except Exception:
            log_time = datetime.utcnow()
        self.error_logs.append(log_time)
        self._remove_old_logs(log_time)
        severity = self.get_severity()
        if severity:
            print(f"ANOMALY DETECTED ({severity}) at {log_time.isoformat()}")
            # Return a copy of the recent logs for further processing
            return True, list(self.log_buffer), severity
        return False, None, None

    def _remove_old_logs(self, now):
        # Remove logs outside the rolling window
        window_start = now - timedelta(seconds=self.window_seconds)
        while self.error_logs and self.error_logs[0] < window_start:
            self.error_logs.popleft()

def summarize_logs(logs):
    """
    Groups similar log messages and counts their frequency.
    Returns a list of summary strings like '120x DB connection timeout'.
    """
    # Normalize messages: remove variable parts (e.g., numbers, IDs, timestamps)
    def normalize(msg):
        # Remove numbers, UUIDs, and extra whitespace
        msg = re.sub(r'\b[0-9a-fA-F]{8,}\b', '', msg)  # remove long hex strings (UUIDs)
        msg = re.sub(r'\d+', '', msg)  # remove numbers
        msg = re.sub(r'\s+', ' ', msg).strip()
        return msg.lower()

    messages = [normalize(log.get('message', '')) for log in logs]
    counter = Counter(messages)
    summary = [f"{count}x {msg}" for msg, count in counter.items() if msg]
    return summary

def generate_log_summary(aggregated_logs, api_key, model="llama3-8b-8192"): 
    """
    Calls an LLM (e.g., Groq API) to generate a human-readable summary of log anomalies.
    Args:
        aggregated_logs: List of strings like ["120x DB timeout", "40x invalid token"]
        api_key: Your Groq API key
        model: Model name (default: llama3-8b-8192)
    Returns:
        summary: String summary from the LLM
    """
    prompt = (
        "You are a helpful assistant. Given the following list of frequent error messages, "
        "write a short paragraph summarizing what is happening in the system.\n"
        "Errors:\n" + "\n".join(aggregated_logs)
    )
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=data,
        timeout=30
    )
    response.raise_for_status()
    result = response.json()
    return result["choices"][0]["message"]["content"].strip()
