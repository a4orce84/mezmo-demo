# Mezmo Agent Dockerfile for DigitalOcean App Platform
# This image runs the Mezmo Agent and exposes OTLP HTTP endpoint on 4318

FROM mezmo/agent:latest

# Expose OTLP HTTP port
EXPOSE 4318

# The Mezmo Agent is configured via environment variables, not build-time config.
# You will set MEZMO_TOKEN (your agent token) and MEZMO_ENABLE_OTLP=true in the App Platform UI.
# No CMD/ENTRYPOINT override needed; default entrypoint is correct.
