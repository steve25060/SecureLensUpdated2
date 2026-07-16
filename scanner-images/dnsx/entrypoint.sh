#!/bin/bash

DOMAIN="${1}"
OUTPUT_FILE="${2:-/tmp/dnsx.json}"

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain> [output_file]"
    exit 1
fi

# Run DNSX with JSON output
dnsx -d "$DOMAIN" -json > "$OUTPUT_FILE" 2>/dev/null || true

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '{"results": []}' > "$OUTPUT_FILE"
fi

exit 0
