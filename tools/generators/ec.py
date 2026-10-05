"""Minimal, correct short-Weierstrass arithmetic over F_p."""
class Curve:
    def __init__(self, a, b, p):
        self.a, self.b, self.p = a, b, p
        assert (4 * a**3 + 27 * b**2) % p != 0, "singular curve"
    def on(self, P):
        if P is None: return True
        x, y = P
        return (y * y - (x**3 + self.a * x + self.b)) % self.p == 0
    def add(self, P, Q):
        p = self.p
        if P is None: return Q
        if Q is None: return P
        x1, y1 = P; x2, y2 = Q
        if x1 == x2 and (y1 + y2) % p == 0: return None
        if P == Q:
            lam = (3 * x1 * x1 + self.a) * pow(2 * y1, -1, p) % p
        else:
            lam = (y2 - y1) * pow(x2 - x1, -1, p) % p
        x3 = (lam * lam - x1 - x2) % p
        return (x3, (lam * (x1 - x3) - y1) % p)
    def mul(self, k, P):
        if k < 0: 
            k, P = -k, (P[0], (-P[1]) % self.p) if P else None
        R, Q = None, P
        while k:
            if k & 1: R = self.add(R, Q)
            Q = self.add(Q, Q); k >>= 1
        return R
