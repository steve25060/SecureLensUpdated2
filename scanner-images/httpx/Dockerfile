FROM golang:1.21-alpine as builder

WORKDIR /src
RUN go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

FROM alpine:latest

RUN apk add --no-cache ca-certificates jq bash

COPY --from=builder /go/bin/httpx /usr/local/bin/httpx

WORKDIR /scan

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["scan"]
