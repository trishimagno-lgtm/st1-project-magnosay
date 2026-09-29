(() => {
  'use strict';

  const DATA = window.PORTFOLIO;
  const P = DATA.profile;
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad2 = n => String(n).padStart(2, '0');
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const MONO = "'JetBrains Mono', ui-monospace, Consolas, monospace";

  function el(tag, attrs = {}, kids = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    n.append(...[].concat(kids).filter(k => k != null));
    return n;
  }

  document.title = `${P.name} · ST1 Portfolio`;

  /* ------------------------------------------------------------------
     Stops: About Me first, then every seminar in order
  ------------------------------------------------------------------- */
  const COLORS = ['#8b8dff', '#38d6ff', '#ffb84d', '#3ddc97', '#ff6b9d', '#c084fc', '#f0d24a'];
  const seminars = DATA.seminars || [];
  const stops = [
    { kind: 'about', tag: 'About Me', short: 'About', title: P.name, data: P },
    ...seminars.map((s, i) => ({
      kind: 'seminar', tag: s.tag || `Seminar ${pad2(i + 1)}`, short: s.short || `Seminar ${i + 1}`, title: s.title, data: s
    }))
  ];

  /* ------------------------------------------------------------------
     World layout: a serpentine road. Rows run left-to-right, then
     right-to-left, joined by vertical connectors. Two stops per row,
     each with a parking bay above the road.
  ------------------------------------------------------------------- */
  const ROAD_W = 130, RUN = 1900, ROW_GAP = 800, PER_ROW = 2, FRACS = [0.36, 0.78];
  const PAD_W = 300, PAD_H = 190, PAD_OVERLAP = 10;
  const rows = Math.max(1, Math.ceil(stops.length / PER_ROW));
  const roads = [], lines = [], lamps = [], cones = [];

  for (let j = 0; j < rows; j++) {
    const y = j * ROW_GAP, dir = j % 2 === 0 ? 1 : -1;
    roads.push({ x: -ROAD_W / 2, y: y - ROAD_W / 2, w: RUN + ROAD_W, h: ROAD_W });
    lines.push([0, y, RUN, y]);
    for (let x = 220; x < RUN - 100; x += 380) lamps.push([x, y + ROAD_W / 2 + 30]);
    if (j < rows - 1) {
      const x = dir === 1 ? RUN : 0, out = dir === 1 ? 1 : -1;
      roads.push({ x: x - ROAD_W / 2, y: y - ROAD_W / 2, w: ROAD_W, h: ROW_GAP + ROAD_W });
      lines.push([x, y, x, y + ROW_GAP]);
      for (let yy = y + 260; yy < y + ROW_GAP - 100; yy += 320) lamps.push([x + out * (ROAD_W / 2 + 30), yy]);
    }
  }

  stops.forEach((s, i) => {
    const j = Math.floor(i / PER_ROW), k = i % PER_ROW, dir = j % 2 === 0 ? 1 : -1;
    s.color = COLORS[i % COLORS.length];
    s.roadY = j * ROW_GAP;
    s.x = dir === 1 ? RUN * FRACS[k] : RUN * (1 - FRACS[k]);
    const bottom = s.roadY - ROAD_W / 2 + PAD_OVERLAP;
    s.pad = { x: s.x - PAD_W / 2, y: bottom - PAD_H, w: PAD_W, h: PAD_H };
    cones.push([s.x - PAD_W / 2 - 24, s.roadY - ROAD_W / 2 - 14], [s.x + PAD_W / 2 + 24, s.roadY - ROAD_W / 2 - 14]);
  });

  const drivable = [...roads, ...stops.map(s => s.pad)];
  const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  const onRoad = (x, y) => drivable.some(r => inRect(x, y, r));

  const lastRowDir = (rows - 1) % 2 === 0 ? 1 : -1;
  const endX = lastRowDir === 1 ? RUN : 0;
  const endY = (rows - 1) * ROW_GAP;
  const START_X = 150;
  const WORLD = { x0: -260, y0: -520, x1: RUN + 260, y1: endY + 260 };

  /* ------------------------------------------------------------------
     State
  ------------------------------------------------------------------- */
  const car = { x: START_X, y: 0, a: 0, v: 0, steer: 0, braking: false };
  const cam = { x: START_X, y: 0 };
  const CAM_BIAS = 70;
  const visited = new Set();
  const state = { started: false, panelOpen: false, openIndex: -1, active: -1, lightbox: false, menu: false };
  const keys = new Set(), touch = new Set();

  /* ------------------------------------------------------------------
     Canvas
  ------------------------------------------------------------------- */
  const canvas = $('#scene'), ctx = canvas.getContext('2d');
  const world = $('#world');
  let W = 0, H = 0, dpr = 1, zoom = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    zoom = clamp(Math.min(W / 1150, H / 720), 0.5, 1);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ------------------------------------------------------------------
     Physics
  ------------------------------------------------------------------- */
  function step(dt) {
    const drive = state.started && !state.panelOpen && !state.menu;
    const has = k => keys.has(k) || touch.has(k);
    const throttle = drive ? (has('up') ? 1 : 0) - (has('down') ? 1 : 0) : 0;
    const steerT = drive ? (has('right') ? 1 : 0) - (has('left') ? 1 : 0) : 0;

    car.steer += (steerT - car.steer) * Math.min(1, dt * 9);
    const road = onRoad(car.x, car.y);
    const maxF = road ? 470 : 210, maxR = road ? 170 : 90;

    if (throttle > 0) car.v += (car.v < 0 ? 900 : 540) * dt;
    else if (throttle < 0) car.v -= (car.v > 0 ? 900 : 400) * dt;
    else car.v -= Math.sign(car.v) * Math.min(Math.abs(car.v), 300 * dt);
    if (!road) car.v -= Math.sign(car.v) * Math.min(Math.abs(car.v), 380 * dt);
    if (car.v > maxF) car.v = Math.max(maxF, car.v - 900 * dt);
    car.v = clamp(car.v, -maxR, car.v);
    car.braking = throttle < 0 && car.v > 5;

    car.a += car.steer * 2.5 * clamp(Math.abs(car.v) / 150, 0, 1) * Math.sign(car.v) * dt;
    car.x = clamp(car.x + Math.cos(car.a) * car.v * dt, WORLD.x0, WORLD.x1);
    car.y = clamp(car.y + Math.sin(car.a) * car.v * dt, WORLD.y0, WORLD.y1);

    const tx = car.x + Math.cos(car.a) * car.v * 0.25;
    const ty = car.y + Math.sin(car.a) * car.v * 0.25 - CAM_BIAS;
    const f = Math.min(1, dt * 4);
    cam.x += (tx - cam.x) * f;
    cam.y += (ty - cam.y) * f;

    state.active = stops.findIndex(s => inRect(car.x, car.y, s.pad));
  }

  function park(i) {
    const s = stops[i];
    car.x = s.x; car.y = s.pad.y + s.pad.h * 0.66; car.a = -Math.PI / 2; car.v = 0; car.steer = 0;
    cam.x = car.x; cam.y = car.y - CAM_BIAS;
  }

  const nextStop = () => stops.findIndex((_, i) => !visited.has(i));

  /* ------------------------------------------------------------------
     Drawing
  ------------------------------------------------------------------- */
  function drawScene(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-cam.x, -cam.y);
    const vw = W / zoom, vh = H / zoom;
    const L = cam.x - vw / 2, T = cam.y - vh / 2, R = L + vw, B = T + vh;
    const seen = (x, y, m = 200) => x > L - m && x < R + m && y > T - m && y < B + m;

    // faint ground grid
    ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = Math.floor(L / 100) * 100; x < R; x += 100) { ctx.moveTo(x, T); ctx.lineTo(x, B); }
    for (let y = Math.floor(T / 100) * 100; y < B; y += 100) { ctx.moveTo(L, y); ctx.lineTo(R, y); }
    ctx.stroke();

    // roads: outline pass, then fill pass, so joins have no seams
    const m = 3;
    ctx.fillStyle = 'rgba(255,255,255,.13)';
    for (const r of roads) ctx.fillRect(r.x - m, r.y - m, r.w + 2 * m, r.h + 2 * m);
    ctx.fillStyle = '#191c24';
    for (const r of roads) ctx.fillRect(r.x, r.y, r.w, r.h);

    // centre lines
    ctx.strokeStyle = 'rgba(226,178,52,.85)'; ctx.lineWidth = 4; ctx.setLineDash([26, 24]);
    ctx.beginPath();
    for (const [x1, y1, x2, y2] of lines) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
    ctx.stroke(); ctx.setLineDash([]);

    // parking bays
    stops.forEach((s, i) => {
      const p = s.pad, act = state.active === i;
      ctx.fillStyle = '#1e2230'; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.save();
      ctx.strokeStyle = s.color; ctx.lineWidth = 3;
      ctx.globalAlpha = act ? 1 : .6;
      if (act) { ctx.shadowColor = s.color; ctx.shadowBlur = 24; }
      ctx.beginPath(); ctx.moveTo(p.x, p.y + p.h); ctx.lineTo(p.x, p.y); ctx.lineTo(p.x + p.w, p.y); ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = s.color; ctx.globalAlpha = .28;
      ctx.font = `800 26px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s.short.toUpperCase(), s.x, p.y + p.h / 2);
      ctx.globalAlpha = 1;
    });

    // start line
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    const sq = ROAD_W / 8;
    for (let i = 0; i < 8; i++) for (let k = 0; k < 2; k++) if ((i + k) % 2 === 0) ctx.fillRect(90 + k * 10, -ROAD_W / 2 + i * sq, 10, sq);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = `600 12px ${MONO}`; ctx.textAlign = 'center';
    ctx.fillText('START', 100, ROAD_W / 2 + 24);

    // end barricade
    ctx.save(); ctx.translate(endX + lastRowDir * 60, endY);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#f4f4f6' : '#e5484d'; ctx.fillRect(-9, -ROAD_W / 2 + i * (ROAD_W / 6), 18, ROAD_W / 6); }
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = `600 12px ${MONO}`; ctx.fillText('END OF ROAD', 0, ROAD_W / 2 + 26);
    ctx.restore();

    // cones
    for (const [cx, cy] of cones) {
      if (!seen(cx, cy)) continue;
      ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 7); ctx.stroke();
    }

    // lamps
    for (const [lx, ly] of lamps) {
      if (!seen(lx, ly, 260)) continue;
      ctx.fillStyle = '#2a2f3d'; ctx.beginPath(); ctx.arc(lx, ly, 6, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 150);
      g.addColorStop(0, 'rgba(255,224,160,.30)'); g.addColorStop(1, 'rgba(255,224,160,0)');
      ctx.fillStyle = g; ctx.fillRect(lx - 150, ly - 150, 300, 300);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffe9b8'; ctx.beginPath(); ctx.arc(lx, ly, 3, 0, 7); ctx.fill();
    }

    drawArrow(t);
    drawCar();
    ctx.restore();
  }

  function drawArrow(t) {
    const n = nextStop();
    if (n < 0 || !state.started) return;
    const s = stops[n], dx = s.x - car.x, dy = s.pad.y + s.pad.h / 2 - car.y, d = Math.hypot(dx, dy);
    if (d < 320) return;
    const a = Math.atan2(dy, dx), r = 72 + Math.sin(t / 260) * 4;
    ctx.save(); ctx.translate(car.x + Math.cos(a) * r, car.y + Math.sin(a) * r); ctx.rotate(a);
    ctx.fillStyle = s.color; ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-7, -9); ctx.lineTo(-3, 0); ctx.lineTo(-7, 9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawCar() {
    ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.a);
    // headlight beams
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(20, 0, 240, 0);
    g.addColorStop(0, 'rgba(255,240,205,.26)'); g.addColorStop(1, 'rgba(255,240,205,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(20, -8); ctx.lineTo(240, -78); ctx.lineTo(240, 78); ctx.lineTo(20, 8); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.roundRect(-22, -10, 48, 28, 8); ctx.fill();
    // wheels
    ctx.fillStyle = '#0a0b10';
    for (const [wx, wy] of [[-14, -14], [12, -14], [-14, 14], [12, 14]]) ctx.fillRect(wx - 5, wy - 2.5, 10, 5);
    // body
    ctx.fillStyle = '#6d6df0'; ctx.beginPath(); ctx.roundRect(-23, -12, 46, 24, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    // roof + windshield
    ctx.fillStyle = '#4b4bc4'; ctx.beginPath(); ctx.roundRect(-9, -9, 17, 18, 4); ctx.fill();
    ctx.fillStyle = 'rgba(190,230,255,.85)'; ctx.beginPath(); ctx.roundRect(8, -8, 7, 16, 3); ctx.fill();
    // lights
    ctx.fillStyle = '#fff6d6'; ctx.fillRect(21, -10, 3, 5); ctx.fillRect(21, 5, 3, 5);
    ctx.fillStyle = car.braking ? '#ff3b3b' : '#a11d24'; ctx.fillRect(-24, -10, 3, 5); ctx.fillRect(-24, 5, 3, 5);
    ctx.restore();
  }

  /* ------------------------------------------------------------------
     Minimap
  ------------------------------------------------------------------- */
  const mm = $('#minimap'), mctx = mm.getContext('2d');
  const MM_MAX = COARSE || innerWidth < 760 ? 130 : 170;
  const bw = WORLD.x1 - WORLD.x0, bh = WORLD.y1 - WORLD.y0, ms = MM_MAX / Math.max(bw, bh);
  const mmW = Math.max(90, Math.round(bw * ms)), mmH = Math.max(70, Math.round(bh * ms));
  mm.style.width = mmW + 'px'; mm.style.height = mmH + 'px';
  mm.width = Math.round(mmW * dpr); mm.height = Math.round(mmH * dpr);

  function drawMinimap() {
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.clearRect(0, 0, mmW, mmH);
    const ox = (mmW - bw * ms) / 2, oy = (mmH - bh * ms) / 2;
    const mx = x => ox + (x - WORLD.x0) * ms, my = y => oy + (y - WORLD.y0) * ms;
    mctx.fillStyle = '#3a3f52';
    for (const r of roads) mctx.fillRect(mx(r.x), my(r.y), Math.max(2, r.w * ms), Math.max(2, r.h * ms));
    stops.forEach((s, i) => {
      const x = mx(s.x), y = my(s.pad.y + s.pad.h / 2);
      mctx.fillStyle = s.color; mctx.globalAlpha = visited.has(i) ? 1 : .55;
      mctx.beginPath(); mctx.arc(x, y, 3.5, 0, 7); mctx.fill();
      if (i === nextStop()) { mctx.globalAlpha = 1; mctx.strokeStyle = s.color; mctx.lineWidth = 1.5; mctx.beginPath(); mctx.arc(x, y, 6.5, 0, 7); mctx.stroke(); }
    });
    mctx.globalAlpha = 1;
    mctx.save(); mctx.translate(mx(car.x), my(car.y)); mctx.rotate(car.a);
    mctx.fillStyle = '#fff'; mctx.beginPath(); mctx.moveTo(5, 0); mctx.lineTo(-4, -3.5); mctx.lineTo(-4, 3.5); mctx.closePath(); mctx.fill();
    mctx.restore();
  }

  /* ------------------------------------------------------------------
     Media helper: shows a placeholder naming the file if it is missing
  ------------------------------------------------------------------- */
  function media(src, alt, label) {
    const wrap = el('div', { class: 'media' });
    if (!src) { wrap.classList.add('is-ph'); wrap.append(placeholder(label, '(no file set)')); return wrap; }
    const im = new Image();
    im.alt = alt; im.decoding = 'async';
    im.addEventListener('error', () => { wrap.classList.add('is-ph'); wrap.replaceChildren(placeholder(label, src)); });
    im.addEventListener('click', () => openLightbox(src, alt));
    im.src = src;
    wrap.append(im);
    return wrap;
  }
  const placeholder = (label, path) => el('div', { class: 'ph' }, [el('b', { text: label }), el('span', { text: path })]);

  /* ------------------------------------------------------------------
     World cards (previews shown beside the road)
  ------------------------------------------------------------------- */
  const cardEls = stops.map((s, i) => {
    const kids = [el('span', { class: 'tag', text: '// ' + s.tag.toUpperCase() }), el('h3', { text: s.title })];
    if (s.kind === 'about') {
      kids.push(el('div', { class: 'facts' }, [
        fact('Course', P.course), fact('School', P.school), fact('Subject', P.subject)
      ]));
    } else {
      const bits = [s.data.date, s.data.speaker].filter(Boolean).join(' · ');
      if (bits) kids.push(el('p', { class: 'meta', text: bits }));
      const shot = (s.data.screenshots || [])[0];
      kids.push(shot
        ? media(shot, s.title + ' screenshot', 'Screenshot')
        : media(firstCertImage(s.data), s.title + ' certificate', 'Certificate'));
    }
    kids.push(el('p', { class: 'go', text: COARSE ? 'Tap to open' : 'Park here · press Enter' }));
    const c = el('article', {
      class: 'card', tabindex: '-1', role: 'button', 'aria-label': `Open ${s.tag}: ${s.title}`,
      style: `--c:${s.color};left:${s.x - 180}px;top:${s.pad.y - 26}px`,
      onclick: () => { if (state.started) openStop(i); }
    }, kids);
    world.append(c);
    return c;
  });
  function fact(k, v) { return el('div', {}, [el('span', { class: 'k', text: k }), v]); }

  /* ------------------------------------------------------------------
     Detail panel
  ------------------------------------------------------------------- */
  const panel = $('#panel'), panelBody = $('#panel-body');

  function renderAbout(s) {
    const p = s.data;
    const words = p.name.split(/\s+/).filter(Boolean);
    const initials = (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
    const avatar = el('div', { class: 'avatar' });
    const im = new Image(); im.alt = p.name;
    im.addEventListener('error', () => avatar.replaceChildren(el('span', { class: 'ini', text: initials })));
    im.src = p.photo || '';
    avatar.append(im);
    if (!p.photo) avatar.replaceChildren(el('span', { class: 'ini', text: initials }));

    return el('div', { class: 'about' }, [
      avatar,
      el('div', {}, [
        el('h2', { id: 'panel-title', text: p.name }),
        el('p', { class: 'lead', text: p.tagline || '' }),
        el('div', { class: 'facts-grid' }, [
          fact('// Course', p.course), fact('// School', p.school), fact('// Subject', p.subject)
        ])
      ])
    ]);
  }

  // Accepts "https://..." or { label, url }. Only http(s) links are rendered.
  function normalizeLink(l) {
    const raw = typeof l === 'string' ? { url: l } : (l || {});
    const s = String(raw.url || '').trim();
    if (!s) return null;
    let u;
    try { u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : 'https://' + s); } catch { return null; }
    if (!/^https?:$/.test(u.protocol)) return null;
    return { url: u.href, label: raw.label || u.hostname.replace(/^www\./, '') };
  }

  // A certificate is a path (image or .pdf) or { title, by, date, image, pdf, transcript }.
  function normalizeCert(c) {
    if (!c) return null;
    const o = typeof c === 'string' ? (/\.pdf(\?|#|$)/i.test(c) ? { pdf: c } : { image: c }) : c;
    return o.image || o.pdf ? o : null;
  }

  function certsOf(d) { return (d.certificates || [d.certificate]).map(normalizeCert).filter(Boolean); }
  function firstCertImage(d) { return (certsOf(d).find(c => c.image) || {}).image; }

  function certificateNode(c) {
    const kids = [];
    if (c.image) kids.push(media(c.image, c.title || 'Certificate', 'Certificate'));
    else kids.push(el('object', {
      class: 'pdf-embed', data: c.pdf + '#view=FitH', type: 'application/pdf', 'aria-label': c.title || 'Certificate (PDF)'
    }, [placeholder('Certificate (PDF)', c.pdf)]));

    const sub = [c.by, c.date].filter(Boolean).join(' · ');
    const acts = [];
    if (c.pdf) acts.push(el('a', { class: 'pdf-link', href: c.pdf, target: '_blank', rel: 'noopener', text: 'Open PDF ↗' }));
    if (c.transcript) acts.push(el('a', { class: 'pdf-link', href: c.transcript, target: '_blank', rel: 'noopener', text: 'Transcript (PDF) ↗' }));
    const cap = [
      c.title ? el('p', { class: 'cert-title', text: c.title }) : null,
      sub ? el('p', { class: 'cert-sub', text: sub }) : null,
      c.note ? el('p', { class: 'cert-note', text: c.note }) : null,
      acts.length ? el('div', { class: 'cert-acts' }, acts) : null
    ].filter(Boolean);
    if (cap.length) kids.push(el('figcaption', {}, cap));
    return el('figure', { class: 'cert' }, kids);
  }

  function renderSeminar(s) {
    const d = s.data;
    // screenshots: [] hides the section; leaving it out shows a placeholder to fill in
    const noShots = Array.isArray(d.screenshots) && d.screenshots.length === 0;
    const shots = (d.screenshots && d.screenshots.length ? d.screenshots : [null])
      .map((src, i) => media(src, `${d.title} screenshot ${i + 1}`, 'Screenshot'));

    const takeaways = d.takeaway ? [d.takeaway] : (d.takeaways || []);
    const links = (d.links || []).map(normalizeLink).filter(Boolean);
    const certs = certsOf(d);

    const side = [];
    if (takeaways.length) {
      side.push(el('section', {}, [
        el('h4', { class: 'k', text: takeaways.length === 1 ? '// Key takeaway' : '// Key takeaways' }),
        takeaways.length === 1
          ? el('p', { class: 'takeaway', text: takeaways[0] })
          : el('ol', { class: 'takeaways' }, takeaways.map(t => el('li', { text: t })))
      ]));
    }
    if (links.length) {
      side.push(el('section', {}, [
        el('h4', { class: 'k', text: links.length === 1 ? '// Link' : '// Links' }),
        el('ul', { class: 'links' }, links.map(l => el('li', {}, [
          el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer' }, [
            el('span', { class: 'lbl', text: l.label }), el('span', { class: 'ext', 'aria-hidden': 'true', text: '↗' })
          ])
        ])))
      ]));
    }
    // one certificate sits in the side column; several get their own full-width grid
    if (certs.length === 1) {
      side.push(el('section', {}, [el('h4', { class: 'k', text: '// Certificate' }), certificateNode(certs[0])]));
    }

    const meta = [
      d.date,
      d.speaker ? 'Speaker: ' + d.speaker : null,
      d.venue,
      d.organizer ? 'By ' + d.organizer : null
    ].filter(Boolean);

    return el('div', {}, [
      el('h2', { id: 'panel-title', text: d.title }),
      el('ul', { class: 'meta' }, meta.map(t => el('li', { text: t }))),
      el('div', { class: noShots ? 'cols one' : 'cols' }, [
        noShots ? null : el('section', {}, [el('h4', { class: 'k', text: '// Screenshots' }), el('div', { class: 'shots' }, shots)]),
        el('div', { class: 'side' }, side)
      ]),
      certs.length > 1
        ? el('section', { class: 'certs-wrap' }, [
            el('h4', { class: 'k', text: `// Certificates (${certs.length})` }),
            el('div', { class: 'certs' }, certs.map(certificateNode))
          ])
        : null
    ]);
  }

  function openStop(i) {
    const s = stops[i];
    state.panelOpen = true; state.openIndex = i; visited.add(i);
    closeMenu();
    panel.style.setProperty('--c', s.color);
    $('#panel-tag').textContent = '// ' + s.tag.toUpperCase();
    panelBody.replaceChildren(s.kind === 'about' ? renderAbout(s) : renderSeminar(s));
    panelBody.scrollTop = 0;
    $('#panel-prev').disabled = i === 0;
    $('#panel-next').disabled = i === stops.length - 1;
    $('#panel-count').textContent = `${i + 1} / ${stops.length}`;
    panel.hidden = false;
    $('#panel-close').focus({ preventScroll: true });
  }

  function closePanel() {
    if (!state.panelOpen) return;
    state.panelOpen = false; panel.hidden = true;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  function gotoStop(i) { park(i); openStop(i); }

  $('#panel-close').addEventListener('click', closePanel);
  $('#panel-prev').addEventListener('click', () => gotoStop(state.openIndex - 1));
  $('#panel-next').addEventListener('click', () => gotoStop(state.openIndex + 1));
  panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });

  /* Lightbox */
  const lb = $('#lightbox');
  function openLightbox(src, alt) {
    $('#lightbox-img').src = src; $('#lightbox-img').alt = alt || '';
    lb.hidden = false; state.lightbox = true;
  }
  function closeLightbox() { lb.hidden = true; state.lightbox = false; }
  lb.addEventListener('click', closeLightbox);

  /* Stops menu (jump straight to any stop) */
  const menu = $('#stops-menu'), menuBtn = $('#stops-btn');
  stops.forEach((s, i) => {
    const b = el('button', { style: `--c:${s.color}`, onclick: () => { park(i); closeMenu(); menuBtn.blur(); } }, [
      el('span', { class: 'tag', text: s.tag }), el('span', { class: 't', text: s.title })
    ]);
    b.dataset.i = i;
    menu.append(el('li', {}, [b]));
  });
  function closeMenu() { state.menu = false; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => {
    state.menu = menu.hidden;
    menu.hidden = !state.menu;
    menuBtn.setAttribute('aria-expanded', String(state.menu));
    menu.querySelectorAll('button').forEach(b => b.classList.toggle('done', visited.has(+b.dataset.i)));
  });

  /* ------------------------------------------------------------------
     Intro screen + input
  ------------------------------------------------------------------- */
  $('#intro-title').textContent = P.name.toUpperCase();
  $('#intro-count').textContent = `Visit all ${stops.length} stops in order`;
  const legend = $('#intro-stops');
  stops.forEach(s => legend.append(el('li', { style: `--c:${s.color}`, text: s.short })));
  $('#stat-total').textContent = stops.length;

  const intro = $('#intro');
  function start() {
    if (state.started) return;
    state.started = true; intro.hidden = true;
  }
  intro.addEventListener('click', start);

  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right'
  };

  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!state.started) {
      if (!['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) { start(); e.preventDefault(); }
      return;
    }
    if (e.key === 'Escape') {
      if (state.lightbox) closeLightbox();
      else if (state.panelOpen) closePanel();
      else if (state.menu) closeMenu();
      return;
    }
    if (state.panelOpen || state.lightbox || state.menu) return;
    const k = KEYMAP[e.code];
    if (k) { keys.add(k); e.preventDefault(); return; }
    if (['Enter', 'KeyE', 'Space'].includes(e.code) && !(e.target instanceof HTMLButtonElement)) {
      if (state.active >= 0) openStop(state.active);
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
  window.addEventListener('blur', () => { keys.clear(); touch.clear(); });

  document.querySelectorAll('#touch button').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); if (!state.started) start(); touch.add(k); b.classList.add('on'); };
    const off = () => { touch.delete(k); b.classList.remove('on'); };
    b.addEventListener('pointerdown', on);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, off));
  });

  const promptBtn = $('#prompt');
  promptBtn.addEventListener('click', () => { if (state.active >= 0) openStop(state.active); });

  /* ------------------------------------------------------------------
     HUD sync + main loop
  ------------------------------------------------------------------- */
  const zoneEl = $('#zone'), speedEl = $('#speed-val'), visitedEl = $('#stat-visited');
  let lastZone = '', lastPrompt = '', lastSpeed = -1, lastVisited = -1, lastActiveCard = -2;

  function syncDom() {
    world.style.transform = `translate(${W / 2 - cam.x * zoom}px, ${H / 2 - cam.y * zoom}px) scale(${zoom})`;

    const sp = Math.round(Math.abs(car.v) * 0.22);
    if (sp !== lastSpeed) { speedEl.textContent = sp; lastSpeed = sp; }
    if (visited.size !== lastVisited) { visitedEl.textContent = visited.size; lastVisited = visited.size; }

    const n = nextStop();
    const act = state.active >= 0 ? stops[state.active] : null;
    const focus = act || (n >= 0 ? stops[n] : null);
    const zone = act ? `● ${act.tag}` : n < 0 ? '● All stops visited' : `→ Next: ${stops[n].tag}`;
    if (zone !== lastZone) { zoneEl.textContent = zone; lastZone = zone; }
    if (focus) { zoneEl.style.setProperty('--c', focus.color); document.documentElement.style.setProperty('--c', focus.color); }

    const pr = act && !state.panelOpen ? `${COARSE ? 'Tap to open' : 'Press ENTER to open'} · ${act.tag}` : '';
    if (pr !== lastPrompt) {
      lastPrompt = pr; promptBtn.hidden = !pr; promptBtn.textContent = pr;
      if (act) promptBtn.style.setProperty('--c', act.color);
    }

    if (state.active !== lastActiveCard) {
      cardEls.forEach((c, i) => c.classList.toggle('is-active', i === state.active));
      lastActiveCard = state.active;
    }
  }

  let last = performance.now();
  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    step(dt);
    drawScene(t);
    drawMinimap();
    syncDom();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // exposed for quick manual testing in the console
  window.__st1 = {
    park, openStop, car, stops, keys, state,
    tick(dt = 1 / 60, n = 1) { for (let i = 0; i < n; i++) step(dt); drawScene(performance.now()); drawMinimap(); syncDom(); }
  };
})();
