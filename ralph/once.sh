#!/bin/bash

issues=$(cat issues/*.md 2>/dev/null || echo "No issues found")
commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
prompt=$(cat ralph/prompt.md)

# Reemplazamos la llamada de Claude por OpenCode.
# Asumimos que puedes pasarle el texto directamente como argumento.
opencode "Previous commits: $commits Issues: $issues $prompt"
