const q = (s, r = document) => typeof s === 'string' ? r.querySelector(s) : s;
const qa = (s, r = document) => [...r.querySelectorAll(s)];
const tl = gsap.timeline({ paused: true });
const K = 1300 / 1920, CW = 1300, CH = 731;

// ── 공통 유틸 ──────────────────────────────────────────────
function splitText() {
  qa('[data-split]').forEach(el => {
    [...el.childNodes].forEach(n => {
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      [...n.textContent].forEach(c => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        frag.appendChild(s);
      });
      n.replaceWith(frag);
    });
  });
}
const chars = sel => qa('.ch', q(sel));
const inChars = (sel, t, st = .035, d = .7) =>
  tl.from(chars(sel), { yPercent: 118, duration: d, ease: 'expo.out', stagger: st }, t);

function scene(id, a, b) {
  const el = q(id);
  if (a === 0) gsap.set(el, { visibility: 'visible' });
  else tl.set(el, { visibility: 'visible' }, a);
  tl.set(el, { visibility: 'hidden' }, b);
  return el;
}

function wipe(t) {
  tl.fromTo('#wipe .wa', { xPercent: -125 }, { xPercent: 0, duration: .38, ease: 'power3.in', immediateRender: false }, t - .4)
    .to('#wipe .wa', { xPercent: 125, duration: .45, ease: 'power3.out' }, t + .04)
    .fromTo('#wipe .wb', { xPercent: -125 }, { xPercent: 0, duration: .34, ease: 'power3.in', immediateRender: false }, t - .34)
    .to('#wipe .wb', { xPercent: 125, duration: .4, ease: 'power3.out' }, t);
}

// 한글 입력 과정(초성 → 초+중성 → 완성) 재현
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function hangulSteps(ch) {
  const c = ch.charCodeAt(0) - 0xAC00;
  if (c < 0 || c > 11171) return [ch];
  const jong = c % 28, jung = ((c - jong) / 28) % 21, cho = Math.floor(c / 588);
  const s = [CHO[cho], String.fromCharCode(0xAC00 + cho * 588 + jung * 28)];
  if (jong) s.push(ch);
  return s;
}
function typeFrames(base, word) {
  const f = [];
  let cur = base;
  for (const ch of word) {
    for (const st of hangulSteps(ch)) f.push(cur + st);
    cur += ch;
  }
  return f;
}
const delFrames = (text, n) => Array.from({ length: n }, (_, i) => text.slice(0, text.length - i - 1));

function frames(el, arr, t, per = .07, html = false) {
  el = q(el);
  const o = { i: -1 };
  tl.to(o, {
    i: arr.length - 1, duration: per * arr.length, ease: 'none',
    onUpdate() {
      const k = Math.floor(o.i + 1e-4);
      if (k >= 0) html ? (el.innerHTML = arr[k]) : (el.textContent = arr[k]);
    }
  }, t);
  return t + per * arr.length;
}
function counter(el, to, t, d, fmt = n => Math.round(n).toLocaleString('en-US')) {
  el = q(el);
  const o = { v: 0 };
  tl.to(o, { v: to, duration: d, ease: 'power2.out', onUpdate() { el.textContent = fmt(o.v); } }, t);
}
function blink(el, t0, t1) {
  for (let t = t0, i = 0; t < t1; t += .45, i++) tl.set(el, { opacity: i % 2 ? 0 : 1 }, t);
  tl.set(el, { opacity: 0 }, t1);
}
function pos(el, root) {
  el = q(el); root = q(root);
  let x = 0, y = 0, e = el;
  while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return { l: x, t: y, w: el.offsetWidth, h: el.offsetHeight, x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2, r: x + el.offsetWidth, b: y + el.offsetHeight };
}

function mkCursor(cur, rip, x0, y0) {
  cur = q(cur); rip = q(rip);
  gsap.set(cur, { x: x0, y: y0, transformOrigin: '12% 8%' });
  const c = { x: x0, y: y0 };
  c.move = (x, y, t, d = .55, ease = 'power2.inOut') => { tl.to(cur, { x, y, duration: d, ease }, t); c.x = x; c.y = y; return t + d; };
  c.click = t => {
    tl.to(cur, { scale: .8, duration: .07, yoyo: true, repeat: 1, ease: 'none' }, t);
    tl.fromTo(rip, { x: c.x, y: c.y, scale: .15, opacity: 1 }, { scale: 1.3, opacity: 0, duration: .5, ease: 'power2.out', immediateRender: false }, t);
  };
  c.show = (t, on = true) => tl.to(cur, { opacity: on ? 1 : 0, duration: .25 }, t);
  return c;
}
const pop = (el, t, d = .5) => tl.fromTo(el, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2)', immediateRender: false }, t);
const fadeOut = (el, t, d = .3) => tl.to(el, { opacity: 0, duration: d }, t);

function buildRoll(el, a, b) {
  el = q(el);
  el.innerHTML = [...a].map((c, i) => c === b[i]
    ? `<span style="display:inline-block">${c}</span>`
    : `<span style="display:inline-block;height:44px;overflow:hidden;vertical-align:top"><span class="ri" style="display:block"><span style="display:block">${c}</span><span style="display:block">${b[i]}</span></span></span>`).join('');
  return qa('.ri', el);
}

