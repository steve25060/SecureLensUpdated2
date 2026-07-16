#!/bin/bash

TARGET_URL="${1}"
OUTPUT_FILE="${2:-/tmp/whatweb.json}"

if [ -z "$TARGET_URL" ]; then
    echo "Usage: $0 <target_url> [output_file]"
    exit 1
fi

# Run WhatWeb with JSON output
cd /opt/whatweb
ruby whatweb --user-agent "Mozilla/5.0" \
    --log-json="${OUTPUT_FILE}" \
    --verbose \
    "${TARGET_URL}" 2>/dev/null || true

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '{"technologies": []}' > "$OUTPUT_FILE"
fi

exit 0
