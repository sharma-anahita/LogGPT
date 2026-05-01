import json
from kafka import KafkaConsumer

# Kafka configuration
KAFKA_BROKER_URL = 'localhost:9092'  # Update if needed
KAFKA_TOPIC = 'logs-topic'  # Update if needed


def main():
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=[KAFKA_BROKER_URL],
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='ml-service-consumer',
    )
    print(f"Listening for messages on topic '{KAFKA_TOPIC}'...")
    for message in consumer:
        print("Received log:", message.value)


if __name__ == "__main__":
    main()
