FROM aquasec/trivy:latest

RUN apk add --no-cache jq bash git

WORKDIR /scan

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["scan"]
