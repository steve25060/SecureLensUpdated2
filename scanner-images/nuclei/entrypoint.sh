#!/bin/bash

TARGET="${1}"
OUTPUT_FILE="${2:-/tmp/nuclei.json}"

if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target_url> [output_file]"
    exit 1
fi

# Run Nuclei with JSON output
nuclei -u "$TARGET" \
    -json \
    -o "$OUTPUT_FILE" \
    -update-templates 2>/dev/null || true

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '[]' > "$OUTPUT_FILE"
fi

exit 0
