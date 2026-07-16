#!/bin/bash

REPO_PATH="${1:-.}"
OUTPUT_FILE="${2:-/tmp/gitleaks.json}"

if [ -z "$REPO_PATH" ] || [ "$REPO_PATH" = "." ]; then
    echo "Usage: $0 <repo_path> [output_file]"
    exit 1
fi

# Clone if it's a URL
if [[ "$REPO_PATH" == http* ]]; then
    TEMP_DIR=$(mktemp -d)
    git clone --depth 1 "$REPO_PATH" "$TEMP_DIR/repo" 2>/dev/null || true
    REPO_PATH="$TEMP_DIR/repo"
fi

# Run Gitleaks with JSON output
gitleaks detect --source "$REPO_PATH" -f json -o "$OUTPUT_FILE" 2>/dev/null || true

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '[]' > "$OUTPUT_FILE"
fi

exit 0
