// Vídeo animado de un departamento de Aquaterra (Asunción): ciudad → edificio → plano → detalles → precio.
// Todo se dibuja en función de T (reloj de autor del motor animations-v3).
const C = { night: '#0b0a08', ink: '#16130e', gold: '#f7c548', goldL: '#ffe7a3', goldD: '#a8740f', ivory: '#faf7f0', muted: '#574e3f', wall: '#efe6d3' };
const HF = "'Plus Jakarta Sans', system-ui, sans-serif";
const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutCubic, pop: Easing.easeOutBack };
const tw = (T, from, to, start, end, ease) => animate({ from, to, start, end, ease: ease || MOTION.enter })(T);
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = hx(a), B = hx(b), k = Math.max(0, Math.min(1, t)); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',') + ')'; };
const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pts = (a) => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dateES = (s) => { const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? (+m[3]) + ' ' + MES[+m[2] - 1] + ' ' + m[1] : String(s || '—'); };

function makePlan(p) {
  const area = p.area || 60, beds = Math.max(1, p.beds || 1), baths = Math.max(1, p.baths || 1), mono = /monoambiente/i.test(p.title || '');
  const W = Math.sqrt(area * 1.45), D = area / W, L = W * (beds >= 2 ? .54 : .62), kd = D * .36, R = [];
  R.push({ n: 'Cocina', x: 0, z: 0, w: L, d: kd, t: 'kit' });
  R.push({ n: mono ? 'Ambiente' : 'Salón comedor', x: 0, z: kd, w: L, d: D - kd, t: 'live' });
  const seq = []; for (let i = 0; i < beds; i++) { seq.push('bed'); if (i < baths) seq.push('bath'); } for (let j = beds; j < baths; j++) seq.push('bath');
  const wt = seq.map(s => s === 'bed' ? 1.7 : .85), sw = wt.reduce((a, b) => a + b, 0);
  let z = 0, bi = 0, ba = 0;
  seq.forEach((s, i) => { const d = D * wt[i] / sw; R.push({ n: s === 'bed' ? (mono ? 'Descanso' : beds > 1 ? 'Dormitorio ' + (++bi) : 'Dormitorio') : (baths > 1 ? 'Baño ' + (++ba) : 'Baño'), x: L, z, w: W - L, d, t: s }); z += d; });
  const balc = (p.feats || []).some(f => /balc/i.test(f)), bd = balc ? 1.7 : 0;
  if (balc) R.push({ n: 'Balcón', x: L * .08, z: D, w: L * .84, d: bd, t: 'balc' });
  const seen = {}, walls = [];
  R.forEach(r => { if (r.t === 'balc') return; [[r.x, r.z, r.x + r.w, r.z], [r.x + r.w, r.z, r.x + r.w, r.z + r.d], [r.x, r.z + r.d, r.x + r.w, r.z + r.d], [r.x, r.z, r.x, r.z + r.d]].forEach(e => { const k = e.map(v => v.toFixed(2)).join(','), k2 = [e[2], e[3], e[0], e[1]].map(v => v.toFixed(2)).join(','); if (seen[k] || seen[k2]) return; seen[k] = 1; walls.push(e); }); });
  walls.sort((a, b) => (a[1] + a[3]) - (b[1] + b[3]) || (a[0] + a[2]) - (b[0] + b[2]));
  return { W, D, De: D + bd, rooms: R, walls };
}
const FILL = { live: '#fbf5e4', kit: '#f4e5bb', bed: '#f3efe7', bath: '#e2dacb', balc: '#e9cf86' };

function useListing(listing) {
  return React.useMemo(() => {
    const D = window.AQ_DATA || { properties: [], zones: [] };
    let q = ''; try { q = new URLSearchParams(location.search).get('ref') || ''; } catch (e) {}
    const id = q || listing || 'AQ-001';
    const p = D.properties.find(x => x.id === id || x.slug === id) || D.properties[0] || { title: 'Departamento', feats: [] };
    const z = (D.zones || []).find(x => x.slug === p.zone) || { name: 'Asunción' };
    const sheet = [['Referencia', p.id], ['Tipo', p.type], ['Barrio', z.name + ', Asunción'], p.area && [p.type === 'Proyecto' ? 'Superficie desde' : 'Superficie', p.area + ' m²'], p.lot && ['Lote', fmt(p.lot) + ' m²'], p.beds && [p.type === 'Proyecto' ? 'Dormitorios desde' : 'Dormitorios', String(p.beds)], p.baths && ['Baños', String(p.baths)], p.year ? ['Año de construcción', String(p.year)] : p.delivery && ['Entrega', String(p.delivery).replace(/ por el promotor/, '')], ['Disponibilidad', p.status], (p.price && p.area && p.type !== 'Terreno') && ['Precio por m²', fmt(p.price / p.area) + ' USD'], ['Actualizado', dateES(p.updated)]].filter(Boolean).slice(0, 10);
    return { p, z, plan: makePlan(p), sheet };
  }, [listing]);
}

function useCity() {
  return React.useMemo(() => {
    const r = rng(41), B = [];
    for (let gx = -4; gx <= 4; gx++) for (let gz = -4; gz <= 4; gz++) {
      if (!gx && !gz) continue;
      const x = gx * 9 + (r() - .5) * 1.2, z = gz * 9 + (r() - .5) * 1.2, d = Math.hypot(x, z);
      if (d > 40 + r() * 4) continue;
      let h = 2 + 15 * Math.exp(-Math.pow(d / 22, 2)) * (.45 + r() * .8) + r() * 3;
      if (gx + gz > 0 && d < 15) h = Math.min(h, 4.5);
      const w = 4.6 + r() * 1.8, dd = 4.6 + r() * 1.8, win = [];
      for (let k = 0; k < 14; k++) win.push([r() < .5 ? 'x' : 'z', r(), r(), r() < .3]);
      B.push({ x0: x - w / 2, x1: x + w / 2, z0: z - dd / 2, z1: z + dd / 2, h, d, win });
    }
    return B.sort((a, b) => (a.x0 + a.z0) - (b.x0 + b.z0));
  }, []);
}

function AptPiece(props) {
  const { T, CUES } = useComposition();
  const { p, z, plan, sheet } = useListing(props.listing);
  const city = useCity();
  const E = CUES.Edificio, PL = CUES.Plano, DT = CUES.Detalles, PR = CUES.Precio, FI = isFinite(CUES.Ficha) ? CUES.Ficha : 1e9;
  const pF = tw(T, 0, 1, FI, FI + 1.0, MOTION.draw);

  // camera (isometric)
  const k = 8.5 + tw(T, 0, 4, 0, E, MOTION.draw) + tw(T, 0, 2.5, E, E + 1.6, MOTION.draw) + tw(T, 0, 19, E + 1.5, PL + .2, MOTION.draw);
  const TW = 7, TD = 7 * plan.D / plan.W, NF = 13, FH = 1.25, UF = 7, UFy = UF * FH;
  const fy = 3 + tw(T, 0, 5, E, E + 1.5, MOTION.draw) + tw(T, 0, UFy + FH - 8, E + 1.5, PL + .2, MOTION.draw);
  const sx = 1100 - tw(T, 0, 140, 0, E + 1.5, MOTION.draw), sy = 600 - tw(T, 0, 60, E, PL + .2, MOTION.draw);
  const P = (x, y, zz) => [sx + (x - zz) * .866 * k, sy + ((x + zz) * .5 - (y - fy)) * k];
  const box = (b, y0, y1) => ({ top: [P(b.x0, y1, b.z0), P(b.x1, y1, b.z0), P(b.x1, y1, b.z1), P(b.x0, y1, b.z1)], xf: [P(b.x1, y0, b.z0), P(b.x1, y1, b.z0), P(b.x1, y1, b.z1), P(b.x1, y0, b.z1)], zf: [P(b.x0, y0, b.z1), P(b.x1, y0, b.z1), P(b.x1, y1, b.z1), P(b.x0, y1, b.z1)] });

  const cityOp = tw(T, 1, 0, PL + .1, PL + .8);
  const day = tw(T, 0, 1, PL + .2, PL + 1.0, MOTION.draw);
  const bg = mix(C.night, C.ivory, day), fg = mix('#ffffff', C.ink, day);

  // city blocks + windows
  let grid = '';
  if (cityOp > 0) for (let i = -5; i <= 4; i++) { const g = i * 9 + 4.5, a = P(-42, 0, g), b = P(42, 0, g), c = P(g, 0, -42), d = P(g, 0, 42); grid += 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + 'M' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + 'L' + d[0].toFixed(1) + ' ' + d[1].toFixed(1); }
  const blocks = [], win = [];
  if (cityOp > 0) city.forEach((b, i) => {
    const st = .05 + b.d / 40 * 1.0, g = tw(T, 0, 1, st, st + .8, MOTION.pop), h = Math.max(.05, b.h * g);
    const f = box(b, 0, h);
    blocks.push(<g key={'b' + i}><polygon points={pts(f.zf)} fill="#120f0b" /><polygon points={pts(f.xf)} fill="#1b1711" /><polygon points={pts(f.top)} fill="#2b251c" stroke="rgba(247,197,72,.28)" strokeWidth="1" /></g>);
    if (g > .9) b.win.forEach(w => { if (!w[3]) return; const yy = 1 + w[2] * (h - 2); if (yy > h - .8) return; let q; if (w[0] === 'x') { const zz = b.z0 + .4 + w[1] * (b.z1 - b.z0 - 1.2); q = [P(b.x1, yy, zz), P(b.x1, yy, zz + .7), P(b.x1, yy + .55, zz + .7), P(b.x1, yy + .55, zz)]; } else { const xx = b.x0 + .4 + w[1] * (b.x1 - b.x0 - 1.2); q = [P(xx, yy, b.z1), P(xx + .7, yy, b.z1), P(xx + .7, yy + .55, b.z1), P(xx, yy + .55, b.z1)]; } win.push('M' + q.map(v => v[0].toFixed(1) + ' ' + v[1].toFixed(1)).join('L') + 'Z'); });
  });
  const front = blocks.filter((_, i) => city[i].x0 + city[i].z0 > -TW), back = blocks.filter((_, i) => city[i].x0 + city[i].z0 <= -TW);

  // tower floors
  const tb = { x0: -TW / 2, x1: TW / 2, z0: -TD / 2, z1: TD / 2 };
  const floors = [];
  for (let f = 0; f < NF; f++) {
    const t0 = E + .15 + f * .09, dropIn = (1 - tw(T, 0, 1, t0, t0 + .45, MOTION.pop)) * 7, op = tw(T, 0, 1, t0, t0 + .12) * (f === UF ? tw(T, 1, 0, PL + .3, PL + .5) : cityOp);
    const lift = f > UF ? tw(T, 0, 16 + (f - UF) * 2, PL - .15, PL + .8, MOTION.enter) : 0;
    if (op <= 0) continue;
    const y0 = f * FH + dropIn + lift, y1 = y0 + FH * .9, fc = box(tb, y0, y1), lit = f === UF ? tw(T, 0, 1, E + 1.45, E + 1.85) : 0;
    const sideOp = f === UF ? cityOp : 1, band = (face, ax) => { const a = .28, b = .72; return ax === 'x' ? [P(tb.x1, y0 + FH * a, tb.z0 + .3), P(tb.x1, y0 + FH * a, tb.z1 - .3), P(tb.x1, y0 + FH * b, tb.z1 - .3), P(tb.x1, y0 + FH * b, tb.z0 + .3)] : [P(tb.x0 + .3, y0 + FH * a, tb.z1), P(tb.x1 - .3, y0 + FH * a, tb.z1), P(tb.x1 - .3, y0 + FH * b, tb.z1), P(tb.x0 + .3, y0 + FH * b, tb.z1)]; };
    floors.push(<g key={'f' + f} opacity={op}>
      <g opacity={sideOp}>
        <polygon points={pts(fc.zf)} fill={mix('#1d1810', '#c99a2e', lit)} />
        <polygon points={pts(fc.xf)} fill={mix('#282117', '#f7c548', lit)} />
        <polygon points={pts(band(fc, 'z'))} fill={lit ? '#fff3c8' : 'rgba(247,197,72,' + (f % 3 ? .3 : .55) + ')'} />
        <polygon points={pts(band(fc, 'x'))} fill={lit ? '#fff3c8' : 'rgba(247,197,72,' + (f % 4 ? .35 : .6) + ')'} />
      </g>
      <polygon points={pts(fc.top)} fill={mix('#3a3226', C.goldL, lit)} stroke="rgba(247,197,72,.55)" strokeWidth="1.2" />
    </g>);
  }
  const lotOp = tw(T, 0, 1, .6, 1.1) * tw(T, 1, 0, E + .1, E + .4), lotPulse = .5 + .5 * Math.sin(T * 5);
  const lot = [P(tb.x0, 0, tb.z0), P(tb.x1, 0, tb.z0), P(tb.x1, 0, tb.z1), P(tb.x0, 0, tb.z1)];
  const glowOp = tw(T, 0, .9, E + 1.45, E + 1.9) * cityOp;
  const ufc = box(tb, UFy, UFy + FH * .9);

  // plan projection: iso slab → top-down → oblique 3D
  const a1 = tw(T, 0, 1, PL + .1, PL + 1.2, MOTION.draw);
  const S = Math.min(640 / plan.De, 860 / plan.W);
  const pD = tw(T, 0, 1, DT - .1, DT + 1.0, MOTION.draw), pP = tw(T, 0, 1, PR, PR + 1.0, MOTION.draw);
  const th = -.45 * pD + .13 * pP + (T > PR ? -(T - PR) * .025 : 0), tilt = 1 - .5 * pD, hs = .9 * pD;
  const ocx = 1180 - 420 * pD - 170 * pP - 150 * pF, ocy = 520 + 70 * pD + 10 * pP + 20 * pF, Ss = S * (1 - .05 * pD - .17 * pP - .12 * pF);
  const cu = plan.W / 2, cv = plan.De / 2, ct = Math.cos(th), st = Math.sin(th);
  const Q = (u, v, h) => {
    const du = u - cu, dv = v - cv, ru = du * ct - dv * st, rv = du * st + dv * ct;
    const flat = [ocx + ru * Ss, ocy + rv * Ss * tilt - (h || 0) * Ss * hs];
    if (a1 >= 1) return flat;
    const iso = P(-TW / 2 + u * TW / plan.W, UFy + FH * .9 + (h || 0) * .0, -TD / 2 + v * TD / plan.D);
    return [iso[0] + (flat[0] - iso[0]) * a1, iso[1] + (flat[1] - iso[1]) * a1];
  };
  const planOp = tw(T, 0, 1, PL + .02, PL + .3);
  const planSheet = [Q(0, 0), Q(plan.W, 0), Q(plan.W, plan.D), Q(0, plan.D)];
  const feats = (p.feats || []).slice(0, 4);
  const pulse = (i) => { const t0 = DT + .5 + i * .22; return tw(T, 0, 1, t0, t0 + .3) * tw(T, 1, 0, t0 + .7, t0 + 1.3); };
  const roomHi = (r) => { let v = 0; feats.forEach((f, i) => { if ((r.t === 'balc' && /balc/i.test(f)) || (r.t === 'kit' && /cocina/i.test(f))) v = Math.max(v, pulse(i)); }); return v; };
  const rooms = plan.rooms.map((r, i) => {
    const o = tw(T, 0, 1, PL + 1.5 + i * .12, PL + 1.9 + i * .12), hi = roomHi(r);
    const poly = [Q(r.x, r.z), Q(r.x + r.w, r.z), Q(r.x + r.w, r.z + r.d), Q(r.x, r.z + r.d)];
    return <polygon key={'r' + i} points={pts(poly)} fill={mix(FILL[r.t], '#f7c548', hi * .85)} opacity={o} />;
  });
  const H = 1.25, wallEls = plan.walls.map((w, i) => {
    const t0 = PL + 1.0 + i * .05, pr = tw(T, 0, 1, t0, t0 + .45, MOTION.draw); if (pr <= 0) return null;
    const ex = w[0] + (w[2] - w[0]) * pr, ez = w[1] + (w[3] - w[1]) * pr, a = Q(w[0], w[1]), b = Q(ex, ez);
    const quad = hs > .02 ? <polygon points={pts([a, b, Q(ex, ez, H), Q(w[0], w[1], H)])} fill={C.wall} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" /> : null;
    return <g key={'w' + i}>{quad || <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.ink} strokeWidth="6" strokeLinecap="round" />}</g>;
  });
  const labels = plan.rooms.map((r, i) => {
    const o = tw(T, 0, 1, PL + 1.8 + i * .12, PL + 2.2 + i * .12), c = Q(r.x + r.w / 2, r.z + r.d * (.5 - .18 * pD)), small = r.d * Ss * tilt < 70;
    return <div key={'l' + i} style={{ position: 'absolute', left: c[0], top: c[1], transform: 'translate(-50%,-50%) translateY(' + ((1 - o) * 14).toFixed(1) + 'px)', opacity: o, font: '700 ' + (small ? 24 : 26) + 'px/1.1 ' + HF, color: C.ink, whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>{r.n}</div>;
  });

  // copy
  const area = p.area || 0, m2 = Math.round(area * tw(T, 0, 1, PL + 1.0, PL + 2.3, MOTION.enter));
  const m2Op = tw(T, 0, 1, PL + .9, PL + 1.3) * tw(T, 1, 0, DT - .2, DT + .3);
  const priceN = (p.price || 0) * tw(T, 0, 1, PR + .35, PR + 1.3, MOTION.enter);
  const cardOp = tw(T, 0, 1, PR + .15, PR + .6) * tw(T, 1, 0, FI, FI + .45), cardY = (1 - tw(T, 0, 1, PR + .15, PR + .9, MOTION.enter)) * 50;
  const facts = [area && (p.type === 'Proyecto' ? 'Desde ' : '') + area + ' m²', p.beds && plural(p.beds, 'dormitorio', 'dormitorios'), p.baths && plural(p.baths, 'baño', 'baños')].filter(Boolean);
  const noteOp = tw(T, 0, 1, PL + 1.4, PL + 1.8);
  const chipsOut = tw(T, 1, 0, PR - .1, PR + .4);
  const label = 'Vídeo ' + Math.floor(T) + 's';

  return (
    <div data-screen-label={label} style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden', fontFamily: HF }}>
      <div style={{ position: 'absolute', inset: 0, opacity: cityOp, background: 'radial-gradient(ellipse 60% 70% at 78% 18%, rgba(247,197,72,.16), rgba(247,197,72,0) 62%)' }} />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
        <defs><filter id="aqglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter></defs>
        <g opacity={cityOp}>
          <path d={grid} stroke="rgba(247,197,72,.14)" strokeWidth="1.2" fill="none" />
          {back}
          <polygon points={pts(lot)} fill="none" stroke={C.gold} strokeWidth="2.5" strokeDasharray="10 8" opacity={lotOp * (.5 + .5 * lotPulse)} />
        </g>
        <polygon points={pts(ufc.xf.concat(ufc.zf))} fill="#f7c548" filter="url(#aqglow)" opacity={glowOp} />
        {floors}
        <g opacity={cityOp}>{front}<path d={win.join('')} fill="rgba(247,197,72,.78)" /></g>
        <g opacity={planOp}>
          <polygon points={pts(planSheet)} fill={mix(C.goldL, '#ffffff', a1)} stroke={mix(C.gold, C.goldD, a1)} strokeWidth="2" />
          {rooms}
          {wallEls}
        </g>
      </svg>
      <div style={{ position: 'absolute', inset: 0, opacity: planOp }}>{labels}</div>

      <div style={{ position: 'absolute', left: 140, top: 96, display: 'flex', alignItems: 'center', gap: 16, color: fg }}>
        <img src="assets/aquaterra-icon.svg" alt="" width="52" height="52" />
        <span style={{ font: '800 26px/1 ' + HF, letterSpacing: '.02em' }}>Aquaterra</span>
        <span style={{ font: '700 24px/1 ' + HF, letterSpacing: '.16em', textTransform: 'uppercase', color: day > .5 ? C.goldD : C.goldL }}>Asunción</span>
      </div>
      <div style={{ position: 'absolute', right: 140, top: 104, font: '700 24px/1 ' + HF, letterSpacing: '.12em', textTransform: 'uppercase', color: day > .5 ? C.muted : 'rgba(255,255,255,.7)' }}>Ref. {p.id}</div>

      <div style={{ position: 'absolute', left: 140, top: 330, opacity: m2Op, color: C.ink }}>
        <div style={{ font: '700 26px/1.2 ' + HF, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldD }}>{p.type === 'Proyecto' ? 'Superficie desde' : 'Superficie'}</div>
        <div style={{ font: '800 168px/1 ' + HF, letterSpacing: '-.05em', marginTop: 12, fontVariantNumeric: 'tabular-nums' }}>{m2}<span style={{ fontSize: 64, marginLeft: 10, letterSpacing: 0, color: C.goldD }}>m²</span></div>
      </div>

      <div style={{ position: 'absolute', left: 1240, top: 290, width: 560, display: 'flex', flexDirection: 'column', gap: 22, opacity: chipsOut }}>
        {feats.map((f, i) => { const t0 = DT + .4 + i * .22, o = tw(T, 0, 1, t0, t0 + .25), s = tw(T, .6, 1, t0, t0 + .55, MOTION.pop); return (
          <div key={'c' + i} style={{ display: 'flex', alignItems: 'center', gap: 18, alignSelf: 'flex-start', padding: '18px 30px 18px 18px', borderRadius: 999, background: '#ffffff', boxShadow: '0 14px 40px rgba(22,19,14,.12), inset 0 0 0 1.5px rgba(168,116,15,.25)', opacity: o, transform: 'scale(' + s.toFixed(3) + ')', transformOrigin: '0 50%' }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', background: C.gold, display: 'grid', placeItems: 'center', flex: 'none' }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3a2808" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span>
            <span style={{ font: '700 34px/1.15 ' + HF, color: C.ink, letterSpacing: '-.01em' }}>{f}</span>
          </div>); })}
      </div>

      <div style={{ position: 'absolute', left: 1060, top: 250, width: 720, opacity: cardOp, transform: 'translateY(' + cardY.toFixed(1) + 'px)', color: C.ink }}>
        <div style={{ font: '700 26px/1.2 ' + HF, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldD }}>{p.type} · {z.name}</div>
        <div style={{ font: '800 44px/1.12 ' + HF, letterSpacing: '-.02em', marginTop: 16, textWrap: 'balance' }}>{p.title}</div>
        <div style={{ font: '800 120px/1 ' + HF, letterSpacing: '-.045em', marginTop: 30, fontVariantNumeric: 'tabular-nums' }}><span style={{ fontSize: 44, letterSpacing: 0, marginRight: 14, color: C.goldD }}>{p.priceFrom ? 'Desde USD' : 'USD'}</span>{fmt(priceN)}</div>
        <div style={{ font: '600 30px/1.3 ' + HF, color: C.muted, marginTop: 22 }}>{facts.join(' · ')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 36 }}>
          <span style={{ padding: '14px 26px', borderRadius: 999, background: '#f4e5bb', color: '#5c430d', font: '800 26px/1 ' + HF }}>{p.status}</span>
          <span style={{ padding: '14px 26px', borderRadius: 999, background: C.ink, color: '#ffffff', font: '700 26px/1 ' + HF }}>Escríbenos para visitarlo</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 930, top: 190, width: 860, opacity: tw(T, 0, 1, FI + .3, FI + .7), color: C.ink }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20 }}>
          <span style={{ font: '800 52px/1.05 ' + HF, letterSpacing: '-.025em' }}>Ficha técnica</span>
          <span style={{ font: '800 40px/1 ' + HF, letterSpacing: '-.03em', color: C.goldD, fontVariantNumeric: 'tabular-nums' }}>{(p.priceFrom ? 'Desde USD ' : 'USD ') + fmt(p.price || 0)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 48, marginTop: 30 }}>
          {sheet.map((r, i) => { const t0 = FI + .55 + i * .12, o = tw(T, 0, 1, t0, t0 + .35), y = (1 - tw(T, 0, 1, t0, t0 + .5, MOTION.enter)) * 26; return (
            <div key={'s' + i} style={{ padding: '16px 0 18px', borderBottom: '2px solid rgba(168,116,15,.18)', opacity: o, transform: 'translateY(' + y.toFixed(1) + 'px)' }}>
              <div style={{ font: '700 24px/1.2 ' + HF, color: C.muted }}>{r[0]}</div>
              <div style={{ font: '800 34px/1.15 ' + HF, letterSpacing: '-.015em', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{r[1]}</div>
            </div>); })}
        </div>
      </div>

      <div style={{ position: 'absolute', right: 140, bottom: 70, opacity: noteOp, font: '600 24px/1.3 ' + HF, color: C.muted, textAlign: 'right' }}>Esquema orientativo · no es el plano del inmueble</div>

      <Captions style={{ left: 140, right: 760, bottom: 110, textAlign: 'left', font: '800 56px/1.08 ' + HF, letterSpacing: '-.02em', color: fg, textShadow: day > .5 ? 'none' : '0 2px 24px rgba(0,0,0,.55)', textWrap: 'balance' }} items={[
        { at: .5, until: E + .1, text: 'Asunción · ' + z.name },
        { at: E + .35, until: PL + .2, text: p.title },
        { at: PL + 1.2, until: DT, text: plural(p.beds || 1, 'dormitorio', 'dormitorios') + ' · ' + plural(p.baths || 1, 'baño', 'baños') },
        { at: DT + .25, until: PR, text: 'Lo que incluye' }
      ]} />
    </div>
  );
}

const MODE = (() => { try { const q = new URLSearchParams(location.search); return q.get('scrub') === '1' ? 'scrub' : q.get('embed') === '1' ? 'embed' : ''; } catch (e) { return ''; } })();
const EMBED = MODE === 'embed', SCRUB = MODE === 'scrub';
if (SCRUB) {
  let last = 0;
  const seek = (p) => { const el = document.querySelector('[data-om-exportable-video-with-duration-secs]'); if (!el) return false; const dur = +el.getAttribute('data-om-exportable-video-with-duration-secs') || 0; el.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', { detail: { time: Math.max(0, Math.min(dur - .001, p * dur)), sync: true } })); return true; };
  window.addEventListener('message', (e) => { const d = e.data; if (d && d.type === 'aq-seek') { last = Math.max(0, Math.min(1, +d.p || 0)); seek(last); } });
  const iv = setInterval(() => { if (seek(last)) { clearInterval(iv); try { window.parent.postMessage({ type: 'aq-vid-ready' }, '*'); } catch (e) {} } }, 100);
}
if ((EMBED || SCRUB) && !document.getElementById('aq-embed-css')) { const st = document.createElement('style'); st.id = 'aq-embed-css'; st.textContent = '[data-omelette-chrome]{display:none!important}'; document.head.appendChild(st); }
function AptVideo(props) {
  return (
    <CompositionStage width={1920} height={1080} bg={C.night} scenes={window.OM_SCENES} playback={EMBED ? '{"mode":"loop"}' : window.OM_PLAYBACK}>
      <AptPiece listing={props.listing} />
    </CompositionStage>
  );
}
window.AptVideo = AptVideo;
