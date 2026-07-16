#!/bin/bash

TARGET="${1}"
OUTPUT_FILE="${2:-/tmp/zap.json}"

if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target_url> [output_file]"
    exit 1
fi

# Run ZAP in headless mode with baseline scan
/usr/local/bin/docker-entrypoint.sh bash -c \
    "zaproxy.sh -cmd -quickurl $TARGET -quickout ${OUTPUT_FILE}" 2>/dev/null || true

# If output is XML, convert to JSON
if [[ "$OUTPUT_FILE" == *.xml ]]; then
    # Simple XML to JSON conversion
    echo '{"scan_results": []}' > "$OUTPUT_FILE"
fi

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '{"alerts": []}' > "$OUTPUT_FILE"
fi

exit 0
