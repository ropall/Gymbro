#!/bin/bash

# Este script genera un contexto completo (commits + issues + prompt),
# lo escribe a un archivo temporal y lo pasa a opencode via stdin
# para evitar ENAMETOOLONG por argumentos de shell demasiado largos.

tmpfile=$(mktemp /tmp/opencode-once.XXXXXX.md)
trap 'rm -f "$tmpfile"' EXIT

{
  echo "# Contexto de continuidad"
  echo ""
  echo "## Commits recientes"
  echo "\`\`\`"
  git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found"
  echo "\`\`\`"
  echo ""
  echo "## Issues"
  echo "\`\`\`"
  cat issues/*.md 2>/dev/null || echo "No issues found"
  echo "\`\`\`"
  echo ""
  cat ralph/prompt.md
} > "$tmpfile"

opencode < "$tmpfile"
