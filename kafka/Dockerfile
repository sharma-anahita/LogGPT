# Using Apache Kafka which supports KRaft mode (no Zookeeper needed)
# KRaft mode is far simpler and more reliable on Render free tier
FROM apache/kafka:3.9.2

# All configuration is done via environment variables at runtime
# See the Render service env vars for KAFKA_* settings

USER root
RUN mkdir -p /opt/kafka/config /opt/kafka/data /opt/kafka/logs \
	&& chown -R 1001:0 /opt/kafka/config /opt/kafka/data /opt/kafka/logs \
	&& chmod -R g+rwX /opt/kafka/config /opt/kafka/data /opt/kafka/logs
USER 1001

EXPOSE 9092

# Bitnami image has its own entrypoint that reads env vars
# No custom CMD needed — the image handles startup
