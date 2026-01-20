#!/bin/bash
# Check formatting on modified files using Prettier

# Read tool input from stdin
input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [ -z "$file_path" ]; then
  exit 0
fi

# Only check files that Prettier cares about
if echo "$file_path" | grep -qE '\.(ts|tsx|js|jsx|json|md|css|scss|html|yaml|yml)$'; then
  cd "$CLAUDE_PROJECT_DIR" || exit 0

  # Run prettier check on the specific file
  if ! bun x prettier --check "$file_path" 2>/dev/null; then
    echo "Formatting issue in $file_path - run 'bun run format' to fix" >&2
    exit 2
  fi
fi

exit 0
