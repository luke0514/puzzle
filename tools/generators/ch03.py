"""Chapter 03: real RSA, modulus built from two primes seeded by the golden ratio.
   Weakness: |p-q| << n^(1/4)  =>  Fermat factorisation succeeds in a handful of steps.
   Second, independent path: p = nextprime(floor(phi * 2^511)) can be reconstructed outright."""
import json, math
from decimal import Decimal, getcontext
from sympy import nextprime, isprime

getcontext().prec = 400
# phi to 400 digits, exactly: (1+sqrt(5))/2
phi = (1 + Decimal(5).sqrt()) / 2
seed = int(phi * (1 << 511))                     # floor(phi * 2^511)
p = nextprime(seed)
q = nextprime(p + (1 << 268))                    # deliberate offset: > n^(1/4), still Fermat-reachable
assert isprime(p) and isprime(q) and p != q
n = p * q
e = 65537
phi_n = (p - 1) * (q - 1)
assert math.gcd(e, phi_n) == 1
d = pow(e, -1, phi_n)

PLAIN = b"THE KEY WAS NEVER RANDOM"
m = int.from_bytes(PLAIN, 'big')
assert m < n
c = pow(m, e, n)
assert int.to_bytes(pow(c, d, n), 24, 'big') == PLAIN

# --- verify the intended attack actually terminates fast -------------------
def fermat(n, cap=10_000_000):
    a = math.isqrt(n)
    if a * a < n: a += 1
    for i in range(cap):
        b2 = a * a - n
        b = math.isqrt(b2)
        if b * b == b2:
            return a - b, a + b, i + 1
        a += 1
    return None
fp, fq, steps = fermat(n)
assert {fp, fq} == {p, q}
print(f"n has {n.bit_length()} bits;  p,q have {p.bit_length()} bits")
print(f"|p-q| = 2^{(q-p).bit_length()-1:.0f} ish ;  n^(1/4) ~ 2^{n.bit_length()//4}")
print(f"Fermat factorisation succeeded in {steps} iteration(s)")
print("golden-ratio path:", nextprime(int(((1 + Decimal(5).sqrt()) / 2) * (1 << 511))) == p)
print("plaintext round-trip OK")

out = {"p": str(p), "q": str(q), "n": str(n), "e": e, "d": str(d),
       "c": str(c), "c_hex": format(c, 'x'), "n_hex": format(n, 'x'),
       "plaintext": PLAIN.decode(), "fermat_steps": steps}
json.dump(out, open('/home/claude/gen/ch03_final.json', 'w'), indent=1)
print("\nn =", n)
print("\nc =", c)
