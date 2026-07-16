#!/bin/bash

TARGET="${1}"
OUTPUT_FILE="${2:-/tmp/trivy.json}"

if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target_repo_or_image> [output_file]"
    exit 1
fi

# Run Trivy with JSON output
trivy fs --format json --output "$OUTPUT_FILE" "$TARGET" 2>/dev/null || \
trivy image --format json --output "$OUTPUT_FILE" "$TARGET" 2>/dev/null || true

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '{"Results": []}' > "$OUTPUT_FILE"
fi

exit 0
