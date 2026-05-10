# Using Bitnami Kafka which supports KRaft mode (no Zookeeper needed)
# KRaft mode is far simpler and more reliable on Render free tier
FROM bitnami/kafka:3.7

# All configuration is done via environment variables at runtime
# See the Render service env vars for KAFKA_* settings

USER root
RUN mkdir -p /bitnami/kafka/data && chmod -R 777 /bitnami/kafka/data
USER 1001

EXPOSE 9092

# Bitnami image has its own entrypoint that reads env vars
# No custom CMD needed — the image handles startup
