#!/usr/bin/env bash
# 本地 / CI 通用的界面自测：起静态服务器 → 无头 Chrome 跑 dev/selftest.html → 解析断言结果
# 用法：dev/run-selftest.sh          （PORT=5399 CHROME=/path/to/chrome 可覆盖）
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${PORT:-5399}"
PROFILE="${TMPDIR:-/tmp}/dbx-todo-chrome"
OUT="${TMPDIR:-/tmp}/dbx-todo-selftest.html"

CHROME="${CHROME:-$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser || command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" || true)}"
if [ -z "${CHROME}" ]; then
  echo "找不到 Chrome / Chromium，用 CHROME=/path/to/chrome 指定" >&2
  exit 1
fi

python3 -m http.server "${PORT}" >"${TMPDIR:-/tmp}/dbx-todo-http.log" 2>&1 &
server=$!
trap 'kill "${server}" 2>/dev/null || true' EXIT
sleep 1

"${CHROME}" --headless=new --disable-gpu --no-sandbox --user-data-dir="${PROFILE}" \
  --virtual-time-budget=90000 --dump-dom "http://127.0.0.1:${PORT}/dev/selftest.html" > "${OUT}"

python3 dev/parse-selftest.py "${OUT}" "${SHOW_PASS:-0}"
