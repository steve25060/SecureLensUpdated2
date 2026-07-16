FROM nmap/nmap:latest

RUN apk add --no-cache jq bash curl

WORKDIR /scan

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["scan"]
