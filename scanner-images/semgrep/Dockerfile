FROM python:3.11-slim

WORKDIR /scan

# Install Semgrep and dependencies
RUN pip install --upgrade pip && \
    pip install semgrep

# Install additional tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl jq && \
    rm -rf /var/lib/apt/lists/*

# Create entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["scan"]
