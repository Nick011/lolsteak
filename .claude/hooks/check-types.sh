#!/bin/bash
# Run TypeScript type check after file modifications
# Note: Type checking requires project context, so we run on the whole project

# Read tool input from stdin
input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [ -z "$file_path" ]; then
  exit 0
fi

# Only type-check TypeScript files
if echo "$file_path" | grep -qE '\.(ts|tsx)$'; then
  cd "$CLAUDE_PROJECT_DIR" || exit 0

  # Run turbo type-check (covers all packages)
  if ! bun run type-check 2>/dev/null; then
    echo "TypeScript errors detected - check 'bun run type-check'" >&2
    exit 2
  fi
fi

exit 0
