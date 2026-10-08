const TOTAL = 30;

// ── A 훅 ───────────────────────────────────────────────────
function A() {
  scene('#a', 0, 4.0);
  gsap.set(['#a .q4', '#a .lk'], { xPercent: -50 });
  gsap.set('#a .lk', { y: 350, scale: 2.4, transformOrigin: '50% 50%' });
  tl.from('#a .logo', { opacity: 0, scale: .85, duration: .6, ease: 'expo.out' }, .05);
  tl.to('#a .lk', { y: 0, scale: 1, duration: .5, ease: 'expo.inOut' }, .75);
  inChars('#a .q1', 1.1, .03, .6);
  inChars('#a .q2', 1.35, .04, .65);
  tl.to(chars('#a .q2 b'), { x: -8, duration: .05, repeat: 5, yoyo: true, ease: 'none' }, 2.0);
  tl.to([...chars('#a .q1'), ...chars('#a .q2')], { yPercent: -118, duration: .4, ease: 'expo.in', stagger: .012 }, 2.3);
  inChars('#a .q3', 2.65, .045, .65);
  tl.to('#a .uline', { scaleX: 1, duration: .45, ease: 'power3.inOut' }, 3.25);
  tl.from('#a .q4', { opacity: 0, y: 24, duration: .5 }, 3.2);
  wipe(4.0);
}

// ── B 편집 데모 ────────────────────────────────────────────
let capPrev = null;
function caption(t, n, tt, sb, pill) {
  const d = document.createElement('div');
  d.className = 'c';
  d.innerHTML = `<div class="n">${n}</div><div><div class="tt">${tt}</div><div class="sb">${sb}</div></div>`;
  q('#cap').appendChild(d);
  gsap.set(d, { opacity: 0 });
  if (capPrev) tl.to(capPrev, { opacity: 0, y: -24, duration: .28, ease: 'power2.in' }, t - .3);
  tl.fromTo(d, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .55, ease: 'expo.out', immediateRender: false }, t);
  tl.fromTo(q('.n', d), { scale: .4, rotation: -20 }, { scale: 1, rotation: 0, duration: .6, ease: 'back.out(2.2)', immediateRender: false }, t);
  const pl = qa('.pl');
  pl.forEach((p, i) => tl.to(p, i === pill
    ? { backgroundColor: '#3235CD', borderColor: '#3235CD', color: '#fff', duration: .3 }
    : { backgroundColor: '#fff', borderColor: i < pill ? '#3235CD' : '#dde0ea', color: i < pill ? '#3235CD' : '#9aa0b0', duration: .3 }, t));
  capPrev = d;
}

function B() {
  scene('#b', 3.2, 20.8);
  const Z = '#edzoom', site = q('#edsite');
  gsap.set(Z, { x: 0, y: 0, scale: K, transformOrigin: '0 0' });
  gsap.set('#edbw', { scale: 1.13, transformOrigin: '0 0' });
  let sy = 0;
  const scrollTo = (t, y, d = .9) => { tl.to(site, { y: -y, duration: d, ease: 'power3.inOut' }, t); sy = y; };
  const cam = (t, fx, fy, z, d = .8) => {
    const s = K * z;
    const x = Math.min(0, Math.max(CW - 1920 * s, CW / 2 - fx * s));
    const y = Math.min(0, Math.max(CH - 1080 * s, CH / 2 - fy * s));
    tl.to(Z, { x, y, scale: s, duration: d, ease: 'power3.inOut' }, t);
  };
  const P = el => pos(el, Z);
  const S = el => { const p = pos(el, site); return { ...p, y: p.y - sy, t: p.t - sy, b: p.b - sy }; };
  const cur = mkCursor('#edcur', '#edrip', 1500, 900);
  const bump = (n, t) => {
    tl.set('#savecnt', { textContent: String(n) }, t);
    tl.fromTo('#edsave', { scale: 1.2 }, { scale: 1, duration: .4, ease: 'back.out(3)', immediateRender: false }, t);
  };

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
  bx.innerHTML = boxes.map(([a, b, c, d], i) => `<div class="ed-box" id="eb${i}" style="left:${a}px;top:${b}px;width:${c - a}px;height:${d - b}px"></div>`).join('');
  [[1262, 700], [1758, 940], [1023, 1089], [718, 2761], [1187, 2761], [1656, 2761]]
    .forEach(([x, y], i) => bx.insertAdjacentHTML('beforeend', `<div class="ed-img" id="bi${i}" style="left:${x - 82}px;top:${y - 50}px">img</div>`));
  const ebs = qa('.ed-box', bx), ebi = qa('.ed-img', bx);
  gsap.set([...ebs, ...ebi], { opacity: 0 });
  q('#edsite').nextElementSibling.insertAdjacentHTML('beforeend', '<div class="toast" id="toast0">수정 가능 · 글자 <b>268곳</b> · 이미지 <b>198곳</b></div>');
  gsap.set(['#toast0', '#toast1'], { xPercent: -50 });

  // 01 수정모드
  tl.from('#edbw', { y: 80, opacity: 0, duration: .8, ease: 'expo.out' }, 3.25);
  tl.from('.pills .pl', { opacity: 0, y: -16, stagger: .05, duration: .4 }, 3.4);
  caption(3.4, '01', '수정모드 켜기', '로그인 후 버튼 하나로 편집 시작', 0);
  const mode = P('#edmode');
  cur.move(mode.x, mode.y, 3.9, .65);
  cur.click(4.6);
  tl.to('#edmode .on', { opacity: 1, duration: .25 }, 4.6);
  tl.fromTo('#edtel', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: .5, ease: 'back.out(2)', immediateRender: false }, 4.8);
  tl.fromTo(ebs, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: .4, stagger: .025, ease: 'expo.out', immediateRender: false }, 4.8);
  tl.fromTo(ebi, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .45, stagger: .05, ease: 'back.out(2.5)', immediateRender: false }, 5.05);
  tl.fromTo('#toast0', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .4, immediateRender: false }, 5.3);
  fadeOut('#toast0', 6.15);

  // 02 글자
  caption(6.3, '02', '글자 수정', '클릭하고 바로 타이핑 · 색상까지', 1);
  scrollTo(6.3, 817);
  cur.move(1000, 640, 6.3, .9);
  cam(6.95, 960, 330, 1.9, .8);
  const t1 = S('#t1txt');
  cur.move(t1.r + 6, t1.y, 7.55, .5);
  cur.click(8.1);
  tl.set('#eb9', { outline: '3px solid #ff7a1a', backgroundColor: 'rgba(255,122,26,.1)' }, 8.1);
  blink('#caret1', 8.15, 8.35);
  tl.set('#caret1', { opacity: 1 }, 8.35);
  frames('#t1txt', delFrames('매출보단 마진율로 승부하는', 4), 8.35, .09);
  frames('#t1txt', typeFrames('매출보단 마진율로 ', '증명하는'), 8.8, .075);
  blink('#caret1', 9.65, 10.0);
  const w1 = S('#w1');
  cur.move(w1.l + 2, w1.y, 9.65, .35);
  tl.set('#eb9', { outline: '3px dashed #22c55e', backgroundColor: 'rgba(0,0,0,0)' }, 10.0);
  tl.set('#eb10', { outline: '3px solid #ff7a1a', backgroundColor: 'rgba(255,122,26,.1)' }, 10.0);
  cur.move(w1.r, w1.y, 10.0, .4, 'power1.inOut');
  tl.to('#w1', { backgroundSize: '100% 100%', duration: .4, ease: 'power1.inOut' }, 10.0);
  gsap.set('#toolbar', { left: w1.l - 40, top: w1.t + sy - 92 });
  tl.fromTo('#toolbar', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .3, immediateRender: false }, 10.4);
  const tin = S('#tbin');
  cur.move(tin.x, tin.y, 10.45, .35);
  cur.click(10.85);
  tl.set('#tbin', { outline: '3px solid #ff7a1a' }, 10.85);
  frames('#tbin', typeFrames('', '#FF7A1A'), 10.9, .05);
  tl.to('#w1', { color: '#FF7A1A', duration: .3 }, 11.3);
  cur.move(400, 560, 11.35, .3);
  cur.click(11.65);
  tl.to('#toolbar', { opacity: 0, duration: .2 }, 11.65);
  tl.to('#w1', { backgroundSize: '0% 100%', duration: .15 }, 11.65);
  tl.set('#eb10', { outline: '3px dashed #22c55e', backgroundColor: 'rgba(0,0,0,0)' }, 11.65);
  cam(11.75, 960, 540, 1, .7);
  pop('#edsave', 11.9);

  // 03 이미지
  caption(12.2, '03', '이미지 교체', '끌어다 놓으면 끝', 2);
  scrollTo(12.2, 2077);
  cur.move(900, 700, 12.2, .9);
  const b3 = S('#bi3');
  cur.move(b3.x, b3.y, 13.1, .45);
  cur.click(13.6);
  tl.to('#mimg', { opacity: 1, duration: .3 }, 13.7);
  tl.from('#mimg .mbox', { scale: .9, duration: .4, ease: 'back.out(2)' }, 13.7);
  const dz = P('#drop');
  // 파일 카드를 커서가 집어서 드롭존까지 같이 끌고 감 (커서는 카드 중앙 고정)
  const FX = 1600, FY = 540, GX = 110, GY = 90;
  gsap.set('#filecard', { left: FX, top: FY, rotation: 8 });
  tl.fromTo('#filecard', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: .3, ease: 'power2.out', immediateRender: false }, 13.85);
  cur.move(FX + GX, FY + GY, 13.8, .35);
  tl.to('#edcur', { scale: .85, duration: .1 }, 14.15);
  tl.to('#filecard', { left: dz.x - GX, top: dz.y - 20 - GY, rotation: -3, duration: .65, ease: 'power3.inOut' }, 14.2);
  cur.move(dz.x, dz.y - 20, 14.2, .65, 'power3.inOut');
  tl.to('#drop', { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,.1)', color: '#16a34a', duration: .2 }, 14.65);
  tl.to('#edcur', { scale: 1, duration: .1 }, 14.88);
  tl.to('#filecard', { scale: .3, opacity: 0, duration: .3, ease: 'power2.in' }, 14.88);
  tl.to('#mprev2', { opacity: 1, duration: .4 }, 14.88);
  tl.to('#mok', { opacity: 1, duration: .3 }, 15.0);
  const ok = P('#mimgok');
  cur.move(ok.x, ok.y, 15.1, .4);
  cur.click(15.55);
  tl.to('#mimg', { opacity: 0, duration: .25 }, 15.65);
  tl.to('#swap1', { clipPath: 'circle(75% at 50% 50%)', duration: .6, ease: 'power2.inOut' }, 15.8);
  tl.set('#bi3', { textContent: 'img ✓', backgroundColor: '#d9480f' }, 15.9);
  bump(2, 16.0);

  // 04 대표번호
  caption(16.6, '04', '대표번호 일괄 수정', '헤더 · 본문 · 푸터 8곳을 한 번에', 3);
  scrollTo(16.6, 0);
  const rh = buildRoll('#telhR', '1666.9412', '1588.0000');
  const rf = buildRoll('#telfR', '1666.9412', '1588.0000');
  const tel = P('#edtel');
  cur.move(tel.x, tel.y, 16.8, .7);
  cur.click(17.6);
  tl.to('#mtel', { opacity: 1, duration: .3 }, 17.7);
  tl.from('#mtel .mbox', { scale: .9, duration: .4, ease: 'back.out(2)' }, 17.7);
  tl.set('#mteltxt', { backgroundColor: '#b8d0ff' }, 17.95);
  tl.set('#mteltxt', { backgroundColor: 'rgba(0,0,0,0)' }, 18.15);
  frames('#mteltxt', typeFrames('', '1588.0000'), 18.15, .07);
  const tok = P('#mtelok');
  cur.move(tok.x, tok.y, 18.8, .35);
  cur.click(19.2);
  tl.to('#mtel', { opacity: 0, duration: .25 }, 19.3);
  tl.to(rh, { yPercent: -50, duration: .5, stagger: .05, ease: 'back.inOut(1.6)' }, 19.45);
  tl.to(rf, { yPercent: -50, duration: .5, stagger: .05, ease: 'back.inOut(1.6)' }, 19.45);
  // 글자별 롤링은 자간이 틀어져서 굴리는 동안만 롤 레이어로 바꿔 보여줌
  tl.set(['#telh', '#telf'], { opacity: 0 }, 19.45);
  tl.set(['#telhR', '#telfR'], { opacity: 1 }, 19.45);
  frames('#telh', ['1588.0000'], 20.2, .01);
  frames('#telf', ['1588.0000'], 20.2, .01);
  tl.set(['#telh', '#telf'], { opacity: 1 }, 20.22);
  tl.set(['#telhR', '#telfR'], { opacity: 0 }, 20.22);
  tl.to(['#telh', '#telhR'], { color: '#16a34a', duration: .2, yoyo: true, repeat: 3 }, 19.45);
  tl.to(['#telf', '#telfR'], { color: '#4ade80', duration: .2, yoyo: true, repeat: 3 }, 19.45);
  pop('#coh', 19.55, .4); pop('#cof', 19.65, .4); pop('#cob', 19.75, .4);
  tl.fromTo('#toast1', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .4, immediateRender: false }, 19.8);
  bump(3, 19.9);
  wipe(20.8);
}

// ── C 그 밖에 ──────────────────────────────────────────────
function C() {
  scene('#c', 20.8, 24.2);
  inChars('#c .ttl', 20.9, .02, .6);
  tl.from('.mc', { y: 70, opacity: 0, stagger: .12, duration: .6, ease: 'expo.out' }, 21.1);
  pop('#href', 21.6, .4);
  tl.set('#lnk', { backgroundColor: '#b8d0ff' }, 21.85);
  tl.set('#lnk', { backgroundColor: 'rgba(0,0,0,0)' }, 22.0);
  frames('#lnk', typeFrames('', 'tel:15880000'), 22.0, .045);
  tl.to('#lnkok', { opacity: 1, duration: .3 }, 22.65);
  tl.set('#href', { textContent: '✓ 링크 변경됨', backgroundColor: '#16a34a' }, 22.65);
  tl.to('#sb', { x: -152, scale: 1.05, boxShadow: '0 18px 40px rgba(0,0,0,.2)', zIndex: 3, duration: .6, ease: 'power2.inOut' }, 21.8);
  tl.to('#sa', { x: 152, duration: .45, ease: 'power2.inOut' }, 22.0);
  tl.to('#sb', { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)', duration: .25 }, 22.4);
  tl.to('#sadd', { scale: .94, duration: .08, yoyo: true, repeat: 1 }, 22.55);
  tl.fromTo('#sc', { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .45, ease: 'back.out(2)', immediateRender: false }, 22.7);
  gsap.set(['#sc', '#nst', '#npin'], { opacity: 0 });
  tl.fromTo('#nst', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: .45, ease: 'expo.out', immediateRender: false }, 22.3);
  tl.fromTo('#npin', { opacity: 0, y: -80 }, { opacity: 1, y: 0, duration: .55, ease: 'bounce.out', immediateRender: false }, 22.4);
  wipe(24.2);
}

// ── D 저장 ─────────────────────────────────────────────────
function D() {
  scene('#d', 24.2, 27.0);
  const cur = mkCursor('#curd', '#rd', 1500, 1000);
  gsap.set('#d .bigsave', { xPercent: -50, yPercent: -50 });
  gsap.set(['#d .s2', '#d .s3'], { yPercent: 100 });
  tl.from('#d .bigsave', { scale: .5, opacity: 0, duration: .5, ease: 'back.out(2)' }, 24.3);
  cur.move(990, 450, 24.35, .5);
  cur.click(24.85);
  tl.to('#d .bigsave', { scale: .95, duration: .08, yoyo: true, repeat: 1 }, 24.85);
  tl.to('#d .s2', { yPercent: 0, duration: .2, ease: 'power3.out' }, 24.9);
  tl.to('#d .s3', { yPercent: 0, duration: .25, ease: 'power3.out' }, 25.2);
  ['#ring1', '#ring2'].forEach((r, i) => tl.fromTo(r, { scale: .3, opacity: 1 }, { scale: 1.6, opacity: 0, duration: .9, ease: 'power2.out', immediateRender: false }, 25.2 + i * .15));
  cur.show(25.2, false);
  inChars('#d .done', 25.25, .02, .55);
  wipe(27.0);
}

// ── E 아웃트로 ─────────────────────────────────────────────
function E() {
  scene('#e', 27.0, TOTAL + 1);
  gsap.set(['#e .lk', '#e .ct'], { xPercent: -50 });
  tl.from('#e .vb', { scaleY: 0, transformOrigin: '0% 0%', duration: .45, ease: 'power3.out' }, 27.15);
  tl.from('#e .vl', { scaleY: 0, transformOrigin: '100% 0%', duration: .5, ease: 'power3.out' }, 27.3);
  tl.from('#e .lk .ch', { x: -50, opacity: 0, stagger: .05, duration: .6, ease: 'expo.out' }, 27.4);
  inChars('#e .cp', 27.55, .02, .65);
  tl.from('#e .ct', { opacity: 0, y: 30, duration: .7, ease: 'expo.out' }, 28.2);
}

function build() {
  splitText();
  gsap.set('#wipe .wa, #wipe .wb', { xPercent: -125, skewX: -12 });
  B(); C(); D(); E();
  tl.shiftChildren(.8, false, 0);      // B~E 를 로고 인트로 길이만큼 뒤로
  tl.shiftChildren(-.4, false, 24.2);  // C 끝 여백을 줄여 30초에 맞춤
  A();
  tl.fromTo('#progress', { scaleX: 0 }, { scaleX: 1, duration: 27.4, ease: 'none' }, 0);
  tl.to('#progress', { opacity: 0, duration: .3 }, 27.4);
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
