FROM golang:1.21-alpine as builder

WORKDIR /src
RUN go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

FROM alpine:latest

RUN apk add --no-cache ca-certificates jq bash curl && \
    curl -s https://api.github.com/repos/projectdiscovery/nuclei-templates/releases/latest | \
    grep "zipball_url" | cut -d'"' -f4 | xargs wget -O /tmp/templates.zip && \
    unzip -q /tmp/templates.zip -d /nuclei-templates && \
    rm /tmp/templates.zip

COPY --from=builder /go/bin/nuclei /usr/local/bin/nuclei

WORKDIR /scan

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["scan"]
