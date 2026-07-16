#!/bin/bash

REPO_PATH="${1:-.}"
OUTPUT_FILE="${2:-/tmp/semgrep.json}"

if [ ! -d "$REPO_PATH" ]; then
    echo "Repository path not found: $REPO_PATH"
    exit 1
fi

cd "$REPO_PATH"

# Run Semgrep with security audit rulesets
semgrep --config=p/security-audit \
    --config=p/owasp-top-ten \
    --json \
    --output="${OUTPUT_FILE}" \
    . 2>/dev/null || true

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '{"results": []}' > "$OUTPUT_FILE"
fi

exit 0
