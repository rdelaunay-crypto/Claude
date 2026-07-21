#!/bin/sh
# Assemble la version "fichier unique" du prototype : tout (styles, scripts,
# vidéo de démonstration) est embarqué dans tutos-numeriques.html, qui
# s'ouvre d'un simple double-clic, sans serveur ni connexion Internet.
set -e
cd "$(dirname "$0")"

OUT=tutos-numeriques.html

{
  cat << 'HEAD'
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tutos Numériques Hôpital — Intranet</title>
  <style>
HEAD
  cat css/styles.css
  echo '  </style>'
  echo '</head>'
  echo '<body>'
  echo '  <div id="app"></div>'
  echo '  <script>'
  cat js/demo-video.js js/data.js js/store.js js/app.js
  echo '  </script>'
  echo '</body>'
  echo '</html>'
} > "$OUT"

echo "Généré : $OUT ($(du -h "$OUT" | cut -f1))"
