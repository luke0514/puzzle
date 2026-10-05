/**
 * End-to-end verification: drive a real browser through every chapter, submitting the
 * intended answer, and confirm each one unlocks the next.  Also unseals Chapter 10 and
 * checks that the closing text really is what it should be.
 *
 *   node tools/walkthrough.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:8099';
const SHOTS = 'tools/shots';
mkdirSync(SHOTS, { recursive: true });

const ANSWERS = [
  ['the-beginning', 'LOOK AT THE MIRROR'],
  ['the-mirror', 'PRIMES HAVE TWO FACES'],
  ['the-broken-key', 'THE KEY WAS NEVER RANDOM'],
  ['the-zeroes', 'SEARCH BETWEEN DIMENSIONS'],
  ['the-curve', 'NOT EVERYTHING IS FLAT'],
  ['the-image', 'POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ'],
  ['the-polish-connection', 'ENIGMA'],
  ['the-machine', 'YOU ARE CLOSER THAN YOU THINK'],
  ['the-library', 'THE FIRST LETTER OF EVERYTHING'],
];
const FINAL = 'LATMPHTFTKWNRSBDNEIFPMZHEYACTYTTFLOE';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  // Google Fonts is unreachable from some sandboxes; that path is meant to degrade.
  // A blocked font shows up as a bare "Failed to load resource", with no URL in the
  // message, so failed responses are checked by URL below instead.
  const text = m.text();
  const fontNoise = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.(googleapis|gstatic)\.com|Failed to load resource/.test(text);
  if (m.type() === 'error' && !fontNoise) problems.push(`console: ${text}`);
});
page.on('response', (r) => {
  const fonts = /fonts\.(googleapis|gstatic)\.com/.test(r.url());
  if (r.status() >= 400 && !fonts) problems.push(`http ${r.status()}: ${r.url()}`);
});

const shot = (name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
const btn = (name) => page.getByRole('button', { name, exact: true });
const expectText = async (where, wanted, label) => {
  const text = (await where.textContent()) ?? '';
  if (!text.replace(/\s+/g, ' ').includes(wanted)) problems.push(`${label}: expected "${wanted}"`);
  else console.log(`    tool ok: ${label}`);
};

/**
 * The easier edition puts a tool on every chapter from 02 on.  Each one is driven here
 * exactly as she would use it, and must produce the chapter's sentence by itself.
 */
const TOOLS = {
  'the-mirror': async () => {
    await btn('split each p into a² + b²').click();
    await btn('order by angle').click();
    await btn('column a').click();
    await expectText(page.locator('#ch02-letters').locator('..'), 'PRIMESHAVETWOFACES', 'ch02 plane → letters');
  },
  'the-broken-key': async () => {
    await btn('compute ⌈√n⌉').click();
    await btn('start walking').click();
    await page.getByText('found it').waitFor({ timeout: 30000 });
    await btn('compute d').click();
    await btn('compute m').click();
    await btn('read m as text').click();
    await expectText(page.locator('main'), 'THE KEY WAS NEVER RANDOM', 'ch03 workbench');
  },
  'the-zeroes': async () => {
    await btn('measure |ζ| everywhere').click();
    await expectText(page.locator('main'), '23 zeros', 'ch04 zero count');
    await btn('keep only the zeros').click();
    await btn('order by Im(s)').click();
    await btn('Im(s) column').click();
    await expectText(page.locator('#ch04-letters').locator('..'), 'SEARCHBETWEENDIMENSIONS', 'ch04 probe → letters');
  },
  'the-curve': async () => {
    await btn('find ord(G) and factor it').click();
    await btn('solve each piece').click();
    await btn('combine').click();
    await expectText(page.locator('main'), 'k·G = Q ✓', 'ch05 k verified');
    await btn('write k in base 26').click();
    await expectText(page.locator('main'), 'HWTGKNXQZWN', 'ch05 key');
    await page.locator('#vig-key').fill('HWTGKNXQZWN');
    await expectText(page.locator('#vig-key').locator('..'), 'NOTEVERYTHINGISFLAT', 'ch05 Vigenère');
  },
  'the-image': async () => {
    await btn('open plate-vii.png as a file').click();
    await page.getByText('Nocne niebo nad Poznaniem').waitFor({ timeout: 15000 });
    await btn('blue').click();
    await page.getByLabel('Which bit of the channel to look at').press('End'); // far right = bit 0
    await btn('read this plane as text').click();
    await expectText(page.locator('main'), 'POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ', 'ch06 bit plane');
  },
  'the-polish-connection': async () => {
    await btn('build them from the intercepts').click();
    await expectText(page.locator('main'), 'cycle lengths: 2 + 2 + 3 + 3 + 8 + 8', 'ch07 BE cycles');
    await expectText(page.locator('main'), 'cycle lengths: 13 + 13', 'ch07 AD/CF cycles');
  },
  'the-machine': async () => {
    await expectText(page.locator('main'), 'LOOK AT THE MIRROR', 'ch08 notebook');
    const set = [['slow', 'III'], ['middle', 'I'], ['fast', 'II'], ['ring 1', 'P'], ['ring 2', 'R'],
      ['ring 3', 'I'], ['pos 1', 'T'], ['pos 2', 'H'], ['pos 3', 'E']];
    for (const [label, v] of set) await page.getByLabel(label).selectOption(v);
    await expectText(page.locator('output').first(), 'YOUARECLOSERTHANYOUTHINK', 'ch08 machine');
  },
  'the-library': async () => {
    let letters = '';
    const entries = page.locator('button[aria-pressed]').filter({ hasText: /^\d+MS-/ });
    const count = await entries.count();
    for (let i = 0; i < count; i += 1) {
      await entries.nth(i).click();
      const word = (await page.locator('[data-lens-hit]').textContent()) ?? '?';
      letters += word.trim()[0].toUpperCase();
    }
    if (letters !== 'THEFIRSTLETTEROFEVERYTHING') problems.push(`ch09 lens gave ${letters}`);
    else console.log('    tool ok: ch09 lens');
  },
};

console.log('— landing');
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3200);
await shot('00-landing');
if (!(await page.getByText('CREATED FOR ONE.').isVisible())) problems.push('landing footer missing');

// A locked chapter must not render its content.
await page.goto(`${BASE}/puzzle/the-library/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const lockedText = await page.textContent('body');
if (!lockedText.includes('not open yet')) problems.push('chapter 09 was not locked');
if (lockedText.includes('MS-A-01')) problems.push('LEAK: locked chapter rendered archive content');
await shot('01-locked');

for (const [slug, answer] of ANSWERS) {
  console.log('—', slug);
  await page.goto(`${BASE}/puzzle/${slug}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const body = await page.textContent('body');
  if (body.includes('not open yet')) {
    problems.push(`${slug} did not unlock`);
    break;
  }
  await shot(`ch-${slug}`);

  if (TOOLS[slug]) {
    try {
      await TOOLS[slug]();
    } catch (err) {
      problems.push(`${slug} tool: ${err.message.split('\n')[0]}`);
    }
    await shot(`tool-${slug}`);
  }

  // a wrong answer must be rejected
  const field = page.locator('input[id^="answer-"]');
  await field.fill('DEFINITELY NOT IT');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(900);
  if (!(await page.getByText('Not that.').isVisible())) problems.push(`${slug}: wrong answer accepted`);

  await field.fill(answer);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(1100);
  if (!(await page.getByText('Yes.').isVisible())) problems.push(`${slug}: correct answer rejected`);
}

console.log('— the question');
await page.goto(`${BASE}/puzzle/the-question/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await shot('ch-question-overture');
await page.waitForTimeout(15000); // let the overture play out
await shot('ch-question-asking');

const keyField = page.locator('#final-key');
await keyField.waitFor({ state: 'visible', timeout: 20000 });
await expectText(page.locator('main'), 'POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ', 'ch10 notebook');
await keyField.fill('WRONGKEYWRONGKEYWRONGKEYWRONGKEYWRON');
await page.getByRole('button', { name: 'Open' }).click();
await page.waitForTimeout(1200);
if (!(await page.getByText('Not that.').isVisible())) problems.push('final: wrong key accepted');

await page.waitForTimeout(2000); // let "Not that." clear before reading the counter
await keyField.fill(FINAL);
await expectText(page.locator('main'), '36 / 36 letters', 'ch10 counter');
await page.getByRole('button', { name: 'Open' }).click();
await page.waitForTimeout(12000);
const revealed = await page.textContent('body');
for (const frag of ['rozwiązałaś', 'Gratulacje', 'Czy zostaniesz moją dziewczyną?']) {
  if (!revealed.includes(frag)) problems.push(`final: missing "${frag}"`);
}
await shot('ch-question-revealed');

// TAK / NIE
const nie = page.getByRole('button', { name: 'Nie' });
if (!(await nie.isVisible())) problems.push('NIE button missing');
await nie.hover();
await page.waitForTimeout(500);
await nie.hover();
await page.waitForTimeout(500);
await shot('ch-question-buttons');
await nie.click({ force: true });
await page.waitForTimeout(1200);
if (!(await page.getByText('worth keeping').isVisible())) problems.push('NIE gave no response');
await shot('ch-question-nie');

await page.getByRole('button', { name: 'change your answer' }).click();
await page.waitForTimeout(900);
await page.getByRole('button', { name: 'TAK' }).click();
await page.waitForTimeout(1200);
if (!(await page.getByText('correct answer all along').isVisible())) problems.push('TAK gave no response');
await shot('ch-question-tak');

// mobile pass
console.log('— mobile');
const m = await ctx.newPage();
await m.setViewportSize({ width: 390, height: 844 });
for (const slug of ['the-beginning', 'the-mirror', 'the-broken-key', 'the-zeroes', 'the-curve',
  'the-image', 'the-polish-connection', 'the-machine', 'the-library']) {
  await m.goto(`${BASE}/puzzle/${slug}/`, { waitUntil: 'networkidle' });
  await m.waitForTimeout(900);
  const overflow = await m.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 2) problems.push(`${slug}: horizontal overflow of ${overflow}px on mobile`);
  await m.screenshot({ path: `${SHOTS}/m-${slug}.png`, fullPage: false });
}

await browser.close();
console.log('\n' + (problems.length ? `PROBLEMS:\n - ${problems.join('\n - ')}` : 'ALL CHECKS PASSED'));
process.exit(problems.length ? 1 : 0);
