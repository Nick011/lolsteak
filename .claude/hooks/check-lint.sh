#!/bin/bash
# Run ESLint on modified TypeScript/JavaScript files

# Read tool input from stdin
input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [ -z "$file_path" ]; then
  exit 0
fi

# Only lint TypeScript/JavaScript files
if echo "$file_path" | grep -qE '\.(ts|tsx|js|jsx)$'; then
  cd "$CLAUDE_PROJECT_DIR" || exit 0

  # Run ESLint on the specific file
  if ! bun x eslint "$file_path" 2>/dev/null; then
    echo "Lint errors in $file_path" >&2
    exit 2
  fi
fi

exit 0
