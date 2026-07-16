#!/bin/bash

TARGET="${1}"
OUTPUT_FILE="${2:-/tmp/httpx.json}"

if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target_url_or_list> [output_file]"
    exit 1
fi

# If target is a file, use it as input list
if [ -f "$TARGET" ]; then
    httpx -l "$TARGET" -json -o "$OUTPUT_FILE" 2>/dev/null || true
else
    # Otherwise treat as URL
    echo "$TARGET" | httpx -json -o "$OUTPUT_FILE" 2>/dev/null || true
fi

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '[]' > "$OUTPUT_FILE"
fi

exit 0
