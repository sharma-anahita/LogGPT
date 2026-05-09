import json
import os
import threading
import psycopg2
from datetime import datetime, timezone
from kafka import KafkaConsumer
from anomaly_detector import FrequencyAnomalyDetector, summarize_logs, generate_log_summary
from dotenv import load_dotenv
from pathlib import Path

root_env_path = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(dotenv_path=root_env_path)

KAFKA_BROKER_URL = os.environ.get('KAFKA_BROKER_URL', 'localhost:9092')
KAFKA_TOPIC = os.environ.get('KAFKA_TOPIC', 'logs-topic')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
LLM_MODEL = os.environ.get('LLM_MODEL', 'llama3-8b-8192')

POSTGRES_HOST = os.environ.get('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = int(os.environ.get('POSTGRES_PORT', 5432))
POSTGRES_DB = os.environ.get('POSTGRES_DB', 'loggpt')
POSTGRES_USER = os.environ.get('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD', 'hi123')


def get_db_conn():
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
    )


def save_anomaly_to_db(session_id, anomaly_type, severity, description, confidence, start_time, end_time=None):
    """Persist a detected anomaly into the anomalies table."""
    if not session_id:
        print("[WARN] No session_id — anomaly not saved to DB")
        return

    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO anomalies
                (session_id, type, severity, start_time, end_time, description, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                session_id,
                anomaly_type,
                severity.lower(),
                start_time or datetime.now(timezone.utc),
                end_time,
                description,
                json.dumps({"confidence": confidence}),
            ),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        print(f"[DB] Anomaly saved with id={row[0]}")
    except Exception as e:
        print(f"[ERROR] Failed to save anomaly to DB: {e}")


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
    # One detector per session so windows don't bleed across sessions
    detectors = {}

    consumer = consume_logs()
    for message in consumer:
        log = message.value
        print("Received log:", log)

        session_id = log.get('sessionId')
        if session_id not in detectors:
            detectors[session_id] = FrequencyAnomalyDetector(
                window_seconds=60, error_threshold=50, buffer_size=200
            )

        detector = detectors[session_id]
        anomaly, recent_logs, severity = detector.add_log(log)

        if anomaly:
            print(f"[ALERT] Anomaly detected! Severity: {severity}, session: {session_id}")
            agg = summarize_logs(recent_logs)
            for line in agg:
                print(line)

            description = f"Error spike detected. {'; '.join(agg[:5])}"
            confidence = _severity_to_confidence(severity)

            # Try LLM summary — use as description if available
            if GROQ_API_KEY:
                try:
                    llm_summary = generate_log_summary(agg, GROQ_API_KEY, model=LLM_MODEL)
                    print(f"[SUMMARY][{severity}]", llm_summary)
                    description = llm_summary
                except Exception as e:
                    print("[ERROR] LLM summarization failed:", e)

            save_anomaly_to_db(
                session_id=session_id,
                anomaly_type="Error Spike",
                severity=severity,
                description=description,
                confidence=confidence,
                start_time=datetime.now(timezone.utc),
            )


def _severity_to_confidence(severity: str) -> float:
    return {"HIGH": 0.95, "MEDIUM": 0.80, "LOW": 0.65}.get(severity.upper(), 0.70)


def start_consumer_thread():
    thread = threading.Thread(target=process_log_pipeline, daemon=True)
    thread.start()
    print("[✓] Kafka consumer thread started")


if __name__ == "__main__":
    process_log_pipeline()