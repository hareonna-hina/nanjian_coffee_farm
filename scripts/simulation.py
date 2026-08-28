"""Python 兼容入口：把局数参数原样转交给 JavaScript Monte Carlo 引擎。"""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
RUNS = sys.argv[1] if len(sys.argv) > 1 else "100000"
# 不复制规则实现；退出码与 Node 子进程保持一致，方便 CI 判断成功或失败。
raise SystemExit(subprocess.call(["node", str(ROOT / "scripts" / "simulation.js"), RUNS], cwd=ROOT))
