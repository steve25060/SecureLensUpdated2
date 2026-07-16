FROM ubuntu:22.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl jq git ruby && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /scan

# Clone WhatWeb
RUN git clone --depth 1 https://github.com/urbanadventurer/WhatWeb.git /opt/whatweb && \
    cd /opt/whatweb && chmod +x whatweb

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["scan"]
