import json
import os
import threading
from kafka import KafkaConsumer
from anomaly_detector import FrequencyAnomalyDetector, summarize_logs, generate_log_summary  # bug 6 fix
from dotenv import load_dotenv
from pathlib import Path

root_env_path = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(dotenv_path=root_env_path)

KAFKA_BROKER_URL = os.environ.get('KAFKA_BROKER_URL', 'localhost:9092')
KAFKA_TOPIC = os.environ.get('KAFKA_TOPIC', 'logs-topic')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
LLM_MODEL = os.environ.get('LLM_MODEL', 'llama3-8b-8192')


def consume_logs():
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=[KAFKA_BROKER_URL],
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='ml-service-consumer',
    )
    print(f"Listening for messages on topic '{KAFKA_TOPIC}'...")
    return consumer


def process_log_pipeline():
    detector = FrequencyAnomalyDetector(window_seconds=60, error_threshold=50, buffer_size=200)
    consumer = consume_logs()
    for message in consumer:
        log = message.value
        print("Received log:", log)
        anomaly, recent_logs, severity = detector.add_log(log)
        if anomaly:
            print(f"[ALERT] Anomaly detected! Severity: {severity}")
            agg = summarize_logs(recent_logs)
            for line in agg:
                print(line)
            try:
                summary = generate_log_summary(agg, GROQ_API_KEY, model=LLM_MODEL)
                print(f"[SUMMARY][{severity}]", summary)
            except Exception as e:
                print("[ERROR] LLM summarization failed:", e)


def start_consumer_thread():
    thread = threading.Thread(target=process_log_pipeline, daemon=True)
    thread.start()
    print("[✓] Kafka consumer thread started")


if __name__ == "__main__":
    process_log_pipeline()