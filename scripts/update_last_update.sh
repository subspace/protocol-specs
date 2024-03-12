#!/bin/bash

# Load environment variables
source "./.env"

# Check if AUTHOR_NAME is set
if [[ -z "$AUTHOR_NAME" ]]; then
    echo "Error: Author name is empty."
    exit 1
fi

# Current date in UTC
current_date=$(date -u +"%m/%d/%Y")

# Iterate over staged markdown files, excluding README.md
git diff --cached --name-only | grep '\.md$' | grep -v 'README.md' | while read -r file; do
    # Create a temporary file
    temp_file=$(mktemp)

    # Use awk to update last_update fields
    awk -v date="$current_date" -v author="$AUTHOR_NAME" '
        BEGIN {printed=0}
        /^---$/ {count++}
        count == 1 && !printed {
            if (/^last_update:/) {
                print "last_update:"
                print "  date: " date
                print "  author: " author
                printed=1
                next
            }
        }
        !/^last_update:/ && !/^  date:/ && !/^  author:/ {print}
    ' "$file" > "$temp_file"

    if [ -s "$temp_file" ]; then
        # Only move temp_file to original if temp_file is not empty
        mv "$temp_file" "$file"
        # Add the updated file to the staging area
        git add "$file"
    else
        echo "Failed to update $file, temp_file was empty."
        rm "$temp_file"
    fi
done
