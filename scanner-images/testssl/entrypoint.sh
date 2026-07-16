#!/bin/bash

TARGET="${1}"
OUTPUT_FILE="${2:-/tmp/testssl.json}"

if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target_url> [output_file]"
    exit 1
fi

# Run testssl.sh with JSON output
/opt/testssl.sh/testssl.sh --json-pretty \
    "$TARGET" 2>/dev/null | jq '.' > "$OUTPUT_FILE" || true

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '{"scans": []}' > "$OUTPUT_FILE"
fi

exit 0
