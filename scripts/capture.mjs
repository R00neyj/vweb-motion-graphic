import { launch } from './browser.mjs';
const [,, url, out, mode = 'full'] = process.argv;
const b = await launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await p.waitForTimeout(2500);
// 스크롤 트리거 애니메이션 강제 노출
const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 500) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(250); }
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1500);
await p.screenshot({ path: out + '_hero.png' });
if (mode === 'full') await p.screenshot({ path: out + '_full.png', fullPage: true });
console.log(out, h);
await b.close();
