// Aquaterra · formato de plano «aq-plano» v1: estándar, validación, análisis de muros/aberturas y plantillas.
export const TIPOS = {
  salon: { l: 'Salón', css: 'var(--color-accent-100)', hex: '#f3e2cf' },
  comedor: { l: 'Comedor', css: 'var(--color-accent-100)', hex: '#f3e2cf' },
  cocina: { l: 'Cocina', css: 'var(--color-accent-2-100)', hex: '#e2e8d6' },
  dormitorio: { l: 'Dormitorio', css: 'var(--color-neutral-200)', hex: '#ece2d2' },
  bano: { l: 'Baño', css: 'var(--color-accent-2-200)', hex: '#d3dcc4' },
  estudio: { l: 'Estudio', css: 'var(--color-neutral-200)', hex: '#ece2d2' },
  pasillo: { l: 'Pasillo', css: 'var(--color-neutral-100)', hex: '#f6efe3' },
  recibidor: { l: 'Recibidor', css: 'var(--color-neutral-100)', hex: '#f6efe3' },
  lavadero: { l: 'Lavadero', css: 'var(--color-accent-2-100)', hex: '#e2e8d6' },
  terraza: { l: 'Terraza', css: 'var(--color-accent-2-300)', hex: '#c6d1b1' },
  garaje: { l: 'Garaje', css: 'var(--color-neutral-300)', hex: '#dcd3c4' }
};
// acabados interiores: suelo y color de paredes (por estancia o para toda la casa)
export const SUELOS = {
  auto: { l: 'Según estancia' }, madera: { l: 'Madera' }, parquet: { l: 'Parquet espiga' }, roble: { l: 'Tablas de roble' }, porcelanato: { l: 'Porcelanato' },
  marmol: { l: 'Mármol' }, terrazo: { l: 'Terrazo' }, cemento: { l: 'Cemento pulido' }, terracota: { l: 'Terracota' }
};
export const COLORES = [['#ebe7e0', 'Blanco roto'], ['#f6f4ef', 'Blanco puro'], ['#e6dccb', 'Arena'], ['#d9d4cc', 'Gris perla'], ['#c9cfc0', 'Salvia'], ['#cfd8de', 'Azul niebla'], ['#e3c6b0', 'Terracota suave'], ['#a9a39a', 'Topo']];
export const MAX_PLANTAS = 4;
const nombrePlanta = n => n === 0 ? 'Planta baja' : 'Planta ' + n;
export { nombrePlanta };

const r2 = v => Math.round(v * 100) / 100;
const snap = v => Math.round(v * 20) / 20;
const num = (v, d) => { const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v; return Number.isFinite(n) ? n : d; };
const fmt = v => String(r2(v)).replace('.', ',');
const ins = r => !!r && r.tipo !== 'terraza';

export function normalize(raw) {
  const errors = [], warnings = [];
  let p = raw;
  if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { return { errors: ['El archivo no es un JSON válido.'], warnings, plan: null, stats: null }; } }
  if (!p || typeof p !== 'object') return { errors: ['Plano vacío.'], warnings, plan: null, stats: null };
  if (p.formato !== 'aq-plano') warnings.push('Falta "formato": "aq-plano"; se interpreta igualmente.');
  if (p.unidad && p.unidad !== 'm') errors.push('Las medidas deben ir en metros ("unidad": "m").');
  const H = r2(Math.min(4.5, Math.max(2.2, num(p.alturaLibre, 2.7))));
  const list = Array.isArray(p.estancias) ? p.estancias : [];
  if (!list.length) errors.push('No hay estancias: añade al menos una en "estancias".');
  if (list.length > 40) errors.push('Máximo 40 estancias por planta.');
  const ids = new Set();
  const rooms = list.slice(0, 40).map((e, i) => {
    e = e || {};
    let tipo = String(e.tipo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!TIPOS[tipo]) { warnings.push(`Estancia ${i + 1}: tipo «${e.tipo || '—'}» desconocido; se trata como salón.`); tipo = 'salon'; }
    const nombre = String(e.nombre || TIPOS[tipo].l).slice(0, 40);
    let id = String(e.id || tipo + (i + 1)).replace(/[^\w-]/g, '').slice(0, 30) || 'e' + (i + 1);
    while (ids.has(id)) id += '_';
    ids.add(id);
    const x = snap(num(e.x, NaN)), y = snap(num(e.y, NaN)), w = snap(num(e.ancho ?? e.w, NaN)), d = snap(num(e.fondo ?? e.d, NaN));
    if (![x, y, w, d].every(Number.isFinite)) errors.push(`«${nombre}»: faltan x, y, ancho o fondo.`);
    else if (w < 1.2 || d < 1.2) errors.push(`«${nombre}»: mínimo 1,2 × 1,2 m.`);
    else if (w > 30 || d > 30) errors.push(`«${nombre}»: máximo 30 m por lado.`);
    const planta = Math.max(0, Math.min(MAX_PLANTAS - 1, Math.round(num(e.planta, 0)) || 0));
    // en plantas altas la doble altura y las alturas propias se limitan a la altura general (la losa de arriba manda)
    const dbl = !!e.dobleAltura && tipo !== 'terraza';
    let alt = num(e.altura, 0); alt = alt > 0 ? r2(Math.min(9, Math.max(2.2, alt))) : 0;
    const suelo = SUELOS[e.suelo] && e.suelo !== 'auto' ? e.suelo : '', colorPared = /^#[0-9a-f]{6}$/i.test(e.colorPared || '') ? e.colorPared.toLowerCase() : '';
    return { id, nombre, tipo, planta, x: x || 0, y: y || 0, w: w || 0, d: d || 0, dbl, alt, suelo, colorPared, h: tipo === 'terraza' ? 0 : (dbl ? Math.max(alt, r2(H * 2)) : (alt || H)) };
  });
  for (let i = 0; i < rooms.length; i++) for (let j = i + 1; j < rooms.length; j++) {
    const a = rooms[i], b = rooms[j]; if (a.planta !== b.planta) continue;
    const ov = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y));
    if (ov > 0.05) errors.push(`«${a.nombre}» y «${b.nombre}» se solapan ${fmt(ov)} m².`);
  }
  if (rooms.length) {
    const xs = rooms.flatMap(r => [r.x, r.x + r.w]), ys = rooms.flatMap(r => [r.y, r.y + r.d]);
    if (Math.max(...xs) - Math.min(...xs) > 60 || Math.max(...ys) - Math.min(...ys) > 60) errors.push('La planta supera 60 m de lado.');
    if (!rooms.some(r => r.tipo === 'bano')) warnings.push('No hay ningún baño.');
  }
  const nPl = rooms.length ? Math.max(...rooms.map(r => r.planta)) + 1 : 1;
  for (let k = 1; k < nPl; k++) if (!rooms.some(r => r.planta === k)) errors.push(`${nombrePlanta(k)} está vacía: dibuja al menos una estancia o borra la planta.`);
  // escaleras: un rectángulo en una planta que sube a la siguiente. Hacia dónde sube: N, S, E u O
  const stairs = (Array.isArray(p.escaleras) ? p.escaleras : []).slice(0, 8).map((e, i) => {
    e = e || {};
    const x = snap(num(e.x, NaN)), y = snap(num(e.y, NaN)), w = snap(num(e.ancho ?? e.w, NaN)), d = snap(num(e.fondo ?? e.d, NaN)), planta = Math.max(0, Math.round(num(e.planta, 0)) || 0);
    let sube = String(e.sube || '').toUpperCase(); if (!['N', 'S', 'E', 'O'].includes(sube)) sube = w >= d ? 'E' : 'S';
    return { id: String(e.id || 'esc' + (i + 1)).replace(/[^\w-]/g, '').slice(0, 30) || 'esc' + (i + 1), planta, x, y, w, d, sube };
  }).filter((s, i) => {
    const n = `Escalera ${i + 1}`;
    if (![s.x, s.y, s.w, s.d].every(Number.isFinite)) { errors.push(`${n}: faltan x, y, ancho o fondo.`); return false; }
    if (Math.min(s.w, s.d) < 0.8 || Math.max(s.w, s.d) < 2) { errors.push(`${n}: mínimo 0,8 m de ancho y 2 m de largo.`); return false; }
    if (s.planta >= nPl - 1) { warnings.push(`${n} está en la planta más alta: no lleva a ninguna parte. Añade una planta encima o bórrala.`); return false; }
    const cx = s.x + s.w / 2, cy = s.y + s.d / 2, inR = k => rooms.some(r => r.planta === k && r.tipo !== 'terraza' && cx > r.x && cx < r.x + r.w && cy > r.y && cy < r.y + r.d);
    if (!inR(s.planta)) warnings.push(`${n}: no está dentro de ninguna estancia de ${nombrePlanta(s.planta).toLowerCase()}.`);
    if (!inR(s.planta + 1)) warnings.push(`${n}: encima no hay ninguna estancia de ${nombrePlanta(s.planta + 1).toLowerCase()} para llegar.`);
    return true;
  });
  if (nPl > 1 && !stairs.length) warnings.push('Hay varias plantas pero ninguna escalera: añádela con la herramienta «Escalera».');
  const area = rooms.filter(ins).reduce((s, r) => s + r.w * r.d, 0), terr = rooms.filter(r => r.tipo === 'terraza').reduce((s, r) => s + r.w * r.d, 0);
  return { errors, warnings, plan: errors.length ? null : { nombre: String(p.nombre || 'Mi plano').slice(0, 60), H, rooms, stairs, plantas: nPl, suelo: SUELOS[p.suelo] ? p.suelo : 'auto', colorPared: /^#[0-9a-f]{6}$/i.test(p.colorPared || '') ? p.colorPared.toLowerCase() : '' }, stats: { n: rooms.length, area: r2(area), terraza: r2(terr), dbl: rooms.some(r => r.dbl), plantas: nPl, escaleras: stairs.length, garajes: rooms.filter(r => r.tipo === 'garaje').length } };
}

const HUB = ['salon', 'comedor', 'pasillo', 'recibidor'];
const OPEN = ['cocina|comedor', 'cocina|salon', 'comedor|salon'];
const PREF = {
  cocina: ['pasillo', 'recibidor', 'comedor', 'salon'],
  dormitorio: ['pasillo', 'recibidor', 'salon', 'comedor', 'estudio'],
  estudio: ['pasillo', 'recibidor', 'salon', 'comedor'],
  lavadero: ['cocina', 'pasillo', 'recibidor', 'comedor', 'salon'],
  bano: ['pasillo', 'recibidor', 'dormitorio', 'salon', 'comedor'],
  garaje: ['lavadero', 'cocina', 'pasillo', 'recibidor', 'comedor', 'salon', 'estudio']
};

// Muros, puertas, ventanas y conexiones generados automáticamente a partir de estancias rectangulares.
// level: planta a analizar (cada planta tiene sus propios muros). Sin level: planta baja.
export function analyze(plan, level = 0) {
  const all = plan.rooms, rooms = all.filter(r => (r.planta || 0) === level), warnings = [];
  const stairsUp = (plan.stairs || []).filter(s => s.planta === level), stairsDown = (plan.stairs || []).filter(s => s.planta === level - 1);
  const lines = new Map();
  const add = (o, c, a, b, r, side) => { const k = o + r2(c); if (!lines.has(k)) lines.set(k, { o, c: r2(c), it: [] }); lines.get(k).it.push({ a: r2(a), b: r2(b), r, side }); };
  rooms.forEach(r => { add('h', r.y, r.x, r.x + r.w, r, 1); add('h', r.y + r.d, r.x, r.x + r.w, r, -1); add('v', r.x, r.y, r.y + r.d, r, 1); add('v', r.x + r.w, r.y, r.y + r.d, r, -1); });
  const segs = [], rails = [];
  lines.forEach(L => {
    const pts = [...new Set(L.it.flatMap(i => [i.a, i.b]))].sort((a, b) => a - b);
    let cur = null;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1], m = (p + q) / 2;
      const f = s => (L.it.find(t => t.side === s && t.a < m && t.b > m) || {}).r || null;
      const pos = f(1), neg = f(-1);
      if (!ins(pos) && !ins(neg)) { if ((pos || neg) && !(pos && neg)) rails.push({ o: L.o, c: L.c, a: p, b: q }); cur = null; continue; }
      if (cur && cur.pos === pos && cur.neg === neg && Math.abs(cur.b - p) < 1e-6) { cur.b = q; continue; }
      cur = { o: L.o, c: L.c, a: p, b: q, pos, neg, ops: [] };
      segs.push(cur);
    }
  });
  segs.forEach(s => { s.ext = !ins(s.pos) || !ins(s.neg); s.t = s.ext ? 0.24 : 0.12; s.h = Math.max(ins(s.pos) ? s.pos.h : 0, ins(s.neg) ? s.neg.h : 0); s.len = r2(s.b - s.a); });

  const ops = [], edges = [], adj = new Map(rooms.map(r => [r.id, []]));
  const opAt = (s, kind, w, bot, top, center) => {
    const m = center ?? (s.a + s.b) / 2;
    const o = { kind, s: r2(m - w / 2), e: r2(m + w / 2), w, bot, top, seg: s, mid: m, x: s.o === 'h' ? m : s.c, y: s.o === 'h' ? s.c : m };
    s.ops.push(o); ops.push(o); return o;
  };
  const link = (s, kind) => {
    const A = s.pos, B = s.neg, len = s.len;
    let o;
    if (kind === 'open') o = opAt(s, 'open', len - 0.14, 0, Math.min(A.h, B.h));
    else if (kind === 'slide') { const I = ins(A) ? A : B; o = opAt(s, 'slide', Math.max(0.9, Math.min(len - 0.6, I.dbl ? 4.5 : 3)), 0, I.dbl ? Math.min(I.h - 0.5, 4.6) : 2.3); }
    else o = opAt(s, 'door', (A.tipo === 'bano' || B.tipo === 'bano') ? 0.8 : 0.9, 0, 2.1);
    o.rooms = [A, B]; edges.push(o);
    adj.get(A.id).push({ to: B, o }); adj.get(B.id).push({ to: A, o });
    return o;
  };
  const pk = (A, B) => [A.id, B.id].sort().join('|'), tk = (A, B) => [A.tipo, B.tipo].sort().join('|');
  const pairs = new Map();
  segs.forEach(s => { if (!s.pos || !s.neg) return; const k = pk(s.pos, s.neg), c = pairs.get(k); if (!c || s.len > c.len) pairs.set(k, s); });
  const linked = new Set();
  pairs.forEach((s, k) => {
    const A = s.pos, B = s.neg;
    if (A.tipo === 'terraza' || B.tipo === 'terraza') { if (s.len >= 1.4) { link(s, 'slide'); linked.add(k); } return; }
    if (OPEN.includes(tk(A, B)) && s.len >= 1.2) { link(s, 'open'); linked.add(k); }
  });
  pairs.forEach((s, k) => { if (!linked.has(k) && HUB.includes(s.pos.tipo) && HUB.includes(s.neg.tipo) && s.len >= 1) { link(s, 'door'); linked.add(k); } });
  ['cocina', 'dormitorio', 'estudio', 'lavadero', 'bano', 'garaje'].forEach(t => rooms.filter(R => R.tipo === t).forEach(R => {
    if (adj.get(R.id).some(a => HUB.includes(a.to.tipo) || a.o.kind === 'open')) return;
    for (const want of PREF[t]) {
      let best = null;
      pairs.forEach((s, k) => { if (linked.has(k) || s.len < 1) return; const O = s.pos === R ? s.neg : s.neg === R ? s.pos : null; if (O && O.tipo === want && (!best || s.len > best.len)) best = s; });
      if (best) { link(best, 'door'); linked.add(pk(best.pos, best.neg)); break; }
    }
  }));

  let entry = null;
  for (const t of ['recibidor', 'pasillo', 'salon', 'comedor', 'cocina', 'estudio', 'dormitorio']) {
    const c = segs.filter(s => s.ext && !(s.pos && s.neg) && s.len >= 1.3 && (s.pos || s.neg).tipo === t).sort((a, b) => b.len - a.len)[0];
    if (level > 0) break;
    if (c) { const R = c.pos || c.neg; entry = opAt(c, 'entry', 1, 0, 2.2, c.len >= 3.4 ? c.a + 1.05 : null); entry.rooms = [R]; entry.room = R; break; }
  }
  if (!entry && level === 0 && rooms.some(r => ins(r) && r.tipo !== 'garaje')) warnings.push('No se encontró un muro exterior para la puerta de entrada.');
  // garaje: portón seccional en su muro exterior más largo
  const garages = [];
  rooms.filter(R => R.tipo === 'garaje').forEach(R => {
    const c = segs.filter(s => s.ext && !(s.pos && s.neg) && (s.pos || s.neg) === R && s.len >= 2.6).sort((a, b) => b.len - a.len)[0];
    if (!c) { warnings.push(`«${R.nombre}»: necesita un muro exterior de al menos 2,6 m para el portón.`); return; }
    const w = r2(Math.min(c.len - 0.5, c.len >= 6.2 ? 5 : 2.8)), o = opAt(c, 'garage', w, 0, Math.min(2.25, R.h - 0.2)); o.rooms = [R]; o.room = R; garages.push(o);
  });

  const reach = () => {
    const top = level > 0 && stairsDown.length ? rooms.find(r => { const s = stairsDown[0], x = s.x + s.w / 2, y = s.y + s.d / 2; return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.d; }) : null;
    const start = entry ? entry.room : (top || rooms.find(r => ins(r) && r.tipo !== 'garaje') || rooms.find(ins)), seen = new Set();
    if (!start) return seen;
    const q = [start]; seen.add(start.id);
    while (q.length) { const R = q.shift(); adj.get(R.id).forEach(a => { if (!seen.has(a.to.id)) { seen.add(a.to.id); q.push(a.to); } }); }
    return seen;
  };
  for (let g = 0; g < 40; g++) {
    const seen = reach(), miss = rooms.filter(r => !seen.has(r.id));
    if (!miss.length) break;
    const s = [...pairs.values()].sort((a, b) => b.len - a.len).find(s => !linked.has(pk(s.pos, s.neg)) && s.len >= 1 && seen.has(s.pos.id) !== seen.has(s.neg.id));
    if (!s) { warnings.push('Sin acceso a: ' + miss.map(r => '«' + r.nombre + '»').join(', ') + '.'); break; }
    link(s, s.pos.tipo === 'terraza' || s.neg.tipo === 'terraza' ? 'slide' : 'door'); linked.add(pk(s.pos, s.neg));
  }

  const WIN = (R, len) => {
    const t = R.tipo;
    if (t === 'salon') return R.dbl ? { w: Math.min(len - 0.8, 6), bot: 0.05, top: R.h - 0.45 } : { w: Math.min(len * 0.6, 3.2), bot: 0.45, top: 2.3 };
    if (t === 'comedor' || t === 'estudio' || t === 'dormitorio') return { w: Math.min(len * 0.5, 2.4), bot: 0.9, top: 2.2 };
    if (t === 'cocina') return { w: Math.min(len * 0.4, 1.6), bot: 1.05, top: 2.15 };
    if (t === 'bano' || t === 'lavadero') return { w: 0.6, bot: 1.6, top: 2.15 };
    if (t === 'garaje') return len >= 3 ? { w: 1.0, bot: 1.6, top: 2.15 } : null;
    return len >= 3 ? { w: 0.8, bot: 0.9, top: 2.2 } : null;
  };
  const nWin = new Map();
  segs.filter(s => s.ext && !(s.pos && s.neg) && s.len >= 1.4).sort((a, b) => b.len - a.len).forEach(s => {
    const R = s.pos || s.neg, n = nWin.get(R.id) || 0;
    if (R.tipo !== 'salon' && n >= 2) return;
    const spec = WIN(R, s.len); if (!spec) return;
    let lo = s.a + 0.3, hi = s.b - 0.3;
    s.ops.forEach(o => { if (o.mid < (s.a + s.b) / 2) lo = Math.max(lo, o.e + 0.35); else hi = Math.min(hi, o.s - 0.35); });
    const w = Math.min(spec.w, hi - lo); if (w < 0.5) return;
    opAt(s, 'window', r2(w), spec.bot, spec.top, (lo + hi) / 2); nWin.set(R.id, n + 1);
  });

  const src = all.length ? all : rooms, xs = src.flatMap(r => [r.x, r.x + r.w]), ys = src.flatMap(r => [r.y, r.y + r.d]);
  return { level, rooms, segs, rails, ops, edges, adj, entry, garages, stairsUp, stairsDown, warnings: level > 0 ? warnings.map(w => nombrePlanta(level) + ': ' + w) : warnings, bounds: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) } };
}

// todas las plantas: un análisis por planta
export function analyzeAll(plan) { const n = plan.plantas || 1, out = []; for (let k = 0; k < n; k++) out.push(analyze(plan, k)); return out; }

export function toFile(nombre, rooms, alturaLibre, escaleras, acabados) {
  const f = { formato: 'aq-plano', version: 1, unidad: 'm', nombre: nombre || 'Mi plano', alturaLibre: alturaLibre || 2.7, estancias: rooms.map(r => Object.assign({ id: r.id, nombre: r.nombre, tipo: r.tipo, x: r.x, y: r.y, ancho: r.ancho, fondo: r.fondo, dobleAltura: !!r.dobleAltura }, r.planta ? { planta: r.planta } : {}, r.altura ? { altura: r.altura } : {}, r.suelo && r.suelo !== 'auto' ? { suelo: r.suelo } : {}, r.colorPared ? { colorPared: r.colorPared } : {})) };
  if (escaleras && escaleras.length) f.escaleras = escaleras.map(s => ({ id: s.id, planta: s.planta || 0, x: s.x, y: s.y, ancho: s.ancho, fondo: s.fondo, sube: s.sube }));
  if (acabados && acabados.suelo && acabados.suelo !== 'auto') f.suelo = acabados.suelo;
  if (acabados && acabados.colorPared) f.colorPared = acabados.colorPared;
  return f;
}

const E = (id, nombre, tipo, x, y, ancho, fondo, dobleAltura) => ({ id, nombre, tipo, x, y, ancho, fondo, dobleAltura: !!dobleAltura });
const P = (e, planta) => Object.assign(e, { planta });
export const PLANTILLAS = [
  { id: 'familiar', nombre: 'Casa familiar con doble altura', sub: '3 dormitorios · salón de 5,4 m de altura · terraza', estancias: [
    E('dorm1', 'Dormitorio principal', 'dormitorio', 0, 0, 4.5, 4), E('bano1', 'Baño', 'bano', 4.5, 0, 2.5, 4), E('dorm2', 'Dormitorio 2', 'dormitorio', 7, 0, 3.5, 4), E('dorm3', 'Dormitorio 3', 'dormitorio', 10.5, 0, 3.5, 4),
    E('pasillo', 'Pasillo', 'pasillo', 0, 4, 14, 1.5), E('recibidor', 'Recibidor', 'recibidor', 0, 5.5, 3, 5.5), E('salon', 'Salón', 'salon', 3, 5.5, 6, 5.5, true),
    E('cocina', 'Cocina', 'cocina', 9, 5.5, 5, 2.75), E('comedor', 'Comedor', 'comedor', 9, 8.25, 5, 2.75), E('terraza', 'Terraza', 'terraza', 3, 11, 6, 2.5)] },
  { id: 'depto', nombre: 'Departamento de 2 dormitorios', sub: 'Salón con balcón · cocina con lavadero', estancias: [
    E('dorm1', 'Dormitorio principal', 'dormitorio', 0, 0, 3.5, 4), E('bano', 'Baño', 'bano', 3.5, 0, 2.5, 2.5), E('pasillo', 'Pasillo', 'pasillo', 3.5, 2.5, 2.5, 1.5), E('dorm2', 'Dormitorio 2', 'dormitorio', 6, 0, 4, 4),
    E('salon', 'Salón comedor', 'salon', 0, 4, 6.5, 5), E('cocina', 'Cocina', 'cocina', 6.5, 4, 3.5, 3), E('lavadero', 'Lavadero', 'lavadero', 6.5, 7, 3.5, 2), E('balcon', 'Balcón', 'terraza', 0, 9, 6.5, 2)] },
  { id: 'loft', nombre: 'Loft con doble altura', sub: '1 dormitorio · estudio · salón abierto de 5,4 m', estancias: [
    E('salon', 'Salón', 'salon', 0, 0, 8, 6, true), E('cocina', 'Cocina', 'cocina', 8, 0, 3, 4), E('bano', 'Baño', 'bano', 8, 4, 3, 2),
    E('dorm', 'Dormitorio', 'dormitorio', 0, 6, 5.5, 4), E('estudio', 'Estudio', 'estudio', 5.5, 6, 5.5, 4)] },
  { id: 'duplex', nombre: 'Dúplex con garaje', sub: '2 plantas · escalera en el salón · garaje · 3 dormitorios', estancias: [
    E('garaje', 'Garaje', 'garaje', 0, 0, 3.5, 6), E('recibidor', 'Recibidor', 'recibidor', 3.5, 0, 3, 6), E('salon', 'Salón', 'salon', 6.5, 0, 6, 6),
    E('bano', 'Aseo', 'bano', 3.5, 6, 3, 3.5), E('cocina', 'Cocina', 'cocina', 6.5, 6, 3, 3.5), E('comedor', 'Comedor', 'comedor', 9.5, 6, 3, 3.5), E('terraza', 'Terraza', 'terraza', 6.5, 9.5, 6, 2),
    P(E('pasillo1', 'Distribuidor', 'pasillo', 3.5, 0, 9, 2.2), 1), P(E('balcon', 'Terraza alta', 'terraza', 0, 0, 3.5, 4), 1), P(E('dorm1', 'Dormitorio principal', 'dormitorio', 3.5, 2.2, 4, 4.3), 1),
    P(E('bano2', 'Baño', 'bano', 7.5, 2.2, 2.2, 4.3), 1), P(E('dorm2', 'Dormitorio 2', 'dormitorio', 9.7, 2.2, 2.8, 4.3), 1)],
    escaleras: [{ id: 'esc1', planta: 0, x: 7, y: 0.2, ancho: 4.2, fondo: 1.0, sube: 'E' }] }
];
