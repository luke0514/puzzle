"""Chapter 06: a night-sky plate with a message hidden in the blue channel's least
significant bit.  Row-major pixel order, MSB-first within each byte, NUL-terminated,
payload encoded as UTF-8 (the Polish diacritics matter and are part of the clue)."""
import json, math, random
from PIL import Image, ImageDraw, ImageFilter
from PIL.PngImagePlugin import PngInfo

W, H = 1400, 900
rng = random.Random(1932)

MESSAGE = "POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ"
payload = MESSAGE.encode('utf-8') + b'\x00'

# ---------------------------------------------------------------- the plate
img = Image.new('RGB', (W, H), (5, 8, 14))
d = ImageDraw.Draw(img)

# faint vertical gradient, like an emulsion
for y in range(H):
    t = y / H
    v = (int(5 + 9 * (1 - t)), int(8 + 12 * (1 - t)), int(14 + 20 * (1 - t)))
    d.line([(0, y), (W, y)], fill=v)

# a diffuse band, standing in for the Milky Way
band = Image.new('L', (W, H), 0)
bd = ImageDraw.Draw(band)
for i in range(2600):
    t = rng.random()
    x = t * W
    y = 250 + 420 * t + rng.gauss(0, 78)
    r = rng.random() * 2.2
    bd.ellipse([x - r, y - r, x + r, y + r], fill=int(28 + rng.random() * 46))
band = band.filter(ImageFilter.GaussianBlur(9))
img = Image.composite(Image.new('RGB', (W, H), (46, 62, 86)), img, band)

d = ImageDraw.Draw(img)

# stars: a realistic magnitude distribution, a few bright ones with cross flare
stars = []
for _ in range(1500):
    x, y = rng.uniform(0, W), rng.uniform(0, H)
    mag = rng.random() ** 3.1
    r = 0.4 + mag * 2.6
    b = int(70 + mag * 185)
    tint = rng.choice([(b, b, min(255, int(b * 1.12))),
                       (min(255, int(b * 1.06)), b, int(b * 0.94)),
                       (b, b, b)])
    d.ellipse([x - r, y - r, x + r, y + r], fill=tint)
    if mag > 0.86:
        stars.append((x, y, r, b))
        fl = r * 6
        for (dx, dy) in ((fl, 0), (-fl, 0), (0, fl), (0, -fl)):
            d.line([x, y, x + dx, y + dy], fill=(int(b * 0.32), int(b * 0.34), int(b * 0.40)))

# faint survey grid — the kind printed on an astrometric plate
for gx in range(0, W + 1, 100):
    d.line([(gx, 0), (gx, H)], fill=(16, 22, 31))
for gy in range(0, H + 1, 100):
    d.line([(0, gy), (W, gy)], fill=(16, 22, 31))

# a few plate registration marks
for (mx, my) in ((40, 40), (W - 40, 40), (40, H - 40), (W - 40, H - 40)):
    d.line([mx - 12, my, mx + 12, my], fill=(58, 74, 96))
    d.line([mx, my - 12, mx, my + 12], fill=(58, 74, 96))

img = img.filter(ImageFilter.GaussianBlur(0.35))

# a whisper of grain so the LSB plane is not suspiciously flat
px = img.load()
for y in range(H):
    for x in range(W):
        r, g, b = px[x, y]
        n = rng.randint(-2, 2)
        px[x, y] = (max(0, min(255, r + n)), max(0, min(255, g + n)), max(0, min(255, b + n)))

# ------------------------------------------------------------- the payload
bits = ''.join(format(byte, '08b') for byte in payload)
assert len(bits) <= W * H, "payload does not fit"
i = 0
for y in range(H):
    for x in range(W):
        if i >= len(bits):
            break
        r, g, b = px[x, y]
        px[x, y] = (r, g, (b & 0xFE) | int(bits[i]))
        i += 1
    if i >= len(bits):
        break

meta = PngInfo()
meta.add_text('Title', 'Nocne niebo nad Poznaniem')   # forward pointer to Chapter 07
meta.add_text('Author', 'M.R.')                        # Marian Rejewski
meta.add_text('Comment', '1/8')                        # one bit of every eight
meta.add_text('Creation Time', '1932-12-31T23:59:00')
img.save('/home/claude/pz/public/puzzles/plate-vii.png', pnginfo=meta, optimize=False)

# ------------------------------------------------------------ verification
chk = Image.open('/home/claude/pz/public/puzzles/plate-vii.png').convert('RGB')
cpx = chk.load()
out, cur, n = bytearray(), 0, 0
done = False
for y in range(H):
    for x in range(W):
        cur = (cur << 1) | (cpx[x, y][2] & 1)
        n += 1
        if n == 8:
            if cur == 0:
                done = True
                break
            out.append(cur); cur = n = 0
    if done:
        break
rec = out.decode('utf-8')
print('recovered:', rec)
print('match     :', rec == MESSAGE)
print('size      :', chk.size, 'bytes on disk:', __import__('os').path.getsize('/home/claude/pz/public/puzzles/plate-vii.png'))
json.dump({'message': MESSAGE, 'channel': 'blue', 'bit': 'LSB', 'order': 'row-major',
           'bitorder': 'MSB-first', 'terminator': 'NUL', 'encoding': 'utf-8',
           'width': W, 'height': H},
          open('/home/claude/gen/ch06_final.json', 'w'), indent=1)
