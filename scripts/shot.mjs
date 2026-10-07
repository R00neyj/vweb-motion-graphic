import { launch } from './browser.mjs';
import url from 'node:url'; import path from 'node:path';
const [,, file, out, w = 1000, h = 420] = process.argv;
const b = await launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url.pathToFileURL(path.resolve(file)).href); await p.waitForTimeout(300);
await p.screenshot({ path: out }); await b.close();
