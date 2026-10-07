const q = (s, r = document) => typeof s === 'string' ? r.querySelector(s) : s;
const qa = (s, r = document) => [...r.querySelectorAll(s)];
const tl = gsap.timeline({ paused: true });
const K = 1300 / 1920, CW = 1300, CH = 731;
const TOTAL = 105.5;

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

// 단계 헤더 / 우측 패널
const heads = {};
function stepHead(root, t, no, tt, sub) {
  const d = document.createElement('div');
  d.className = 'sh';
  d.innerHTML = `<div class="no">${no}</div><div class="tt">${tt} <span>${sub}</span></div>`;
  q(root).appendChild(d);
  gsap.set(d, { opacity: 0 });
  if (heads[root]) tl.to(heads[root], { opacity: 0, y: -24, duration: .3, ease: 'power2.in' }, t - .32);
  tl.fromTo(d, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .55, ease: 'expo.out', immediateRender: false }, t);
  heads[root] = d;
}
const panels = {};
function panelGroup(root, t, rows, cls = '') {
  const g = document.createElement('div');
  g.className = 'pg ' + cls;
  g.innerHTML = rows.map((r, i) => `<div class="prow"><div class="hl"></div><div class="ix">${r.ix || String(i + 1).padStart(2, '0')}</div><div class="tx">${r.tx}</div>${r.sb ? `<div class="sb">${r.sb}</div>` : ''}${r.big != null ? `<div class="big"><span>0</span><small>${r.unit || '곳'}</small></div>` : ''}</div>`).join('');
  q(root).appendChild(g);
  const els = qa('.prow', g);
  gsap.set(els, { opacity: 0 });
  if (panels[root]) tl.to(panels[root], { opacity: 0, x: -40, duration: .3, stagger: .04, ease: 'power2.in' }, t - .35);
  tl.fromTo(els, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: .6, stagger: .08, ease: 'expo.out', immediateRender: false }, t);
  panels[root] = els;
  return els;
}
function hl(row, t, on = true) {
  tl.to(q('.hl', row), { scaleX: on ? 1 : 0, duration: .4, ease: 'power3.inOut' }, t);
  tl.to(row, { color: on ? '#fff' : '#0B0B14', duration: .3 }, t + .05);
  qa('.ix,.big', row).forEach(e => tl.to(e, { color: on ? '#fff' : '#3235CD', duration: .3 }, t + .05));
  qa('.sb', row).forEach(e => tl.to(e, { color: on ? 'rgba(255,255,255,.8)' : '#6b7280', duration: .3 }, t + .05));
}
function seqHL(rows, times) {
  times.forEach((t, i) => { hl(rows[i], t); if (i) hl(rows[i - 1], t, false); });
}
const pop = (el, t, d = .5) => tl.fromTo(el, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2)', immediateRender: false }, t);
const fadeOut = (el, t, d = .3) => tl.to(el, { opacity: 0, duration: d }, t);

// ── S1 인트로 ──────────────────────────────────────────────
function S1() {
  scene('#s1', 0, 6.0);
  gsap.set('#s1 .bigV', { xPercent: -50, yPercent: -52 });
  tl.fromTo('#s1 .bigV', { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 6, ease: 'power2.out' }, 0);
  tl.to('#s1 .line', { scaleX: 1, duration: 1, ease: 'expo.inOut' }, .1);
  tl.from('#s1 .a .ch', { yPercent: 118, duration: .7, ease: 'expo.out' }, .45);
  inChars('#s1 .b', .85, .06, .75);
  tl.to('#s1 .strike', { scaleX: 1, duration: .3, ease: 'power4.out' }, 2.45);
  tl.to('#s1 .end', { x: -10, duration: .05, repeat: 5, yoyo: true, ease: 'none' }, 2.75);
  tl.to('#s1 .strike', { opacity: 0, duration: .2 }, 3.15);
  tl.to(chars('#s1 .b'), { yPercent: -118, duration: .45, ease: 'expo.in', stagger: .02 }, 3.1);
  inChars('#s1 .c', 3.55, .04, .75);
  tl.to('#s1 .uline', { scaleX: 1, duration: .5, ease: 'power3.inOut' }, 4.5);
  tl.to('#s1 .line', { y: 90, opacity: .5, duration: 2 }, 3.5);
  wipe(6.0);
}

// ── S2 고민 ────────────────────────────────────────────────
function S2() {
  scene('#s2', 6.0, 11.5);
  qa('#s2 .bub').forEach((b, i) => tl.from(b, { scale: .5, opacity: 0, y: 30, duration: .5, ease: 'back.out(1.7)' }, 6.25 + i * .55));
  inChars('#s2 .l1', 6.4, .03, .6);
  inChars('#s2 .l2', 6.75, .04, .6);
  tl.from('#s2 .dday', { opacity: 0, y: 40, duration: .6 }, 7.0);
  gsap.set('#s2 .d2, #s2 .d3', { yPercent: 100 });
  tl.to('#s2 .d1', { yPercent: -100, duration: .35, ease: 'power3.inOut' }, 7.8);
  tl.to('#s2 .d2', { yPercent: 0, duration: .35, ease: 'power3.inOut' }, 7.8);
  tl.to('#s2 .d2', { yPercent: -100, duration: .35, ease: 'power3.inOut' }, 8.5);
  tl.to('#s2 .d3', { yPercent: 0, duration: .35, ease: 'power3.inOut' }, 8.5);
  tl.to('#s2 .dday .card', { backgroundColor: '#e03131', duration: .2 }, 8.6);
  tl.to(['#s2 .chat', '#s2 .rt', '#s2 .dday'], { scale: .94, opacity: .4, duration: .6 }, 9.2);
  tl.to('#s2 .blue', { clipPath: 'inset(0% 0% 0% 0%)', duration: .55, ease: 'expo.inOut' }, 9.35);
  inChars('#s2 .t1', 9.75, .035, .7);
  tl.from('#s2 .t2', { opacity: 0, y: 20, duration: .6 }, 10.4);
  wipe(11.5);
}

// ── S3 브이웹 소개 ─────────────────────────────────────────
function S3() {
  scene('#s3', 11.5, 22.0);
  const col = q('#projcol');
  for (let r = 0; r < 2; r++) for (let i = 1; i <= 6; i++) col.insertAdjacentHTML('beforeend', `<img src="../assets/proj${i}.png">`);
  const row = q('#clientrow');
  for (let r = 0; r < 2; r++) for (let i = 1; i <= 20; i++) row.insertAdjacentHTML('beforeend', `<img src="../assets/clients/c${String(i).padStart(2, '0')}.png">`);

  gsap.set('#s3 .lock .inner', { xPercent: -50, yPercent: -50 });
  tl.from('#s3 .vb', { scaleY: 0, transformOrigin: '0% 0%', duration: .45, ease: 'power3.out' }, 11.6);
  tl.from('#s3 .vl', { scaleY: 0, transformOrigin: '100% 0%', duration: .5, ease: 'power3.out' }, 11.8);
  tl.from('#s3 .wordmark .ch', { x: -70, opacity: 0, stagger: .06, duration: .6, ease: 'expo.out' }, 12.0);
  tl.from('#s3 .tag', { opacity: 0, y: 20, duration: .6 }, 12.5);
  tl.to('#s3 .tag', { opacity: 0, duration: .3 }, 13.35);
  tl.to('#s3 .lock', { scale: .3, x: -40, y: -50, duration: .9, ease: 'expo.inOut' }, 13.5);

  tl.from('#s3 .eyebrow', { opacity: 0, x: -30, duration: .6 }, 14.0);
  inChars('#s3 .h1', 14.1, .025, .7);
  tl.from('#s3 .cnt', { opacity: 0, y: 40, duration: .6 }, 14.8);
  counter('#cnt1085', 1085, 14.8, 2.2);
  tl.from('#s3 .chip', { opacity: 0, y: 20, scale: .8, stagger: .08, duration: .5, ease: 'back.out(2)' }, 16.4);
  tl.from('#s3 .price', { opacity: 0, scale: .8, duration: .6, ease: 'back.out(2)' }, 17.3);

  tl.fromTo('#projcol', { y: 0 }, { y: -900, duration: 10.5, ease: 'none' }, 11.5);
  tl.from('#s3 .stack', { opacity: 0, x: 260, duration: 1.1, ease: 'expo.out' }, 13.9);
  tl.fromTo('#clientrow', { x: 0 }, { x: -305 * 14, duration: 7, ease: 'none' }, 15.0);
  tl.from('#s3 .clients', { yPercent: 100, duration: .7, ease: 'expo.out' }, 15.4);
  wipe(22.0);
}

// ── S4 케이스 ──────────────────────────────────────────────
function S4() {
  scene('#s4', 22.0, 28.0);
  tl.from('#s4 .q1', { opacity: 0, y: 30, duration: .6 }, 22.15);
  inChars('#s4 .q2', 22.45, .03, .7);
  tl.to('#s4 .q1', { opacity: 0, duration: .35 }, 23.8);
  tl.to('#s4 .hdr', { y: -215, scale: .62, transformOrigin: '50% 0%', duration: .9, ease: 'expo.inOut' }, 23.8);
  gsap.set('#s4 .bw', { transformPerspective: 1600 });
  tl.from('#s4 .bw', { y: 700, rotationX: 35, opacity: 0, duration: 1.1, ease: 'expo.out' }, 24.0);
  tl.from('#s4 .case', { opacity: 0, y: 20, duration: .5 }, 24.6);
  tl.to('#longsite', { y: -10000, duration: 3.4, ease: 'power2.inOut' }, 24.4);
  gsap.set('#s4 .stamp', { xPercent: -50, yPercent: -50, rotation: -4 });
  tl.from('#s4 .stamp', { scale: 2.2, opacity: 0, rotation: -14, duration: .55, ease: 'back.out(1.6)' }, 26.4);
  wipe(28.0);
}

// ── S5~S10 편집 데모 ───────────────────────────────────────
function S5() {
  scene('#s5', 28.0, 70.5);
  const Z = '#edzoom', site = q('#edsite');
  gsap.set(Z, { x: 0, y: 0, scale: K, transformOrigin: '0 0' });
  let sy = 0;
  const scrollTo = (t, y, d = .9) => { tl.to(site, { y: -y, duration: d, ease: 'power3.inOut' }, t); sy = y; };
  const cam = (t, fx, fy, z, d = .8) => {
    const s = K * z;
    const x = Math.min(0, Math.max(CW - 1920 * s, CW / 2 - fx * s));
    const y = Math.min(0, Math.max(CH - 1080 * s, CH / 2 - fy * s));
    tl.to(Z, { x, y, scale: s, duration: d, ease: 'power3.inOut' }, t);
  };
  const P = (el, root = Z) => pos(el, root);
  const S = el => { const p = pos(el, site); return { ...p, y: p.y - sy, t: p.t - sy, b: p.b - sy }; };
  const cur = mkCursor('#edcur', '#edrip', 1500, 900);

  // 편집 영역 박스
  const boxes = [
    [233, 333, 362, 361], [233, 382, 382, 505], [846, 306, 1074, 340], [706, 380, 1215, 517], [820, 555, 1100, 585],
    [1582, 333, 1690, 361], [1468, 384, 1690, 510], [792, 866, 1128, 895], [674, 910, 1246, 968],
    [702, 1097, 1221, 1150], [713, 1156, 1205, 1209], [646, 1227, 1274, 1281],
    [506, 1417, 582, 1441], [908, 1435, 1006, 1459], [1113, 1417, 1206, 1441],
    [506, 1450, 802, 1539], [888, 1465, 1028, 1529], [1113, 1450, 1407, 1539],
    [778, 2217, 1142, 2246], [763, 2260, 1157, 2314], [770, 2318, 1152, 2369],
    [348, 2797, 634, 2829], [848, 2797, 1072, 2829], [1343, 2797, 1517, 2829], [1276, 2840, 1584, 2919]
  ];
  const bx = q('#edboxes');
  bx.innerHTML = boxes.map(([a, b, c, d], i) => `<div class="ed-box" id="eb${i}" style="left:${a}px;top:${b}px;width:${c - a}px;height:${d - b}px"><div class="tip">✎ 클릭하여 수정</div></div>`).join('');
  const imgs = [[1262, 700], [1758, 940], [1023, 1089], [718, 2761], [1187, 2761], [1656, 2761]];
  imgs.forEach(([x, y], i) => bx.insertAdjacentHTML('beforeend', `<div class="ed-img" id="bi${i}" style="left:${x - 82}px;top:${y - 50}px">img</div>`));
  const ebs = qa('.ed-box', bx), ebi = qa('.ed-img', bx);
  gsap.set([...ebs, ...ebi], { opacity: 0 });

  // STEP 01 로그인
  tl.from('#edbw', { y: 60, opacity: 0, duration: .8, ease: 'expo.out' }, 28.05);
  stepHead('#stephead', 28.2, 'STEP 01', '관리자 로그인', '딩딩파파.com/adm');
  const p1 = panelGroup('#panel', 28.4, [
    { tx: '딩딩파파.com/adm 접속' },
    { tx: '관리자 계정으로 로그인' },
    { tx: '사이트 메인으로 이동', sb: '오른쪽 위에 수정 버튼이 나타납니다' }
  ]);
  frames('#urltxt', typeFrames('', '딩딩파파.com/adm'), 28.5, .045);
  tl.from('.lcard', { y: 40, opacity: 0, duration: .6 }, 29.3);
  seqHL(p1, [28.6, 30.0, 33.2]);
  cur.move(P('#fid').x - 120, P('#fid').y, 29.75);
  cur.click(30.3);
  frames('#fidtxt', ['a', 'a*', 'a**', 'a***', 'a****'], 30.4, .06);
  cur.move(P('#fpw').x - 120, P('#fpw').y, 30.8, .4);
  cur.click(31.2);
  frames('#fpwtxt', Array.from({ length: 10 }, (_, i) => '●'.repeat(i + 1)), 31.25, .035);
  cur.move(P('#lgo').x, P('#lgo').y, 31.6, .4);
  cur.click(32.0);
  tl.to('#lgo', { scale: .96, duration: .08, yoyo: true, repeat: 1 }, 32.0);
  tl.to('#ldone', { opacity: 1, duration: .3 }, 32.2);
  tl.from('#ldone .ok', { scale: 0, duration: .5, ease: 'back.out(2.5)' }, 32.2);
  frames('#urltxt', delFrames('딩딩파파.com/adm', 4), 32.9, .06);
  tl.to('#login', { opacity: 0, duration: .5 }, 33.2);
  pop('#edmode', 33.7);
  tl.fromTo('#co1', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: .4, immediateRender: false }, 34.0);
  tl.to('#co1', { x: 12, duration: .3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 34.4);
  fadeOut('#co1', 35.2);

  // STEP 02 수정모드
  stepHead('#stephead', 34.8, 'STEP 02', '수정모드 켜기', '버튼 하나로 편집 시작');
  const p2 = panelGroup('#panel', 34.9, [
    { tx: '글자 영역', big: 268 }, { tx: '이미지', big: 198 }, { tx: '대표번호', big: 8 },
    { tx: '링크 · 슬라이드 · 게시판 목록', sb: '화면에서 바로 고칩니다' }
  ]);
  const mode = P('#edmode');
  cur.move(mode.x, mode.y, 35.3, .6);
  cur.click(36.0);
  tl.to('#edmode .on', { opacity: 1, duration: .25 }, 36.0);
  tl.fromTo('#edtel', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: .5, ease: 'back.out(2)', immediateRender: false }, 36.2);
  tl.fromTo(ebs, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: .4, stagger: .03, ease: 'expo.out', immediateRender: false }, 36.3);
  tl.fromTo(ebi, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .45, stagger: .05, ease: 'back.out(2.5)', immediateRender: false }, 36.6);
  [268, 198, 8].forEach((n, i) => counter(q('.big span', p2[i]), n, 36.4 + i * .15, 1.4));
  const D = S('#eb3');
  cur.move(D.x + 120, D.y + 30, 38.2, .7);
  tl.set('#eb3', { outlineStyle: 'solid', backgroundColor: 'rgba(34,197,94,.12)' }, 38.9);
  tl.to('#eb3 .tip', { opacity: 1, duration: .2 }, 38.9);
  tl.set('#eb3', { outlineStyle: 'dashed', backgroundColor: 'rgba(0,0,0,0)' }, 40.6);
  tl.to('#eb3 .tip', { opacity: 0, duration: .2 }, 40.6);

  // STEP 03 글자 수정
  stepHead('#stephead', 40.6, 'STEP 03', '글자 수정', '클릭하고 바로 타이핑');
  const p3 = panelGroup('#panel', 40.7, [
    { tx: '클릭하면 바로 타이핑', sb: '시안 디자인 그대로 유지' },
    { tx: '드래그 → 서식 툴바', sb: '굵게 · 기울임 · 취소선' },
    { tx: '색상 팔레트 · 색상코드', sb: '#RRGGBB 직접 입력' },
    { tx: '글자 크기 ± 1px', sb: '⟲ 서식 지우기로 원상복구' }
  ]);
  scrollTo(40.8, 817);
  cur.move(1000, 640, 40.8, .9);
  cam(41.7, 960, 330, 1.9, .9);
  const t1 = S('#t1txt');
  cur.move(t1.r + 6, t1.y, 42.6, .6);
  cur.click(43.25);
  tl.set('#eb9', { outline: '3px solid #ff7a1a', backgroundColor: 'rgba(255,122,26,.1)' }, 43.25);
  hl(p3[0], 43.25);
  blink('#caret1', 43.3, 43.6);
  tl.set('#caret1', { opacity: 1 }, 43.6);
  const L1 = '매출보단 마진율로 승부하는';
  frames('#t1txt', delFrames(L1, 4), 43.6, .1);
  frames('#t1txt', typeFrames('매출보단 마진율로 ', '증명하는'), 44.15, .075);
  blink('#caret1', 44.95, 45.5);
  const w1 = S('#w1');
  cur.move(w1.l + 2, w1.y, 45.4, .5);
  tl.set('#eb9', { outline: '3px dashed #22c55e', backgroundColor: 'rgba(0,0,0,0)' }, 45.5);
  tl.set('#eb10', { outline: '3px solid #ff7a1a', backgroundColor: 'rgba(255,122,26,.1)' }, 45.95);
  cur.move(w1.r, w1.y, 45.95, .5, 'power1.inOut');
  tl.to('#w1', { backgroundSize: '100% 100%', duration: .5, ease: 'power1.inOut' }, 45.95);
  hl(p3[0], 46.5, false); hl(p3[1], 46.5);
  gsap.set('#toolbar', { left: w1.l - 40, top: w1.t + sy - 92 });
  tl.fromTo('#toolbar', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .3, immediateRender: false }, 46.5);
  const tb = id => { const p = S(id); return p; };
  const tin = tb('#tbin');
  cur.move(tin.x, tin.y, 47.0, .45);
  cur.click(47.5);
  tl.set('#tbin', { outline: '3px solid #ff7a1a' }, 47.5);
  hl(p3[1], 47.5, false); hl(p3[2], 47.5);
  frames('#tbin', typeFrames('', '#FF7A1A'), 47.6, .07);
  tl.to('#w1', { color: '#FF7A1A', duration: .3 }, 48.2);
  const tp = tb('#tbp');
  cur.move(tp.x, tp.y, 48.6, .35);
  hl(p3[2], 49.0, false); hl(p3[3], 49.0);
  [49.0, 49.3, 49.6].forEach((t, i) => {
    cur.click(t);
    tl.to('#w1', { fontSize: 50 + (i + 1) * 4 + 'px', duration: .15 }, t + .02);
    tl.to('#eb10', { left: `-=${8}`, width: `+=${16}`, duration: .15 }, t + .02);
  });
  cur.move(400, 560, 50.0, .4);
  cur.click(50.4);
  tl.to('#toolbar', { opacity: 0, duration: .2 }, 50.4);
  tl.to('#w1', { backgroundSize: '0% 100%', duration: .15 }, 50.4);
  tl.set('#eb10', { outline: '3px dashed #22c55e', backgroundColor: 'rgba(0,0,0,0)' }, 50.4);
  cam(50.6, 960, 540, 1, .8);
  pop('#edsave', 50.7);

  // STEP 04 이미지
  stepHead('#stephead', 51.2, 'STEP 04', '이미지 교체', '끌어다 놓으면 끝');
  const p4 = panelGroup('#panel', 51.3, [
    { tx: 'img 배지 클릭 · 드래그&드롭', sb: 'jpg · png · gif · webp' },
    { tx: '원본 크기 비교 · 미리보기', sb: '화면이 깨지지 않게 미리 확인' },
    { tx: '같은 이미지 쓰는 곳 함께 교체' },
    { tx: '「원래대로」로 언제든 복구' }
  ]);
  scrollTo(51.4, 2077);
  cur.move(900, 700, 51.4, .9);
  const ph = S('#swap1');
  cur.move(ph.x, ph.y, 52.2, .7);
  tl.to('#imgframe', { opacity: 1, duration: .2 }, 52.9);
  const b3 = S('#bi3');
  cur.move(b3.x, b3.y, 53.25, .4);
  cur.click(53.7);
  hl(p4[0], 53.7);
  tl.to('#imgframe', { opacity: 0, duration: .2 }, 53.8);
  tl.to('#mimg', { opacity: 1, duration: .3 }, 53.85);
  tl.from('#mimg .mbox', { scale: .9, duration: .4, ease: 'back.out(2)' }, 53.85);
  const dz = P('#drop');
  gsap.set('#filecard', { rotation: 10 });
  tl.set('#filecard', { opacity: 1 }, 54.2);
  tl.to('#filecard', { left: dz.x - 110, top: dz.y - 110, rotation: -3, duration: .7, ease: 'power3.inOut' }, 54.2);
  cur.move(dz.x + 40, dz.y + 30, 54.2, .7, 'power3.inOut');
  tl.to('#drop', { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,.1)', color: '#16a34a', duration: .2 }, 54.75);
  tl.to('#filecard', { scale: .3, opacity: 0, duration: .3, ease: 'power2.in' }, 55.0);
  tl.to('#mprev2', { opacity: 1, duration: .4 }, 55.0);
  tl.to('#mok', { opacity: 1, duration: .3 }, 55.2);
  hl(p4[0], 55.2, false); hl(p4[1], 55.2);
  const ok = P('#mimgok');
  cur.move(ok.x, ok.y, 55.7, .45);
  cur.click(56.15);
  tl.to('#mimg', { opacity: 0, duration: .25 }, 56.3);
  tl.to('#swap1', { clipPath: 'circle(75% at 50% 50%)', duration: .7, ease: 'power2.inOut' }, 56.5);
  tl.set('#bi3', { textContent: 'img ✓', backgroundColor: '#d9480f', boxShadow: '0 0 0 3px #fff, 0 1px 6px rgba(0,0,0,.35)' }, 56.6);
  tl.set('#savecnt', { textContent: '3' }, 56.8);
  tl.fromTo('#edsave', { scale: 1.2 }, { scale: 1, duration: .4, ease: 'back.out(3)', immediateRender: false }, 56.8);
  hl(p4[1], 56.8, false); hl(p4[2], 56.8);
  hl(p4[2], 57.6, false); hl(p4[3], 57.6);

  // STEP 05 대표번호
  stepHead('#stephead', 58.2, 'STEP 05', '대표번호 일괄 수정', '헤더 · 본문 · 푸터 한 번에');
  const p5 = panelGroup('#panel', 58.3, [
    { tx: '☎ 버튼 → 새 번호 입력' },
    { tx: '헤더 · 본문 · 푸터 동시 변경', sb: '한 곳씩 고치다 어긋날 일 없음' },
    { tx: '전화 연결(tel:)까지 자동' },
    { tx: '그림 속 번호는 따로 알려줌' }
  ]);
  scrollTo(58.4, 0);
  const rh = buildRoll('#telh', '1666.9412', '1588.0000');
  const rf = buildRoll('#telf', '1666.9412', '1588.0000');
  const tel = P('#edtel');
  cur.move(tel.x, tel.y, 59.4, .6);
  cur.click(60.05);
  hl(p5[0], 60.05);
  tl.to('#mtel', { opacity: 1, duration: .3 }, 60.2);
  tl.from('#mtel .mbox', { scale: .9, duration: .4, ease: 'back.out(2)' }, 60.2);
  tl.set('#mteltxt', { backgroundColor: '#b8d0ff' }, 60.6);
  tl.set('#caret2', { opacity: 0 }, 60.2);
  tl.set('#mteltxt', { backgroundColor: 'rgba(0,0,0,0)' }, 60.9);
  tl.set('#caret2', { opacity: 1 }, 60.9);
  frames('#mteltxt', typeFrames('', '1588.0000'), 60.9, .09);
  const tok = P('#mtelok');
  cur.move(tok.x, tok.y, 61.9, .4);
  cur.click(62.35);
  tl.to('#mtel', { opacity: 0, duration: .25 }, 62.45);
  hl(p5[0], 62.7, false); hl(p5[1], 62.7);
  tl.set(['#telh0', '#telf0'], { opacity: 0 }, 62.7);
  tl.set(['#telh', '#telf'], { opacity: 1 }, 62.7);
  frames('#telh0', ['1588.0000'], 63.49, .01);
  frames('#telf0', ['1588.0000'], 63.49, .01);
  tl.set(['#telh0', '#telf0'], { opacity: 1 }, 63.5);
  tl.set(['#telh', '#telf'], { opacity: 0 }, 63.5);
  tl.to(rh, { yPercent: -50, duration: .5, stagger: .05, ease: 'back.inOut(1.6)' }, 62.7);
  tl.to(rf, { yPercent: -50, duration: .5, stagger: .05, ease: 'back.inOut(1.6)' }, 62.7);
  tl.to(['#telh', '#telh0'], { color: '#16a34a', duration: .2, yoyo: true, repeat: 3 }, 62.7);
  tl.to(['#telf', '#telf0'], { color: '#4ade80', duration: .2, yoyo: true, repeat: 3 }, 62.7);
  ['#coh', '#cof'].forEach((c, i) => pop(c, 62.8 + i * .1, .4));
  pop('#cob', 63.0, .4);
  tl.fromTo('#toast1', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .4, immediateRender: false }, 63.1);
  tl.set('#savecnt', { textContent: '4' }, 63.3);
  tl.fromTo('#edsave', { scale: 1.2 }, { scale: 1, duration: .4, ease: 'back.out(3)', immediateRender: false }, 63.3);
  hl(p5[1], 63.6, false); hl(p5[2], 63.6);
  fadeOut(['#toast1', '#coh', '#cof', '#cob'], 64.5);

  // STEP 06 링크
  stepHead('#stephead', 64.9, 'STEP 06', '연결 링크 수정', '버튼 · 배너 이동 주소');
  const p6 = panelGroup('#panel', 65.0, [
    { tx: '빨간 배지로 링크 위치 표시' },
    { tx: 'tel: · mailto: · https:// · #', sb: '전화 · 메일 · 페이지 · 섹션 이동' },
    { tx: '형식 검사로 오입력 방지' }
  ]);
  pop('#href1', 65.1, .4); pop('#href2', 65.25, .4);
  hl(p6[0], 65.2);
  cam(65.3, 1400, 880, 1.7, .8);
  const h1 = P('#href1');
  cur.move(h1.x, h1.y, 66.3, .5);
  cur.click(66.9);
  cam(66.95, 960, 540, 1, .5);
  tl.to('#mlink', { opacity: 1, duration: .3 }, 67.1);
  tl.from('#mlink .mbox', { scale: .9, duration: .4, ease: 'back.out(2)' }, 67.1);
  hl(p6[0], 67.1, false); hl(p6[1], 67.1);
  tl.set('#mlinktxt', { backgroundColor: '#b8d0ff' }, 67.7);
  tl.set('#caret3', { opacity: 0 }, 67.1);
  tl.set('#mlinktxt', { backgroundColor: 'rgba(0,0,0,0)' }, 68.0);
  tl.set('#caret3', { opacity: 1 }, 68.0);
  frames('#mlinktxt', typeFrames('', 'tel:15880000'), 68.0, .06);
  const lok = P('#mlinkok');
  cur.move(lok.x, lok.y, 68.95, .4);
  cur.click(69.4);
  tl.to('#mlink', { opacity: 0, duration: .25 }, 69.5);
  tl.set('#href1', { textContent: '✓ 연결 링크 변경됨', backgroundColor: '#16a34a' }, 69.6);
  tl.set('#savecnt', { textContent: '5' }, 69.6);
  tl.fromTo('#edsave', { scale: 1.2 }, { scale: 1, duration: .4, ease: 'back.out(3)', immediateRender: false }, 69.6);
  hl(p6[1], 69.6, false); hl(p6[2], 69.6);
  wipe(70.5);
}

function buildRoll(el, a, b) {
  el = q(el);
  el.innerHTML = [...a].map((c, i) => c === b[i]
    ? `<span style="display:inline-block">${c}</span>`
    : `<span style="display:inline-block;height:44px;overflow:hidden;vertical-align:top"><span class="ri" style="display:block"><span style="display:block">${c}</span><span style="display:block">${b[i]}</span></span></span>`).join('');
  return qa('.ri', el);
}

// ── S11 슬라이드 & 게시판 ──────────────────────────────────
function S11() {
  scene('#s11', 70.5, 80.5);
  const cur = mkCursor('#cur11', '#r11', 1500, 1000);
  const box = q('#slides');
  const data = [['slide1', '살균 케어'], ['slide2', '안전하게 문앞 배송'], ['photo1', '독보적인 클리닝']];
  const SX = i => 44 + i * 281, SY = 190;
  data.forEach(([img, cap], i) => box.insertAdjacentHTML('beforeend',
    `<div class="sl" id="sl${i}" style="left:${SX(i)}px;top:${SY}px"><div class="ph"><img src="../assets/${img}.png"></div><div class="cap">${cap}</div><div class="x">✕</div><div class="mv">⠿</div></div>`));
  box.insertAdjacentHTML('beforeend',
    `<div class="sl" id="sl3" style="left:${SX(2)}px;top:${SY}px"><div class="ph"><div class="empty">클릭하여 이미지 추가</div><img id="sl3img" src="../assets/photo2.png" style="position:absolute;inset:0;clip-path:circle(0% at 50% 50%)"></div><div class="cap" id="sl3cap"></div><div class="x">✕</div><div class="mv">⠿</div></div>`);
  gsap.set(['#sl3', '#newstore', '#newpin', '#pinlbl'], { opacity: 0 });
  const C = (cardSel, x, y) => { const c = q(cardSel); return { x: c.offsetLeft + x, y: c.offsetTop + y }; };

  tl.from('#s11 .stephead .sh', { y: 30, opacity: 0, duration: .6 }, 70.6);
  tl.from('#c11a', { y: 60, opacity: 0, duration: .7, ease: 'expo.out' }, 70.6);
  tl.from('#c11b', { y: 60, opacity: 0, duration: .7, ease: 'expo.out' }, 70.75);
  tl.from(['#sl0', '#sl1', '#sl2'], { y: 40, opacity: 0, stagger: .1, duration: .5, ease: 'expo.out' }, 71.0);

  let p = C('#c11a', SX(1) + 8, SY + 8);
  cur.move(p.x, p.y, 71.6, .5);
  tl.to('#cur11', { scale: .85, duration: .1 }, 72.1);
  tl.to('#sl1', { x: SX(0) - SX(1), scale: 1.04, boxShadow: '0 24px 50px rgba(0,0,0,.25)', zIndex: 5, duration: .8, ease: 'power2.inOut' }, 72.15);
  tl.to('#sl0', { x: SX(1) - SX(0), duration: .45, ease: 'power2.inOut' }, 72.45);
  p = C('#c11a', SX(0) + 8, SY + 8);
  cur.move(p.x, p.y, 72.15, .8);
  tl.to('#sl1', { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)', duration: .25 }, 72.95);
  tl.to('#cur11', { scale: 1, duration: .1 }, 72.95);

  p = C('#c11a', SX(2) + 242, SY + 8);
  cur.move(p.x, p.y, 73.2, .45);
  cur.click(73.7);
  tl.to('#sl2', { scale: 0, opacity: 0, duration: .35, ease: 'back.in(2)' }, 73.75);
  const ab = q('#addsl');
  p = C('#c11a', ab.offsetLeft + ab.offsetWidth / 2, ab.offsetTop + ab.offsetHeight / 2);
  cur.move(p.x, p.y, 73.95, .45);
  cur.click(74.4);
  tl.fromTo('#sl3', { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .45, ease: 'back.out(2)', immediateRender: false }, 74.5);
  p = C('#c11a', SX(2) + 125, SY + 130);
  cur.move(p.x, p.y, 74.8, .4);
  cur.click(75.25);
  tl.to('#sl3img', { clipPath: 'circle(80% at 50% 50%)', duration: .5, ease: 'power2.inOut' }, 75.3);
  frames('#sl3cap', typeFrames('', '천연 전용 세제'), 75.6, .045);

  const as = q('#addst');
  p = C('#c11b', as.offsetLeft + as.offsetWidth / 2, as.offsetTop + as.offsetHeight / 2);
  cur.move(p.x, p.y, 76.5, .5);
  cur.click(77.05);
  tl.to('#mstore', { opacity: 1, duration: .3 }, 77.15);
  tl.from('#mstore .mbox', { scale: .9, duration: .4, ease: 'back.out(2)' }, 77.15);
  frames('#msn', typeFrames('', '딩딩파파 대전점'), 77.4, .035);
  frames('#msa', typeFrames('', '대전광역시 유성구 …'), 78.1, .022);
  frames('#mst', typeFrames('', '042-000-0000'), 78.6, .025);
  const mo = pos('#mstok', '#c11b');
  p = C('#c11b', mo.x, mo.y);
  cur.move(p.x, p.y, 78.95, .35);
  cur.click(79.35);
  tl.to('#mstore', { opacity: 0, duration: .25 }, 79.45);
  tl.fromTo('#newstore', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: .45, ease: 'expo.out', immediateRender: false }, 79.6);
  tl.fromTo('#newpin', { opacity: 0, y: -90 }, { opacity: 1, y: 0, duration: .55, ease: 'bounce.out', immediateRender: false }, 79.65);
  pop('#pinlbl', 79.95, .4);
  wipe(80.5);
}

// ── S12 안전장치 & 저장 ────────────────────────────────────
function S12() {
  scene('#s12', 80.5, 87.0);
  const cur = mkCursor('#cur12', '#r12', 1500, 1000);
  inChars('#s12 .h', 80.6, .04, .7);
  tl.from('#s12 .sc', { rotationY: -90, opacity: 0, stagger: .18, duration: .7, ease: 'expo.out', transformPerspective: 1200 }, 81.0);
  tl.to('#s12 .sc', { y: 60, opacity: 0, stagger: .06, duration: .4, ease: 'power2.in' }, 83.0);
  tl.to('#s12 .h', { y: -40, opacity: 0, duration: .4, ease: 'power2.in' }, 83.0);
  gsap.set('#s12 .bigsave', { xPercent: -50, yPercent: -50 });
  gsap.set(['#s12 .s2', '#s12 .s3'], { yPercent: 100 });
  tl.from('#s12 .bigsave', { scale: .5, opacity: 0, duration: .6, ease: 'back.out(2)' }, 83.5);
  cur.move(990, 540, 83.7, .65);
  cur.click(84.4);
  tl.to('#s12 .bigsave', { scale: .95, duration: .08, yoyo: true, repeat: 1 }, 84.4);
  tl.to('#s12 .s2', { yPercent: 0, duration: .22, ease: 'power3.out' }, 84.45);
  tl.to('#s12 .s3', { yPercent: 0, duration: .25, ease: 'power3.out' }, 85.0);
  ['#ring1', '#ring2'].forEach((r, i) => tl.fromTo(r, { scale: .3, opacity: 1 }, { scale: 1.6, opacity: 0, duration: .9, ease: 'power2.out', immediateRender: false }, 85.0 + i * .15));
  cur.show(85.0, false);
  inChars('#s12 .done', 85.3, .03, .6);
  wipe(87.0);
}

// ── S13 관리자 ─────────────────────────────────────────────
function S13() {
  scene('#s13', 87.0, 97.0);
  const Z = '#admzoom';
  gsap.set(Z, { scale: K, transformOrigin: '0 0' });
  const cur = mkCursor('#cur13', '#r13', 1700, 900);
  const hs = [42, 58, 51, 66, 88, 74, 61, 70, 95, 83, 77, 100, 68, 90, 79, 86];
  q('#bars').innerHTML = hs.map(h => `<i style="height:${h * 1.9}px"></i>`).join('');
  tl.from('#s13 .stephead .sh', { y: 30, opacity: 0, duration: .6 }, 87.1);
  tl.from('#admbw', { y: 60, opacity: 0, duration: .8, ease: 'expo.out' }, 87.1);
  tl.from('#s13 .adm .mi', { x: -20, opacity: 0, stagger: .05, duration: .4 }, 87.5);
  tl.from('#s13 .adm .box, #s13 .adm .tabs', { y: 20, opacity: 0, stagger: .1, duration: .5 }, 87.6);
  const rows = panelGroup('#panel13', 87.6, [
    { tx: '방문자 · 문의 · 실적 통계' }, { tx: '창업문의 내역 · 휴지통' }, { tx: 'AI 챗봇 설정 · 상담 내역' },
    { tx: '팝업 · 배너 관리' }, { tx: '로고 · 메뉴 · 레이아웃' }, { tx: 'FAQ · 게시판 관리' },
    { tx: 'SEO — ROBOTS · 사이트맵' }, { tx: '회원 · 접속자 관리' }
  ], 'compact');
  counter('#av1', 3214, 88.0, 1.3); counter('#av2', 107, 88.0, 1.3); counter('#av3', 186, 88.0, 1.3);
  tl.from('#bars i', { scaleY: 0, stagger: .04, duration: .5, ease: 'expo.out' }, 88.0);
  hl(rows[0], 88.2);
  const mi = id => pos(id, Z);
  let m = mi('#mi2');
  cur.move(m.x, m.y, 89.4, .6);
  cur.click(90.05);
  tl.to('#sub2', { height: 92, duration: .35, ease: 'power2.out' }, 90.1);
  hl(rows[0], 90.1, false); hl(rows[1], 90.1);
  m = mi('#mi1');
  cur.move(m.x, m.y, 90.7, .5);
  cur.click(91.25);
  tl.to('#sub1', { height: 92, duration: .35, ease: 'power2.out' }, 91.3);
  hl(rows[1], 91.3, false); hl(rows[2], 91.3);
  m = mi('#mi3');
  cur.move(m.x, m.y + 184, 92.0, .55);
  cur.click(92.6);
  tl.to('#sub3', { height: 138, duration: .35, ease: 'power2.out' }, 92.65);
  hl(rows[2], 92.65, false); hl(rows[3], 92.65);
  hl(rows[3], 93.3, false); hl(rows[4], 93.3);
  [5, 6, 7].forEach((r, i) => { hl(rows[r - 1], 93.9 + i * .5, false); hl(rows[r], 93.9 + i * .5); });
  rows.forEach((r, i) => tl.to(q('.hl', r), { scaleX: 1, duration: .3 }, 95.6 + i * .05));
  rows.forEach((r, i) => tl.to(r, { color: '#fff', duration: .2 }, 95.6 + i * .05));
  rows.forEach((r, i) => tl.to(q('.ix', r), { color: '#fff', duration: .2 }, 95.6 + i * .05));
  wipe(97.0);
}

// ── S14 아웃트로 ───────────────────────────────────────────
function S14() {
  scene('#s14', 97.0, TOTAL + 1);
  inChars('#s14 .o1', 97.15, .035, .75);
  tl.from('#s14 .o2', { opacity: 0, y: 20, duration: .6 }, 98.0);
  tl.to('#s14 .white', { clipPath: 'circle(75% at 50% 50%)', duration: .9, ease: 'expo.inOut' }, 99.3);
  gsap.set('#s14 .lk', { xPercent: -50 });
  gsap.set('#s14 .ct', { xPercent: -50 });
  tl.from('#s14 .vb', { scaleY: 0, transformOrigin: '0% 0%', duration: .45, ease: 'power3.out' }, 99.9);
  tl.from('#s14 .vl', { scaleY: 0, transformOrigin: '100% 0%', duration: .5, ease: 'power3.out' }, 100.05);
  tl.from('#s14 .wm .ch', { x: -50, opacity: 0, stagger: .05, duration: .6, ease: 'expo.out' }, 100.15);
  inChars('#s14 .cp', 100.6, .02, .7);
  tl.from('#s14 .ct', { opacity: 0, y: 30, duration: .7, ease: 'expo.out' }, 101.6);
  tl.to('#progress', { opacity: 0, duration: .4 }, 101.0);
}

function build() {
  splitText();
  gsap.set('#wipe .wa, #wipe .wb', { xPercent: -125, skewX: -12 });
  tl.fromTo('#progress', { scaleX: 0 }, { scaleX: 1, duration: 101, ease: 'none' }, 0);
  S1(); S2(); S3(); S4(); S5(); S11(); S12(); S13(); S14();
  tl.set({}, {}, TOTAL);
  window.__dur = TOTAL;
  window.__seek = t => { tl.seek(t, false); };
  const m = location.hash.match(/t=([\d.]+)/);
  if (location.hash.includes('play')) tl.play(m ? +m[1] : 0);
  else tl.seek(m ? +m[1] : 0, false);
  window.__ready = true;
}

const imgsLoaded = Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
Promise.all([document.fonts.ready, imgsLoaded]).then(build);
