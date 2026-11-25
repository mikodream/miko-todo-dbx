#!/usr/bin/env python3
"""把 dev/selftest.html 的 dump 解析成断言结果。

用法：dev/parse-selftest.py <dump.html> [--show-pass]
退出码：0 = 全部通过；1 = 有失败或没拿到结果（CI 可直接用）。
"""

import html
import re
import sys

if len(sys.argv) < 2:
    sys.exit("usage: parse-selftest.py <dump.html> [--show-pass]")

show_pass = "--show-pass" in sys.argv[2:]
raw = open(sys.argv[1], encoding="utf-8").read()

match = re.search(r'<div id="out">(.*?)</div>', raw, re.S)
if not match:
    sys.exit("dump 里没有结果块（页面没跑完？）")

text = html.unescape(match.group(1))
lines = text.splitlines()
failures = [line for line in lines if line.startswith("FAIL") or "异常：" in line]
result = re.search(r"RESULT pass=(\d+) fail=(\d+)", text)

for line in lines:
    if line.startswith("FAIL") or "异常：" in line or (show_pass and line.startswith("PASS")):
        print(line)

if not result:
    sys.exit("没有 RESULT 行：页面在断言跑完前中断")

passed, failed = int(result.group(1)), int(result.group(2))
print(f"界面自测：pass={passed} fail={failed}")
if failed or failures:
    for line in failures:
        print(line)
    sys.exit(1)
