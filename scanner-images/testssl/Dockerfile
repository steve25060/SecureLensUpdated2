FROM ubuntu:22.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    git bash openssl ca-certificates curl jq && \
    git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl.sh && \
    chmod +x /opt/testssl.sh/testssl.sh && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /scan

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["scan"]
