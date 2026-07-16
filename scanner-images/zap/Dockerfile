FROM owasp/zap2docker-stable

RUN apt-get update && apt-get install -y --no-install-recommends \
    jq python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /scan

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["scan"]
