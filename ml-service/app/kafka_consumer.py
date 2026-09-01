import json
import os
import time
import threading
import psycopg2
from datetime import datetime, timezone
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

# FIX: was 'from anomaly_detector import ...' which fails when run as a module
from app.anomaly_detector import FrequencyAnomalyDetector, summarize_logs, generate_log_summary
from dotenv import load_dotenv

load_dotenv()

# Standardized to KAFKA_BROKER (same as backend and worker)
KAFKA_BROKER = os.environ.get("KAFKA_BROKER")
if not KAFKA_BROKER:
    raise RuntimeError("KAFKA_BROKER environment variable is required")

KAFKA_TOPIC = os.environ.get("KAFKA_TOPIC", "logs-topic")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "llama3-8b-8192")

DATABASE_URL = os.environ.get("DATABASE_URL")
POSTGRES_HOST = os.environ.get("POSTGRES_HOST")
POSTGRES_PORT = int(os.environ.get("POSTGRES_PORT", 5432))
POSTGRES_DB = os.environ.get("POSTGRES_DB", "loggpt")
POSTGRES_USER = os.environ.get("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "")
POSTGRES_SSL = os.environ.get("POSTGRES_SSL", "false").lower() == "true"

# In kafka_consumer.py
from app.anomaly_detector import DeepLogAnomalyDetector

def process_log_pipeline():
    # Instantiate the DeepLog detector once at startup
    deeplog_detector = DeepLogAnomalyDetector(
        model_path="d:/LogGPT/model/deeplog_model.pth",
        parser_state="d:/LogGPT/model/drain_state.bin",
        candidate_g=3  # Flag as anomaly if not in top 3 predicted templates
    )
    
    consumer = create_consumer_with_retry()
    print("[✓] DeepLog anomaly detector initialized and listening on Kafka...")
    
    for message in consumer:
        try:
            log = message.value
            session_id = log.get("sessionId")
            
            # Run DeepLog anomaly detection
            anomaly, recent_logs, severity = deeplog_detector.add_log(session_id, log)
            
            if anomaly:
                print(f"[DEEPLOG ALERT] Anomaly! Severity={severity} session={session_id}")
                agg = summarize_logs(recent_logs)
                
                description = f"DeepLog sequential anomaly detected: {'; '.join(agg[:5])}"
                confidence = 0.85
                
                if GROQ_API_KEY:
                    try:
                        llm_summary = generate_log_summary(agg, GROQ_API_KEY, model=LLM_MODEL)
                        description = llm_summary
                    except Exception as e:
                        print(f"[WARN] LLM summary failed: {e}")
                        
                save_anomaly_to_db(
                    session_id=session_id,
                    anomaly_type="DeepLog Sequential Anomaly",
                    severity=severity,
                    description=description,
                    confidence=confidence,
                    start_time=datetime.now(timezone.utc),
                )
        except Exception as e:
            print(f"[ERROR] Message processing failed: {e}")
def get_db_conn():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL, sslmode="require")
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        sslmode="require" if POSTGRES_SSL else "prefer",
    )


def save_anomaly_to_db(session_id, anomaly_type, severity, description, confidence, start_time, end_time=None):
    if not session_id:
        print("[WARN] No session_id — anomaly not saved")
        return

    # Look up the user_id for this session so we can store it
    user_id = None
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM sessions WHERE id = %s", (session_id,))
        row = cur.fetchone()
        if row:
            user_id = row[0]
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[WARN] Could not fetch user_id for session {session_id}: {e}")

    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO anomalies
                (user_id, session_id, type, severity, start_time, end_time, description, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                user_id,
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
        print(f"[DB] Anomaly saved id={row[0]}")
    except Exception as e:
        print(f"[ERROR] Failed to save anomaly: {e}")


def create_consumer_with_retry(max_retries=15):
    """Create KafkaConsumer with exponential backoff — important on Render where
    Kafka may not be ready when this service starts."""
    for attempt in range(1, max_retries + 1):
        try:
            consumer = KafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=[KAFKA_BROKER],
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                auto_offset_reset="earliest",
                enable_auto_commit=True,
                group_id="ml-service-consumer",
                consumer_timeout_ms=-1,  # block forever
                session_timeout_ms=30000,
                heartbeat_interval_ms=3000,
            )
            print(f"[✓] ML Kafka consumer connected to {KAFKA_BROKER} (attempt {attempt})")
            return consumer
        except NoBrokersAvailable:
            wait = min(2 ** attempt, 30)
            print(f"[WARN] Kafka not available (attempt {attempt}/{max_retries}), retrying in {wait}s...")
            time.sleep(wait)

    raise RuntimeError(f"Could not connect to Kafka at {KAFKA_BROKER} after {max_retries} attempts")


# Using the DeepLog process_log_pipeline defined at the top.


def start_consumer_thread():
    thread = threading.Thread(target=process_log_pipeline, daemon=True)
    thread.start()
    print("[✓] Kafka consumer thread started")