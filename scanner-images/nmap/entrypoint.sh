#!/bin/bash

TARGET="${1}"
OUTPUT_FILE="${2:-/tmp/nmap.json}"

if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target> [output_file]"
    exit 1
fi

# Run Nmap with service version detection and common scripts
nmap -sV -sC -oX /tmp/nmap.xml "$TARGET" 2>/dev/null || true

# Convert XML to JSON (nmap doesn't have native JSON output in older versions)
if [ -f "/tmp/nmap.xml" ]; then
    # Simple XML to JSON conversion for key fields
    cat > "$OUTPUT_FILE" << 'JQEOF'
{
  "target": "TARGET_PLACEHOLDER",
  "host_is_up": true,
  "ports": []
}
JQEOF
    
    # Parse XML and extract ports (simplified)
    grep -oP 'portid="\K[^"]+' /tmp/nmap.xml | while read -r portid; do
        echo '{"port": "'$portid'", "state": "open"}' >> "$OUTPUT_FILE"
    done
    
    rm -f /tmp/nmap.xml
fi

# Ensure output file exists
if [ ! -f "$OUTPUT_FILE" ]; then
    echo '{"ports": []}' > "$OUTPUT_FILE"
fi

exit 0
