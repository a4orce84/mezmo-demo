# Mezmo Agent Dockerfile for DigitalOcean App Platform
# This image runs the Mezmo Agent and exposes OTLP HTTP endpoint on 4318

FROM logdna/logdna-agent:latest

# Expose OTLP HTTP port
EXPOSE 4318

# The LogDNA Agent (Mezmo) is configured via environment variables, not build-time config.
# You will set LOGDNA_INGESTION_KEY (your agent token) and any other needed variables at runtime.
# No CMD/ENTRYPOINT override needed; default entrypoint is correct.
# Docs: https://hub.docker.com/r/logdna/logdna-agent
