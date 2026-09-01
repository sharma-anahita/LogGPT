# anomaly_detector.py
from collections import deque, Counter
from datetime import datetime, timedelta
import re
import requests
# ml-service/app/anomaly_detector.py
from collections import deque
import torch
import torch.nn.functional as F
from app.models.deeplog import DeepLogLSTM
from app.utils.log_parser import LogTemplateParser

class DeepLogAnomalyDetector:
    def __init__(self, model_path="d:/LogGPT/model/deeplog_model.pth", parser_state="d:/LogGPT/model/drain_state.bin", candidate_g=3):
        # 1. Load the template miner/parser (in read-only inference mode)
        self.parser = LogTemplateParser(persistence_path=parser_state)
        
        # 2. Load the trained PyTorch model
        checkpoint = torch.load(model_path)
        self.window_size = checkpoint.get('window_size', 10)
        self.vocab_size = checkpoint.get('vocab_size')
        
        self.model = DeepLogLSTM(vocab_size=self.vocab_size)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()
        
        # 3. Anomaly detection parameters
        self.candidate_g = candidate_g  # The top-g predicted options
        
        # 4. Session memory (stores recent template IDs per session)
        self.session_windows = {}
        # Keep a buffer of raw logs for LLM summarization context
        self.session_raw_buffers = {}
        
    def add_log(self, session_id, log) -> tuple[bool, list, str]:
        """
        Processes a single log from Kafka.
        Returns:
            (is_anomaly, list_of_recent_raw_logs, severity)
        """
        message = log.get('message', '')
        level = log.get('level', '').upper()
        
        # Parse the message to its template ID (do not update trained template miner dynamically)
        template_id = self.parser.parse_message(message, update_templates=False)
        
        # Guard: coerce new or out-of-vocabulary templates to 0 (unknown/padding index)
        if template_id >= self.vocab_size:
            template_id = 0
            
        # Initialize session state if missing
        if session_id not in self.session_windows:
            self.session_windows[session_id] = deque(maxlen=self.window_size)
            self.session_raw_buffers[session_id] = deque(maxlen=50)
            
        self.session_raw_buffers[session_id].append(log)
        window = self.session_windows[session_id]
        
        # Check if we have enough logs for a full window
        if len(window) < self.window_size:
            window.append(template_id)
            return False, None, None
            
        # Run prediction: x is the last `window_size` template IDs
        input_seq = torch.tensor([list(window)], dtype=torch.long)
        
        with torch.no_grad():
            logits = self.model(input_seq)
            probabilities = F.softmax(logits, dim=1)
            # Find the top g candidates
            top_prob, top_indices = torch.topk(probabilities, self.candidate_g, dim=1)
            predicted_candidates = top_indices[0].tolist()
            
        # Push the current log to the window for future sequences
        window.append(template_id)
        
        # Check if the actual log key is in the predicted candidates
        is_anomaly = template_id not in predicted_candidates
        
        if is_anomaly:
            # We can classify severity based on log level or target prediction rank
            severity = "HIGH" if level == "ERROR" else "MEDIUM"
            return True, list(self.session_raw_buffers[session_id]), severity
            
        return False, None, None
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
