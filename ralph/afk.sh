#!/bin/bash
set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
  issues=$(cat issues/*.md 2>/dev/null || echo "No issues found")
  prompt=$(cat ralph/prompt.md)

  echo ">>> Iniciando iteración $i..."

  # Ejecutamos OpenCode y capturamos su salida en una variable
  salida=$(opencode "Previous commits: $commits Issues: $issues $prompt")

  # Imprimimos la salida en la terminal para que puedas ver qué hizo
  echo "$salida"

  # Evaluamos si la IA imprimió la etiqueta de finalización
  if [[ "$salida" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo "✅ Ralph ha completado todas las tareas después de $i iteraciones."
    exit 0
  fi
done
