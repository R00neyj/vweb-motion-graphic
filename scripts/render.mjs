// 사용법: node render.mjs snap 1.5 12 40  |  node render.mjs video [fps] [workers]  (--short 붙이면 30초 편집본)
import { launch } from './browser.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import http from 'node:http';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const SHORT = process.argv.includes('--short');
const PAGE = `http://127.0.0.1:${server.address().port}/video/${SHORT ? 'short' : 'index'}.html`;
const [mode = 'snap', ...rest] = process.argv.slice(2).filter(a => a !== '--short');

async function openPage(browser) {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto(PAGE);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  await p.evaluate(async () => {
    const fams = ['SUIT', 'Pret', 'Mont'];
    await Promise.all(fams.flatMap(f => [400, 700, 800, 900].map(w => document.fonts.load(`${w} 20px ${f}`, '가A1'))));
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  return p;
}

if (mode === 'snap') {
  const out = path.join(ROOT, 'out', SHORT ? 'snaps_short' : 'snaps');
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await openPage(b);
  for (const t of rest.map(Number)) {
    await p.evaluate(t => window.__seek(t), t);
    const f = path.join(out, `t${t.toFixed(2)}.png`);
    await p.screenshot({ path: f });
    console.log(f);
  }
  await b.close();
} else {
  const fps = +(rest[0] || 30), workers = +(rest[1] || 6);
  const frameDir = path.join(ROOT, 'out', 'frames');
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const b = await launch();
  const probe = await openPage(b);
  const dur = await probe.evaluate(() => window.__dur);
  await probe.close();
  const N = Math.round(dur * fps);
  const per = Math.ceil(N / workers);
  const t0 = Date.now();
  let done = 0;
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const p = await openPage(b);
    const a = w * per, z = Math.min(N, a + per);
    // 구간 시작 전 상태를 확정하려고 앞부분을 0.5초 간격으로 훑는다
    for (let t = 0; t < a / fps; t += .5) await p.evaluate(t => window.__seek(t), t);
    for (let i = a; i < z; i++) {
      await p.evaluate(t => window.__seek(t), i / fps);
      await p.screenshot({ path: path.join(frameDir, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
      if (++done % 100 === 0) console.log(`${done}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    await p.close();
  }));
  await b.close();
  const mp4 = path.join(ROOT, 'out', SHORT ? 'vweb_motion_30s.mp4' : 'vweb_motion.mp4');
  await new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(frameDir, 'f%05d.jpg'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
    ff.on('exit', c => c ? rej(new Error('ffmpeg ' + c)) : res());
  });
  console.log('DONE', mp4, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
server.close();
