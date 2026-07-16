FROM ghcr.io/gitleaks/gitleaks:latest

# Set working directory
WORKDIR /scan

# Install additional tools if needed
RUN apk add --no-cache git bash curl jq

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set default command
ENTRYPOINT ["/entrypoint.sh"]
CMD ["detect"]
