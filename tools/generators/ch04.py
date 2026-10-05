"""Chapter 04: genuine nontrivial zeta zeros; letter = floor(gamma) mod 26."""
import json
from mpmath import mp, zetazero
mp.dps = 25
MSG = "SEARCHBETWEENDIMENSIONS"
targets = [ord(c) - 65 for c in MSG]
chosen, n, ti = [], 1, 0
while ti < len(targets) and n < 1200:
    g = zetazero(n).imag
    if int(g) % 26 == targets[ti]:
        chosen.append((n, g)); ti += 1
    n += 1
assert ti == len(targets), "exhausted"
assert "".join(chr(65 + int(g) % 26) for _, g in chosen) == MSG
print("recovered:", "".join(chr(65 + int(g) % 26) for _, g in chosen), "| max index", chosen[-1][0])
for idx, g in chosen:
    print(f"  rho_{idx:<4} gamma={float(g):>12.6f}  floor%26={int(g)%26:2d}  {chr(65+int(g)%26)}")
json.dump([{"index": idx, "gamma": str(g)} for idx, g in chosen],
          open('/home/claude/gen/ch04_true.json', 'w'), indent=1)
