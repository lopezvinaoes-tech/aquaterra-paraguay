/* Aquaterra · capa 3D: inclinación de tarjetas, revelado en profundidad, transiciones de página
   y escenas three.js (ciudad nocturna en cabeceras oscuras, mapa de Paraguay en el pie). */
(function () {
  if (window.AQ3D) return;
  var THREE_URL = 'https://unpkg.com/three@0.184.0/build/three.module.js';
  var GEO = ['https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json', 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'];
  var ZC = { asuncion: [-25.2637, -57.5759] };
  var CLH = {};
  var mq = function (q) { try { return matchMedia(q).matches; } catch (e) { return false; } };
  var reduce = mq('(prefers-reduced-motion: reduce)'), fine = mq('(hover: hover) and (pointer: fine)');
  var c0 = window.__AQ3D_CFG || {};
  var A = window.AQ3D = { on: c0.on !== false, k: c0.k || 1, set: set };
  var cl = function (x, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, x)); };
  var ease = function (x) { return 1 - Math.pow(1 - x, 3); };
  var bounce = function (x) { var n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
  var T = null, Tp = null, geoP = null, scenes = [], stages = [], cur = null, ptr = { x: .5, y: .5 };

  var css = '[data-aq-tilt]{transform:perspective(1000px) rotateX(var(--aq-rx,0deg)) rotateY(var(--aq-ry,0deg)) translateZ(var(--aq-tz,0px));transition:transform .6s cubic-bezier(.2,.8,.2,1)}' +
    '[data-aq-tilt][data-aq-on]{transform:perspective(1000px) rotateX(var(--aq-rx,0deg)) rotateY(var(--aq-ry,0deg)) translateZ(var(--aq-tz,0px))!important;transition:transform .14s linear,box-shadow .3s ease!important;z-index:3}' +
    '[data-aq-tilt][data-aq-pos]{position:relative}' +
    '[data-aq-tilt]::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:6;background:radial-gradient(circle at var(--aq-gx,50%) var(--aq-gy,0%),rgba(255,246,220,.6),rgba(255,246,220,0) 58%);opacity:0;transition:opacity .4s ease;mix-blend-mode:soft-light}' +
    '[data-aq-tilt][data-aq-on]::after{opacity:1}' +
    '[data-aq-rv="wait"]{opacity:0}' +
    '[data-aq3d-host]{position:relative;isolation:isolate}' +
    '[data-aq3d-layer]{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden}' +
    '[data-aq-lbl]{transition:background .2s ease,color .2s ease,opacity .5s ease}' +
    '[data-aq-lbl]:hover{background:var(--color-gold-light)!important;color:#3a2808!important}' +
    '[data-aq-lbl]:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}' +
    '@media print{[data-aq-rv]{opacity:1!important}[data-aq3d-layer]{display:none!important}}';
  var st = document.createElement('style'); st.id = 'aq3d-css'; st.textContent = css; document.head.appendChild(st);

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function area(r) { var s = 0; for (var i = 0, n = r.length; i < n; i++) { var p = r[i], q = r[(i + 1) % n]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; }
  function path() { return (location.hash || '#/').split('?')[0]; }
  function three() { return Tp || (Tp = import(THREE_URL).then(function (m) { T = m; return m; })); }
  function whenNear(el, fn, fail) {
    var go = function () { three().then(fn).catch(function (e) { console.warn('[AQ3D]', e); if (fail) fail(e); }); };
    if (!('IntersectionObserver' in window)) return go();
    var o = new IntersectionObserver(function (es) { if (!es.some(function (e) { return e.isIntersecting; })) return; o.disconnect(); go(); }, { rootMargin: '400px 0px' });
    o.observe(el);
  }

  /* ---------- inclinación de tarjetas ---------- */
  function tiltCand(t) {
    if (!A.on || !fine || reduce || !t || !t.closest) return null;
    var el = t.closest('main article, main .card, [data-aq-tiltable]');
    if (!el || el.closest('[data-wcard],[data-card],[data-aq3d-stage]') || el.style.transform) return null;
    var r = el.getBoundingClientRect(); if (r.width > 760 || r.height > 900) return null;
    return el;
  }
  function untilt(el) { if (!el) return; el.removeAttribute('data-aq-on'); ['--aq-rx', '--aq-ry'].forEach(function (p) { el.style.setProperty(p, '0deg'); }); el.style.setProperty('--aq-tz', '0px'); }
  document.addEventListener('pointermove', function (e) {
    ptr.x = e.clientX / (innerWidth || 1); ptr.y = e.clientY / (innerHeight || 1);
    if (e.pointerType && e.pointerType !== 'mouse') return;
    var el = tiltCand(e.target);
    if (el !== cur) { untilt(cur); cur = el; if (el) { el.setAttribute('data-aq-tilt', ''); if (getComputedStyle(el).position === 'static') el.setAttribute('data-aq-pos', ''); el.setAttribute('data-aq-on', ''); } }
    if (!el) return;
    var r = el.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5, k = A.k;
    el.style.setProperty('--aq-rx', (-ny * 10 * k).toFixed(2) + 'deg'); el.style.setProperty('--aq-ry', (nx * 12 * k).toFixed(2) + 'deg');
    el.style.setProperty('--aq-tz', (16 * k).toFixed(1) + 'px');
    el.style.setProperty('--aq-gx', ((nx + .5) * 100).toFixed(1) + '%'); el.style.setProperty('--aq-gy', ((ny + .5) * 100).toFixed(1) + '%');
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { untilt(cur); cur = null; });
  document.addEventListener('pointerover', function (e) {
    if (!A.on || reduce || !e.target || !e.target.closest) return;
    var img = e.target.closest('a[href="#/"] img'); if (!img || img._spin || !img.animate) return; img._spin = 1;
    var an = img.animate([{ transform: 'perspective(400px) rotateY(0deg)' }, { transform: 'perspective(400px) rotateY(360deg)' }], { duration: 1000, easing: 'cubic-bezier(.3,.7,.2,1)' });
    an.onfinish = an.oncancel = function () { img._spin = 0; };
  });

  /* ---------- revelado en profundidad ---------- */
  var REV = 'main article, main .card, main details, main table, main figure, footer nav, footer h2';
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    var n = 0;
    es.forEach(function (en) {
      if (!en.isIntersecting) return; var el = en.target; io.unobserve(el);
      if (el.getAttribute('data-aq-rv') !== 'wait') return; el.setAttribute('data-aq-rv', 'done');
      if (!A.on || reduce || !el.animate) return; var k = A.k;
      el.animate([{ opacity: 0, transform: 'perspective(1100px) translate3d(0,' + (56 * k).toFixed(0) + 'px,' + (-150 * k).toFixed(0) + 'px) rotateX(' + (18 * k).toFixed(1) + 'deg)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: (n++) * 90, easing: 'cubic-bezier(.16,.84,.24,1)', fill: 'backwards' });
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 }) : null;

  function scan() {
    document.querySelectorAll('[data-aq3d-chart]').forEach(mountChart);
    if (!A.on) return;
    var vh = innerHeight || 800;
    document.querySelectorAll(REV).forEach(function (el) {
      if (el.hasAttribute('data-aq-rv')) return;
      if (!io || el.closest('[data-wcard],[data-card],[data-aq3d-stage],[aria-label="Portada"]') || el.style.transform || (el.parentElement && el.parentElement.closest('[data-aq-rv="wait"]'))) { el.setAttribute('data-aq-rv', 'skip'); return; }
      var r = el.getBoundingClientRect();
      if (r.height > 0 && r.top > vh * .96) { el.setAttribute('data-aq-rv', 'wait'); io.observe(el); } else el.setAttribute('data-aq-rv', 'done');
    });
    document.querySelectorAll('[data-aq3d="ciudad"]').forEach(mountCity);
    document.querySelectorAll('[data-aq3d-map]').forEach(mountMap);
    document.querySelectorAll('[data-aq3d-stage]').forEach(function (s) { if (stages.indexOf(s) < 0) stages.push(s); });
  }

  /* ---------- transición de página ---------- */
  var lastPath = path();
  addEventListener('hashchange', function () {
    var p = path(); if (p === lastPath) return; lastPath = p; if (!A.on || reduce) return;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      document.querySelectorAll('#aq-main [data-screen-label]').forEach(function (el) {
        if (!el.animate) return; var o = '50% ' + Math.round((innerHeight || 800) * .45) + 'px', k = A.k;
        el.animate([{ opacity: 0, transformOrigin: o, transform: 'perspective(1800px) translate3d(0,' + (30 * k) + 'px,' + (-240 * k) + 'px) rotateX(' + (6 * k) + 'deg)' }, { opacity: 1, transformOrigin: o, transform: 'none' }], { duration: 760, easing: 'cubic-bezier(.16,.84,.24,1)' });
      });
    }); });
  });

  /* ---------- escenario inclinable (anillo del blog) ---------- */
  function tickStages(t) {
    for (var i = stages.length - 1; i >= 0; i--) {
      var s = stages[i]; if (!s.isConnected) { stages.splice(i, 1); continue; }
      if (!A.on) { if (s.style.transform) s.style.transform = ''; s._rx = null; continue; }
      var r = s.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue;
      var k = A.k, gx = 9 * k + (fine ? (ptr.y - .5) * 9 * k : Math.sin(t * .6) * 1.6 * k), gy = fine ? (ptr.x - .5) * 14 * k : Math.sin(t * .45) * 5 * k;
      if (reduce) { gx = 8 * k; gy = 0; }
      s._rx = s._rx == null ? gx : s._rx + (gx - s._rx) * .07; s._ry = s._ry == null ? gy : s._ry + (gy - s._ry) * .07;
      s.style.transform = 'perspective(1500px) rotateX(' + s._rx.toFixed(2) + 'deg) rotateY(' + s._ry.toFixed(2) + 'deg)';
    }
  }

  /* ---------- infraestructura de escenas ---------- */
  function renderer(parent, dpr, tone) {
    var R = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr)); R.setClearColor(0x000000, 0);
    R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = tone ? T.ACESFilmicToneMapping : T.NoToneMapping;
    var cv = R.domElement; cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    parent.appendChild(cv); return R;
  }
  function fit(R, cam, el) {
    var w = el.clientWidth, h = el.clientHeight; if (!w || !h) return 0;
    if (R._w !== w || R._h !== h) { R._w = w; R._h = h; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); return 2; }
    return 1;
  }
  function addScene(host, R, S, frame, extra) {
    var s = { host: host, R: R, S: S, frame: frame, vis: true };
    var o = new IntersectionObserver(function (es) { s.vis = es[es.length - 1].isIntersecting; }, { rootMargin: '120px 0px' }); o.observe(host);
    s.dispose = function () {
      o.disconnect();
      try { S.traverse(function (x) { if (x.geometry) x.geometry.dispose(); var m = x.material; if (m) (Array.isArray(m) ? m : [m]).forEach(function (mm) { for (var key in mm) if (mm[key] && mm[key].isTexture) mm[key].dispose(); mm.dispose(); }); }); if (S.environment) S.environment.dispose(); R.dispose(); if (R.forceContextLoss) R.forceContextLoss(); } catch (e) {}
      var cv = R.domElement; if (cv.parentNode) cv.parentNode.removeChild(cv); if (extra) extra();
    };
    scenes.push(s); return s;
  }

  /* ---------- ciudad nocturna (cabeceras oscuras) ---------- */
  function mountCity(host) {
    if (host._aq || !A.on) return; host._aq = 1;
    whenNear(host, function () { if (!host.isConnected || !A.on) { host._aq = 0; return; } try { buildCity(host); } catch (e) { console.warn('[AQ3D] ciudad', e); } });
  }
  function maskCity(lay, wide) {
    var m = wide ? 'linear-gradient(90deg,transparent 4%,rgba(0,0,0,.5) 34%,#000 60%)' : 'linear-gradient(180deg,rgba(0,0,0,.22) 0%,rgba(0,0,0,.55) 100%)';
    lay.style.webkitMaskImage = m; lay.style.maskImage = m;
  }
  function buildCity(host) {
    host.setAttribute('data-aq3d-host', '');
    var lay = document.createElement('div'); lay.setAttribute('data-aq3d-layer', ''); lay.setAttribute('aria-hidden', 'true'); lay.setAttribute('data-noprint', '');
    host.appendChild(lay);
    var R = renderer(lay, 1.5, false), rnd = rng(hash(path()) + 7);
    var S = new T.Scene(), BG = new T.Color(0x050403); S.fog = new T.FogExp2(BG, 0.0068);
    var cam = new T.PerspectiveCamera(34, 1, 1, 1400);
    S.add(new T.HemisphereLight(0xa08c66, 0x050403, 1.2));
    var dl = new T.DirectionalLight(0xc6d2ff, 1.0); dl.position.set(-60, 90, 40); S.add(dl);
    var city = new T.Group(); S.add(city);

    var wc = document.createElement('canvas'); wc.width = wc.height = 512; var g = wc.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512);
    for (var yy = 0; yy < 16; yy++) for (var xx = 0; xx < 16; xx++) {
      var lit = rnd() < .3;
      g.fillStyle = lit ? 'rgba(255,' + (186 + rnd() * 50 | 0) + ',' + (90 + rnd() * 70 | 0) + ',' + (.45 + rnd() * .55).toFixed(2) + ')' : 'rgba(255,214,140,' + (rnd() * .07).toFixed(3) + ')';
      g.fillRect(xx * 32 + 8, yy * 32 + 9, 17, 14);
    }
    var win = new T.CanvasTexture(wc); win.wrapS = win.wrapT = T.RepeatWrapping; win.colorSpace = T.SRGBColorSpace; win.anisotropy = 4;

    var P = [], N = [], U = [], E = [], HE = [];
    function quad(a, b, c, d, n, u0, v0, u1, v1) {
      P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2]);
      for (var i = 0; i < 6; i++) N.push(n[0], n[1], n[2]);
      U.push(u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1);
    }
    function bld(x, z, w, d, h, hero) {
      var a = w / 2, b = d / 2, ou = (rnd() * 16 | 0) / 16, ov = (rnd() * 16 | 0) / 16, fu = function (l) { return l / 3 / 16; }, fv = h / 3.2 / 16;
      quad([x - a, 0, z + b], [x + a, 0, z + b], [x + a, h, z + b], [x - a, h, z + b], [0, 0, 1], ou, ov, ou + fu(w), ov + fv);
      quad([x + a, 0, z + b], [x + a, 0, z - b], [x + a, h, z - b], [x + a, h, z + b], [1, 0, 0], ou, ov, ou + fu(d), ov + fv);
      quad([x + a, 0, z - b], [x - a, 0, z - b], [x - a, h, z - b], [x + a, h, z - b], [0, 0, -1], ou, ov, ou + fu(w), ov + fv);
      quad([x - a, 0, z - b], [x - a, 0, z + b], [x - a, h, z + b], [x - a, h, z - b], [-1, 0, 0], ou, ov, ou + fu(d), ov + fv);
      quad([x - a, h, z + b], [x + a, h, z + b], [x + a, h, z - b], [x - a, h, z - b], [0, 1, 0], .002, .002, .004, .004);
      var L = hero ? HE : E, cs = [[x - a, z - b], [x + a, z - b], [x + a, z + b], [x - a, z + b]];
      for (var i = 0; i < 4; i++) { var p = cs[i], q = cs[(i + 1) % 4]; L.push(p[0], 0, p[1], p[0], h, p[1], p[0], h, p[1], q[0], h, q[1]); }
    }
    var riv = function (z) { return 16 * Math.sin(z / 46) - 36; }, HX = 14, HZ = 0;
    for (var i = -7; i <= 7; i++) for (var j = -7; j <= 7; j++) {
      var cx = i * 14, cz = j * 14; if (Math.hypot(cx, cz) > 100 + rnd() * 12 || (i === 1 && j === 0)) continue;
      var lots = rnd() < .42 ? 1 : rnd() < .5 ? 2 : 4;
      for (var l = 0; l < lots; l++) {
        var lw = lots === 1 ? 10 : 4.6, ld = lots === 4 ? 4.6 : 10, x = cx + (lots === 1 ? 0 : l % 2 ? 2.7 : -2.7), z = cz + (lots === 4 ? (l < 2 ? -2.7 : 2.7) : 0);
        if (Math.abs(x - riv(z)) < 11) continue;
        var core = Math.exp(-Math.pow(Math.hypot(x - HX, z - HZ) / 36, 2)), h = 3 + core * (30 + rnd() * 44) + rnd() * (5 + core * 10);
        if (rnd() < .12) h *= .4;
        var w = lw * (.7 + rnd() * .22), d = ld * (.7 + rnd() * .22);
        bld(x, z, w, d, h);
        if (h > 38 && rnd() < .55) bld(x, z, w * .66, d * .66, h + 4 + rnd() * 10);
      }
    }
    bld(HX, HZ, 7.2, 7.2, 104, true); bld(HX, HZ, 5, 5, 114, true); bld(HX, HZ, .5, .5, 134, true);
    var bg = new T.BufferGeometry();
    bg.setAttribute('position', new T.Float32BufferAttribute(P, 3)); bg.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); bg.setAttribute('uv', new T.Float32BufferAttribute(U, 2));
    city.add(new T.Mesh(bg, new T.MeshStandardMaterial({ color: 0x17140f, roughness: .82, metalness: .1, emissive: 0xffffff, emissiveMap: win, emissiveIntensity: 1.3 })));
    var lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(E, 3));
    var lineMat = new T.LineBasicMaterial({ color: 0xf7c548, transparent: true, opacity: .3 });
    city.add(new T.LineSegments(lg, lineMat));
    var hg = new T.BufferGeometry(); hg.setAttribute('position', new T.Float32BufferAttribute(HE, 3));
    city.add(new T.LineSegments(hg, new T.LineBasicMaterial({ color: 0xffe7a3, transparent: true, opacity: .95 })));
    var crown = new T.Mesh(new T.BoxGeometry(5.1, 1.2, 5.1), new T.MeshBasicMaterial({ color: 0xf7c548 })); crown.position.set(HX, 113.6, HZ); city.add(crown);
    var beacon = new T.Mesh(new T.SphereGeometry(.9, 16, 12), new T.MeshBasicMaterial({ color: 0xfff1c4, transparent: true })); beacon.position.set(HX, 134.5, HZ); city.add(beacon);

    var ground = new T.Mesh(new T.PlaneGeometry(900, 900), new T.MeshStandardMaterial({ color: 0x0c0a07, roughness: 1 })); ground.rotation.x = -Math.PI / 2; S.add(ground);
    var grid = new T.GridHelper(280, 20, 0xf7c548, 0xf7c548); grid.material.transparent = true; grid.material.opacity = .1; grid.material.depthWrite = false; grid.position.set(7, .05, 7); S.add(grid);

    var rg = new T.PlaneGeometry(15, 320, 1, 140); rg.rotateX(-Math.PI / 2);
    var rp = rg.attributes.position; for (var k2 = 0; k2 < rp.count; k2++) rp.setX(k2, rp.getX(k2) + riv(rp.getZ(k2)));
    var rMat = new T.ShaderMaterial({
      uniforms: { t: { value: 0 }, bg: { value: BG } },
      vertexShader: 'varying vec2 vU; varying float vD; void main(){ vU = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform float t; uniform vec3 bg; varying vec2 vU; varying float vD; void main(){ float e = smoothstep(0.0,.2,vU.x)*smoothstep(1.0,.8,vU.x); float w = sin(vU.y*300.0 + t*1.5 + sin(vU.x*11.0 + t*.7)*2.6)*.5+.5; float gl = pow(w, 26.0)*e; vec3 c = mix(vec3(.012,.035,.045), vec3(.03,.075,.09), e) + vec3(1.0,.74,.3)*gl*.8; float f = 1.0 - exp(-0.0068*0.0068*vD*vD); gl_FragColor = vec4(mix(c, bg, f), 1.0); }'
    });
    var river = new T.Mesh(rg, rMat); river.position.y = .08; S.add(river);

    var DN = 320, dp = new Float32Array(DN * 3), dsp = new Float32Array(DN);
    for (var q = 0; q < DN; q++) { dp[q * 3] = (rnd() - .5) * 230; dp[q * 3 + 1] = rnd() * 80; dp[q * 3 + 2] = (rnd() - .5) * 230; dsp[q] = 1 + rnd() * 3; }
    var dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dp, 3));
    var dust = new T.Points(dg, new T.PointsMaterial({ color: 0xffd98a, size: .75, transparent: true, opacity: .75, depthWrite: false, blending: T.AdditiveBlending })); S.add(dust);

    lay.style.opacity = '0'; lay.style.transition = 'opacity 1.2s ease';
    var s = addScene(host, R, S, function (t, dt) {
      var f = fit(R, cam, lay); if (!f) return;
      if (s.start == null) { s.start = t; lay.style.opacity = '1'; }
      var w = R._w, h = R._h, wide = w >= 880, lt = t - s.start, k = A.k;
      if (f === 2) { maskCity(lay, wide); if (wide) cam.setViewOffset(w, h, -w * .2, 0, w, h); else cam.clearViewOffset(); cam.updateProjectionMatrix(); }
      var rise = reduce ? 1 : ease(cl((lt - .1) / 2.4)); city.scale.y = Math.max(.002, rise);
      var hr = host.getBoundingClientRect(), sc = cl(-hr.top / Math.max(1, hr.height));
      var px = fine ? ptr.x - .5 : 0, py = fine ? ptr.y - .5 : 0;
      s.ax = s.ax == null ? px : s.ax + (px - s.ax) * .05; s.ay = s.ay == null ? py : s.ay + (py - s.ay) * .05;
      var a = .8 + (reduce ? 0 : lt * .028 * k) + s.ax * .35 * k, e = .34 - s.ay * .08 * k + sc * .2, r = 182 - rise * 32;
      cam.position.set(Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r + 6, Math.cos(a) * Math.cos(e) * r); cam.lookAt(8, 16, 0);
      rMat.uniforms.t.value = t; beacon.material.opacity = .55 + .45 * Math.sin(t * 2.4);
      if (!reduce) { for (var q = 0; q < DN; q++) { var y = dp[q * 3 + 1] + dsp[q] * dt; dp[q * 3 + 1] = y > 80 ? 0 : y; } dg.attributes.position.needsUpdate = true; }
      R.render(S, cam);
    }, function () { if (lay.parentNode) lay.parentNode.removeChild(lay); host.removeAttribute('data-aq3d-host'); host._aq = 0; });
  }

  /* ---------- mapa 3D de Paraguay (pie) ---------- */
  function loadGeo() {
    if (geoP) return geoP;
    var tryU = function (i) { return fetch(GEO[i]).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).catch(function (e) { if (i + 1 < GEO.length) return tryU(i + 1); throw e; }); };
    geoP = tryU(0).then(function (topo) {
      var tf = topo.transform, ob = topo.objects.countries || topo.objects[Object.keys(topo.objects)[0]];
      var arcs = topo.arcs.map(function (a) { var x = 0, y = 0; return a.map(function (p) { if (!tf) return p; x += p[0]; y += p[1]; return [x * tf.scale[0] + tf.translate[0], y * tf.scale[1] + tf.translate[1]]; }); });
      var gm = ob.geometries.filter(function (g) { return String(g.id) === '600' || (g.properties && g.properties.name === 'Paraguay'); })[0];
      if (!gm) throw new Error('Paraguay no encontrado');
      var ring = function (ids) { var out = []; ids.forEach(function (i) { var a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; out = out.concat(out.length ? a.slice(1) : a); }); return out; };
      var polys = gm.type === 'Polygon' ? [gm.arcs] : gm.arcs, best = null, bA = 0;
      polys.forEach(function (p) { var r = ring(p[0]), ar = Math.abs(area(r)); if (ar > bA) { bA = ar; best = r; } });
      var f = best[0], l = best[best.length - 1]; if (f[0] === l[0] && f[1] === l[1]) best.pop();
      return best;
    });
    geoP.catch(function () { geoP = null; });
    return geoP;
  }
  function mountMap(host) {
    if (host._aq || !A.on) return; host._aq = 1;
    whenNear(host, function () {
      if (!host.isConnected) { host._aq = 0; return; }
      loadGeo().then(function (ring) { if (host.isConnected && A.on) buildMap(host, ring); else host._aq = 0; })
        .catch(function (e) { console.warn('[AQ3D] mapa', e); host.style.display = 'none'; });
    });
  }
  function lbl(text, href) {
    var a = document.createElement('a'); a.href = href; a.textContent = text; a.setAttribute('data-aq-lbl', '');
    a.style.cssText = 'display:inline-flex;align-items:center;min-height:34px;padding:0 14px;border-radius:999px;background:#fff;color:#151618;font:700 14px/1 var(--font-body);letter-spacing:-.005em;text-decoration:none;white-space:nowrap;box-shadow:0 8px 22px rgba(22,19,14,.16),inset 0 0 0 1px rgba(168,116,15,.28);pointer-events:auto';
    return a;
  }
  function buildMap(host, ring) {
    var R = renderer(host, 2, true); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.toneMappingExposure = 1.05;
    var S = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 1, 600);
    S.environment = studioEnv(R);
    S.add(new T.HemisphereLight(0xffffff, 0xe6ddcb, .9));
    var sun = new T.DirectionalLight(0xfff2dc, 2.4); sun.position.set(-20, 42, 24); sun.castShadow = true;
    var sz = fine ? 2048 : 1024; sun.shadow.mapSize.set(sz, sz); Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; S.add(sun);
    var floor = new T.Mesh(new T.PlaneGeometry(240, 240), new T.ShadowMaterial({ opacity: .13 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);

    var world = new T.Group(); S.add(world);
    var lo = Infinity, hi = -Infinity, la = Infinity, ha = -Infinity;
    ring.forEach(function (p) { lo = Math.min(lo, p[0]); hi = Math.max(hi, p[0]); la = Math.min(la, p[1]); ha = Math.max(ha, p[1]); });
    var lonC = (lo + hi) / 2, latC = (la + ha) / 2, kx = Math.cos(latC * Math.PI / 180), SC = 3.9;
    var proj = function (lat, lon) { return [(lon - lonC) * kx * SC, (lat - latC) * SC]; };
    var shape = new T.Shape(); ring.forEach(function (p, i) { var q = proj(p[1], p[0]); if (i) shape.lineTo(q[0], q[1]); else shape.moveTo(q[0], q[1]); });
    var DEP = 1.3, BV = .28, TOP = DEP + BV * 2;
    var lgeo = new T.ExtrudeGeometry(shape, { depth: DEP, bevelEnabled: true, bevelThickness: BV, bevelSize: .2, bevelSegments: 3, curveSegments: 2 });
    var topMat = new T.MeshStandardMaterial({ color: 0xfbf8f1, roughness: .88, metalness: 0, envMapIntensity: .6 });
    var gold = new T.MeshStandardMaterial({ color: 0xe0aa3a, metalness: .9, roughness: .28 });
    var land = new T.Mesh(lgeo, [topMat, gold]); land.rotation.x = -Math.PI / 2; land.castShadow = land.receiveShadow = true; world.add(land);

    var RR = 26, ticks = [];
    for (var n = 0; n < 72; n++) { var an = n / 72 * Math.PI * 2, r0 = RR - (n % 6 ? .55 : 1.1); ticks.push(Math.cos(an) * r0, .02, Math.sin(an) * r0, Math.cos(an) * (RR - .1), .02, Math.sin(an) * (RR - .1)); }
    var tg = new T.BufferGeometry(); tg.setAttribute('position', new T.Float32BufferAttribute(ticks, 3));
    world.add(new T.LineSegments(tg, new T.LineBasicMaterial({ color: 0xa8740f, transparent: true, opacity: .4 })));
    var ringM = new T.Mesh(new T.RingGeometry(RR, RR + .16, 220), new T.MeshBasicMaterial({ color: 0xd9a12c, transparent: true, opacity: .7, side: T.DoubleSide })); ringM.rotation.x = -Math.PI / 2; ringM.position.y = .02; world.add(ringM);
    var ring2 = new T.Mesh(new T.RingGeometry(RR + 1.4, RR + 1.47, 220), new T.MeshBasicMaterial({ color: 0xd9a12c, transparent: true, opacity: .3, side: T.DoubleSide })); ring2.rotation.x = -Math.PI / 2; ring2.position.y = .02; world.add(ring2);
    var spark = new T.Mesh(new T.SphereGeometry(.42, 18, 12), new T.MeshBasicMaterial({ color: 0xffe7a3 })); world.add(spark);
    var halo = new T.Mesh(new T.RingGeometry(.5, 1.5, 32), new T.MeshBasicMaterial({ color: 0xf7c548, transparent: true, opacity: .35, depthWrite: false, side: T.DoubleSide })); halo.rotation.x = -Math.PI / 2; world.add(halo);

    var Z = [{ slug: 'asuncion', name: 'Asunción' }];
    var pins = Z.map(function (z, i) {
      var q = proj(ZC[z.slug][0], ZC[z.slug][1]), cl4 = CLH[z.slug] != null, r = cl4 ? .3 : .72, hgt = cl4 ? CLH[z.slug] : 3.6;
      var g = new T.Group(); g.position.set(q[0], TOP, -q[1]); world.add(g);
      var drop = new T.Group(); g.add(drop);
      var stem = new T.Mesh(new T.CylinderGeometry(.05, .05, hgt, 8), gold); stem.position.y = hgt / 2; stem.castShadow = true; drop.add(stem);
      var head = new T.Mesh(new T.SphereGeometry(r, 28, 18), gold); head.position.y = hgt + r * .8; head.castShadow = true; drop.add(head);
      var pulse = new T.Mesh(new T.RingGeometry(.2, .32, 40), new T.MeshBasicMaterial({ color: 0xf7c548, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide })); pulse.rotation.x = -Math.PI / 2; pulse.position.y = .03; g.add(pulse);
      return { z: z, g: g, drop: drop, head: head, pulse: pulse, cluster: cl4, r: r, i: i, hl: 0 };
    });
    drop0();
    function drop0() { pins.forEach(function (p) { p.drop.position.y = reduce ? 0 : 16; }); }

    var ov = document.createElement('div'); ov.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:visible'; host.appendChild(ov);
    var singles = [], box = null, boxLine = null;
    var href = function () { return '#/propiedades'; };
    var hook = function (a, list) { a.addEventListener('mouseenter', function () { list.forEach(function (p) { p.hl = 1; }); }); a.addEventListener('mouseleave', function () { list.forEach(function (p) { p.hl = 0; }); }); a.addEventListener('focus', function () { list.forEach(function (p) { p.hl = 1; }); }); a.addEventListener('blur', function () { list.forEach(function (p) { p.hl = 0; }); }); };
    pins.filter(function (p) { return !p.cluster; }).forEach(function (p) { var a = lbl(p.z.name, href(p.z)); a.style.position = 'absolute'; a.style.left = '0'; a.style.top = '0'; a.style.opacity = '0'; ov.appendChild(a); hook(a, [p]); singles.push({ p: p, el: a }); });
    var cps = pins.filter(function (p) { return p.cluster; });
    if (cps.length) {
      box = document.createElement('div');
      box.style.cssText = 'position:absolute;left:0;top:0;opacity:0;display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;background:rgba(255,255,255,.94);box-shadow:0 14px 36px rgba(22,19,14,.16),inset 0 0 0 1px rgba(168,116,15,.22);max-width:236px;pointer-events:auto;transition:opacity .5s ease';
      var hd = document.createElement('span'); hd.textContent = 'Gran Asunción'; hd.style.cssText = 'font:700 12px/1 var(--font-body);letter-spacing:.14em;text-transform:uppercase;color:#6b4a0b;padding:2px 4px 0';
      var wr = document.createElement('div'); wr.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
      cps.forEach(function (p) { var a = lbl(p.z.name, href(p.z)); a.style.minHeight = '32px'; a.style.fontSize = '13px'; a.style.padding = '0 12px'; a.style.boxShadow = 'inset 0 0 0 1px rgba(168,116,15,.3)'; wr.appendChild(a); hook(a, [p]); });
      box.appendChild(hd); box.appendChild(wr); ov.appendChild(box);
      boxLine = document.createElement('span'); boxLine.style.cssText = 'position:absolute;left:0;top:0;height:2px;background:#d9a12c;transform-origin:0 50%;opacity:0;transition:opacity .5s ease;border-radius:2px'; ov.appendChild(boxLine);
    }

    var drag = { on: false, x: 0, v: 0, rot: 0 };
    var down = function (e) { if (e.target.closest && e.target.closest('a,[data-aq-lbl]')) return; if (box && box.contains(e.target)) return; drag.on = true; drag.x = e.clientX; drag.v = 0; host.style.cursor = 'grabbing'; if (host.setPointerCapture) try { host.setPointerCapture(e.pointerId); } catch (x) {} };
    var move = function (e) { if (!drag.on) return; var dx = e.clientX - drag.x; drag.x = e.clientX; drag.rot += dx * .008; drag.v = dx * .008; };
    var up = function () { drag.on = false; host.style.cursor = 'grab'; };
    host.addEventListener('pointerdown', down); host.addEventListener('pointermove', move); host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);

    var v = new T.Vector3(), v2 = new T.Vector3();
    var scr = function (o, dy) { o.getWorldPosition(v); v.y += dy || 0; v.project(cam); return [(v.x + 1) / 2 * R._w, (1 - v.y) / 2 * R._h]; };
    var s = addScene(host, R, S, function (t, dt) {
      var f = fit(R, cam, host); if (!f) return;
      if (s.start == null) s.start = t;
      var lt = t - s.start, k = A.k, rise = reduce ? 1 : ease(cl((lt - .1) / 1.6));
      land.scale.z = Math.max(.01, rise);
      pins.forEach(function (p, i) {
        var u = reduce ? 1 : cl((lt - 1.3 - i * .14) / .9); p.drop.position.y = (1 - bounce(u)) * 16;
        var hs = 1 + p.hl * .5; p.head.scale.x += (hs - p.head.scale.x) * .2; p.head.scale.y = p.head.scale.z = p.head.scale.x;
        var ph = ((t * .45 + i * .23) % 1); p.pulse.scale.setScalar(1 + ph * 4.5); p.pulse.material.opacity = u >= 1 ? (1 - ph) * .75 : 0;
      });
      if (!drag.on) { drag.rot += drag.v; drag.v *= .93; }
      var px = fine ? ptr.x - .5 : 0, py = fine ? ptr.y - .5 : 0;
      s.ax = s.ax == null ? px : s.ax + (px - s.ax) * .05; s.ay = s.ay == null ? py : s.ay + (py - s.ay) * .05;
      world.rotation.y = -.2 + drag.rot + (reduce ? 0 : Math.sin(lt * .18) * .1 * k) + s.ax * .22 * k;
      var sa = reduce ? 0 : t * .35; spark.position.set(Math.cos(sa) * (RR + .08), .45, Math.sin(sa) * (RR + .08)); halo.position.set(spark.position.x, .04, spark.position.z); halo.material.opacity = .25 + .15 * Math.sin(t * 3);
      var hr = host.getBoundingClientRect(), vh = innerHeight || 800, prog = cl((vh - hr.top) / (vh + hr.height));
      var e = .62 + prog * .36 - s.ay * .06 * k, d = 74 * Math.max(1, 1.18 / cam.aspect);
      cam.position.set(0, Math.sin(e) * d, Math.cos(e) * d); cam.lookAt(0, -1, 1.5);
      R.render(S, cam);
      var shown = reduce || lt > 1.3 + pins.length * .14 + .7;
      singles.forEach(function (o) { var p = scr(o.p.head, o.p.r * 1.1); o.el.style.transform = 'translate3d(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px,0) translate(-50%,calc(-100% - 10px))'; o.el.style.opacity = shown ? '1' : '0'; o.el.tabIndex = shown ? 0 : -1; });
      if (box) {
        var sx = 0, sy = 0; cps.forEach(function (p) { var q = scr(p.head, 0); sx += q[0]; sy += q[1]; }); sx /= cps.length; sy /= cps.length;
        var bw = box.offsetWidth || 220, left = sx - bw - 40 > 4, bx = left ? sx - 34 : sx + 34;
        box.style.transform = 'translate3d(' + bx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0) translate(' + (left ? '-100%' : '0') + ',-50%)'; box.style.opacity = shown ? '1' : '0';
        box.querySelectorAll('a').forEach(function (a) { a.tabIndex = shown ? 0 : -1; });
        boxLine.style.width = '26px'; boxLine.style.transform = 'translate3d(' + (left ? sx - 32 : sx + 6).toFixed(1) + 'px,' + (sy - 1).toFixed(1) + 'px,0)'; boxLine.style.opacity = shown ? '1' : '0';
      }
    }, function () { if (ov.parentNode) ov.parentNode.removeChild(ov); host.removeEventListener('pointerdown', down); host.removeEventListener('pointermove', move); host.removeEventListener('pointerup', up); host.removeEventListener('pointercancel', up); host._aq = 0; });
  }

  /* ---------- utilidades de estudio ---------- */
  function studioEnv(R) {
    var pm = new T.PMREMGenerator(R), es = new T.Scene();
    es.add(new T.Mesh(new T.SphereGeometry(60, 32, 16), new T.MeshBasicMaterial({ color: 0xf2ece0, side: T.BackSide })));
    var low = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshBasicMaterial({ color: 0x3a3329, side: T.DoubleSide })); low.rotation.x = Math.PI / 2; low.position.y = -20; es.add(low);
    [[0, 40, 0, 34, 34], [-38, 16, 22, 16, 24], [34, 22, -22, 22, 12]].forEach(function (b) { var m = new T.Mesh(new T.PlaneGeometry(b[3], b[4]), new T.MeshBasicMaterial({ color: new T.Color(5, 4.8, 4.4), side: T.DoubleSide })); m.position.set(b[0], b[1], b[2]); m.lookAt(0, 0, 0); es.add(m); });
    var tx = pm.fromScene(es, .04).texture; pm.dispose(); return tx;
  }
  function rrect(w, d, r) {
    var s = new T.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function facadeTex() {
    var c = document.createElement('canvas'); c.width = c.height = 128; var g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    for (var y = 0; y < 4; y++) { g.fillStyle = '#dde1e6'; g.fillRect(0, y * 32 + 27, 128, 5); for (var x = 0; x < 4; x++) { g.fillStyle = '#7f8892'; g.fillRect(x * 32 + 7, y * 32 + 6, 18, 17); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x * 32 + 7, y * 32 + 6, 18, 4); } }
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function readVals(host) { try { return JSON.parse(host.getAttribute('data-vals') || '[]') || []; } catch (e) { return []; } }

  /* ---------- gráficos 3D (barras / columnas / anillo) ---------- */
  function mountChart(host) {
    if (host._aq) return; host._aq = 1;
    whenNear(host, function () { if (!host.isConnected) { host._aq = 0; return; } try { buildChart(host); } catch (e) { console.warn('[AQ3D] gráfico', e); chartFallback(host); } }, function () { chartFallback(host); });
  }
  function chartFallback(host) {
    if (host._fb) return; host._fb = 1;
    var box = document.createElement('div'); box.style.cssText = 'position:absolute;inset:0;display:flex;align-items:flex-end;gap:10px;padding:10px'; host.appendChild(box);
    var draw = function () { var D = readVals(host); box.innerHTML = ''; D.forEach(function (d) { var c = document.createElement('div'); c.style.cssText = 'flex:1;min-height:3px;border-radius:6px 6px 0 0;background:' + (d.c || (d.s === 'dim' ? '#eee3c8' : '#c99a2e')) + ';height:' + Math.max(2, (d.v || 0) * 100) + '%'; box.appendChild(c); }); };
    draw(); new MutationObserver(draw).observe(host, { attributes: true, attributeFilter: ['data-vals'] });
  }
  function buildChart(host) {
    var donut = host.getAttribute('data-aq3d-chart') === 'donut', names = host.hasAttribute('data-names');
    var R = renderer(host, 2, true); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    var S = new T.Scene(), cam = new T.PerspectiveCamera(26, 1, .5, 400);
    S.environment = studioEnv(R);
    S.add(new T.HemisphereLight(0xffffff, 0xe6ddcb, .8));
    var sun = new T.DirectionalLight(0xfff2dc, 2.3); sun.position.set(-6, 14, 9); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 60 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .02; S.add(sun);
    var floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.ShadowMaterial({ opacity: .12 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);
    var G = new T.Group(); S.add(G);
    var ov = document.createElement('div'); ov.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:visible'; host.appendChild(ov);
    var tip = document.createElement('div'); tip.style.cssText = 'position:absolute;left:0;top:0;padding:7px 11px;border-radius:8px;background:#16130e;color:#fff;font:700 13px/1.3 var(--font-body);white-space:nowrap;opacity:0;transition:opacity .15s;z-index:3'; ov.appendChild(tip);
    var COL = { '': new T.Color(0xf1f2f4), on: new T.Color(0xd6a23a), dim: new T.Color(0xf8f8f9), hov: new T.Color(0xf7c548) }, PALE = new T.Color(0xf4f4f5), tmp = new T.Color();
    var mat = function (c) { return new T.MeshStandardMaterial({ color: c, metalness: .55, roughness: .32, envMapIntensity: 1.1 }); };
    var white = new T.MeshStandardMaterial({ color: 0xfbf8f1, roughness: .9 }), goldM = new T.MeshStandardMaterial({ color: 0xe0aa3a, metalness: .9, roughness: .28 });
    var ftex = facadeTex(), rtex = donut ? facadeTex() : null, roofM = new T.MeshStandardMaterial({ color: 0xe9ebee, roughness: .7, metalness: .1 }), crownG = null, penG = null; if (rtex) rtex.repeat.set(.85, .85);
    var items = [], segs = [], str = null, N = 0, slab = null, hover = -1, inside = false, mx = .5, my = .5, px = 0, py = 0, dirty = true;
    var ray = new T.Raycaster(), mp = new T.Vector2(), v = new T.Vector3();
    var put = function (el, txt) { if (el._t !== txt) { el._t = txt; el.textContent = txt; } };
    var scr = function (x, y, z) { v.set(x, y, z); G.localToWorld(v); v.project(cam); return [(v.x + 1) / 2 * R._w, (1 - v.y) / 2 * R._h]; };
    if (donut) {
      var base = new T.Mesh(new T.CylinderGeometry(3.55, 3.6, .32, 96), [goldM, white, white]); base.position.y = .16; base.castShadow = base.receiveShadow = true; G.add(base);
    }
    function segGeo(a0, a1, r0, r1, h) {
      var s = new T.Shape(), n = Math.max(2, Math.ceil((a1 - a0) / .07)), i, a;
      for (i = 0; i <= n; i++) { a = a0 + (a1 - a0) * i / n; if (i) s.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); else s.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); }
      for (i = n; i >= 0; i--) { a = a0 + (a1 - a0) * i / n; s.lineTo(Math.cos(a) * r0, Math.sin(a) * r0); }
      var g = new T.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 2, curveSegments: 1 }); g.rotateX(-Math.PI / 2); return g;
    }
    function sync() {
      var s = host.getAttribute('data-vals') || '[]'; if (s === str) return; str = s; var D = readVals(host);
      if (donut) {
        while (segs.length < D.length) { var sm = new T.MeshStandardMaterial({ color: 0xd6a23a, map: rtex, metalness: .15, roughness: .55, envMapIntensity: 1 }), m = new T.Mesh(new T.BufferGeometry(), [roofM, sm]); m.castShadow = m.receiveShadow = true; m.userData.i = segs.length; G.add(m); var cp = new T.Mesh(new T.BufferGeometry(), goldM); cp.castShadow = true; G.add(cp); segs.push({ m: m, sm: sm, cap: cp, f: 0, h: .7, off: 0, c: new T.Color(0xd6a23a) }); }
        segs.forEach(function (g, i) { g.d = D[i] || { v: 0 }; g.c.set(g.d.c || '#c99a2e'); });
        dirty = true; return;
      }
      if (D.length !== N) {
        if (items.length) items[0].m.geometry.dispose();
        items.forEach(function (it) { G.remove(it.m); G.remove(it.cap); it.sd.dispose(); it.tx.dispose(); ov.removeChild(it.vl); if (it.nl) ov.removeChild(it.nl); });
        items = []; N = D.length; if (slab) { G.remove(slab); slab.geometry.dispose(); }
        var W = Math.max(1, N) * 2 + .8, sg = new T.ExtrudeGeometry(rrect(W, 3.4, .6), { depth: .45, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 2, curveSegments: 8 }); sg.rotateX(-Math.PI / 2);
        slab = new T.Mesh(sg, [white, goldM]); slab.position.y = .08; slab.castShadow = slab.receiveShadow = true; G.add(slab);
        var bg = new T.BoxGeometry(1.2, 1, 1.2); bg.translate(0, .5, 0); if (!crownG) { crownG = new T.BoxGeometry(1.34, .1, 1.34); penG = new T.BoxGeometry(.6, .26, .6); }
        for (var i = 0; i < N; i++) {
          var tx = ftex.clone(); tx.needsUpdate = true; var sd = new T.MeshStandardMaterial({ color: COL[''].clone(), map: tx, metalness: .15, roughness: .55, envMapIntensity: 1 }), bx = (i - (N - 1) / 2) * 2;
          var mm = new T.Mesh(bg, [sd, sd, roofM, roofM, sd, sd]); mm.position.set(bx, .61, 0); mm.castShadow = mm.receiveShadow = true; mm.userData.i = i; G.add(mm);
          var cap = new T.Group(), cr = new T.Mesh(crownG, goldM), pe = new T.Mesh(penG, roofM); cr.position.y = .05; pe.position.y = .23; cr.castShadow = pe.castShadow = true; cap.add(cr); cap.add(pe); cap.position.set(bx, .61, 0); G.add(cap);
          var vl = document.createElement('span'); vl.style.cssText = 'position:absolute;left:0;top:0;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 2px 10px rgba(22,19,14,.14);font:800 12px/1.25 var(--font-body);color:#16130e;white-space:nowrap;font-variant-numeric:tabular-nums'; ov.appendChild(vl);
          var nl = null; if (names) { nl = document.createElement('span'); nl.style.cssText = 'position:absolute;left:0;top:0;font:700 12px/1.2 var(--font-body);color:#3a3329;white-space:nowrap'; ov.appendChild(nl); }
          items.push({ m: mm, sd: sd, tx: tx, cap: cap, h: .02, vl: vl, nl: nl });
        }
      }
      D.forEach(function (d, i) { if (items[i]) items[i].d = d; });
    }
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); inside = true; mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height; px = e.clientX - r.left; py = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { inside = false; hover = -1; tip.style.opacity = '0'; host.style.cursor = ''; });
    host.addEventListener('click', function () {
      if (hover < 0) return; var sel = host.getAttribute('data-pick'); if (!sel) return;
      var fig = host.closest('figure') || host.parentElement, b = fig && fig.querySelectorAll(sel)[hover]; if (b && !b.disabled) b.click();
    });
    var s = addScene(host, R, S, function (t) {
      var f = fit(R, cam, host); if (!f) return; sync();
      if (s.start == null) s.start = t; var lt = t - s.start, k = A.k || 1;
      var meshes = donut ? segs.map(function (g) { return g.m; }) : items.map(function (it) { return it.m; });
      if (inside && fine) { mp.set(mx * 2 - 1, -(my * 2 - 1)); ray.setFromCamera(mp, cam); var hit = ray.intersectObjects(meshes, false)[0]; hover = hit ? hit.object.userData.i : -1; } else if (!inside) hover = -1;
      var hd = null;
      if (donut) {
        var tot = 0, ch = false; segs.forEach(function (g) { var tf = (g.d && g.d.v) || 0; if (Math.abs(tf - g.f) > 1e-4) { g.f += (tf - g.f) * (reduce ? 1 : .1); ch = true; } else g.f = tf; tot += g.f; });
        var a = Math.PI / 2, gap = segs.filter(function (g) { return g.f > .002; }).length > 1 ? .045 : 0;
        segs.forEach(function (g, i) {
          var st = hover === i ? 'hov' : (g.d && g.d.s) || '', th = .7 + g.f * 3.6 + (st === 'on' || st === 'hov' ? .45 : 0), to = st === 'on' || st === 'hov' ? .28 : 0;
          if (Math.abs(th - g.h) > 1e-3) { g.h += (th - g.h) * .18; ch = true; } g.off += (to - g.off) * .18;
          var span = tot > 0 ? g.f / tot * Math.PI * 2 : 0;
          if ((ch || dirty) && span > .002) { g.m.geometry.dispose(); g.m.geometry = segGeo(a + gap / 2, a + span - gap / 2, 1.85, 3.15, g.h); g.cap.geometry.dispose(); g.cap.geometry = segGeo(a + gap / 2, a + span - gap / 2, 1.78, 3.22, .1); }
          g.m.visible = span > .002; var mid = a + span / 2; g.mid = mid; g.m.position.set(Math.cos(mid) * g.off, .32, -Math.sin(mid) * g.off); g.cap.visible = g.m.visible; g.cap.position.set(g.m.position.x, .32 + g.h + .05, g.m.position.z);
          tmp.copy(g.c); if (st === 'dim') tmp.lerp(PALE, .72); g.sm.color.lerp(tmp, .18);
          if (hover === i && g.d) hd = g.d; a += span;
        });
        dirty = false;
        G.rotation.y = reduce ? 0 : Math.sin(lt * .22) * .18 * k;
        var dd = 21.5 / Math.min(1, cam.aspect), e = .6 - (inside ? (my - .5) * .08 : 0);
        cam.position.set(Math.sin(.2) * Math.cos(e) * dd, Math.sin(e) * dd + 1.8, Math.cos(.2) * Math.cos(e) * dd); cam.lookAt(0, 1.8, 0);
      } else {
        items.forEach(function (it, i) {
          var d = it.d || {}, st = hover === i ? 'hov' : d.s || '', tg = .06 + (d.v || 0) * 4.2, grow = reduce ? 1 : cl((lt - i * .08) / .9);
          it.h += (tg * grow - it.h) * (reduce ? 1 : .1); var hh = Math.max(.02, it.h); it.m.scale.y = hh; it.cap.position.y = .61 + hh; it.tx.repeat.y = Math.max(.2, hh / 1.2);
          it.sd.color.lerp(COL[st] || COL[''], .16);
          if (hover === i) hd = d;
        });
        var W = N * 2 + .8, vt = Math.tan(13 * Math.PI / 180), dist = Math.max(3.4 / vt, (W / 2 + 1.1) / (vt * cam.aspect)) * 1.1;
        var az = .42 + (reduce ? 0 : Math.sin(lt * .25) * .06 * k) + (inside ? (mx - .5) * .22 * k : 0), el = .36 - (inside ? (my - .5) * .08 : 0);
        cam.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist + 2.5, Math.cos(az) * Math.cos(el) * dist); cam.lookAt(0, 2.5, 0);
      }
      R.render(S, cam);
      if (!donut) items.forEach(function (it) {
        var d = it.d || {}, p = scr(it.m.position.x, .61 + it.h + .6, 0); put(it.vl, d.l || '');
        it.vl.style.transform = 'translate3d(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px,0) translate(-50%,-100%)';
        if (it.nl) { var q = scr(it.m.position.x, .6, 1.75); put(it.nl, d.n || ''); it.nl.style.transform = 'translate3d(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px,0) translate(-50%,8px)'; }
      });
      if (hd) { put(tip, (hd.n || '') + (hd.l ? ' · ' + hd.l : '')); tip.style.opacity = '1'; tip.style.transform = 'translate3d(' + (px + 14).toFixed(0) + 'px,' + (py - 12).toFixed(0) + 'px,0) translateY(-100%)'; host.style.cursor = host.getAttribute('data-pick') ? 'pointer' : ''; }
      else { tip.style.opacity = '0'; if (inside) host.style.cursor = ''; }
    }, function () { if (ov.parentNode) ov.parentNode.removeChild(ov); host._aq = 0; });
    s.keep = true;
  }

  /* ---------- recorrido en vídeo a partir de la foto principal ---------- */
  var FS = 'precision highp float; uniform sampler2D map; uniform float sa; uniform float ia; uniform vec3 Ac; uniform vec2 Ad; uniform vec3 Bc; uniform vec2 Bd; uniform float m; uniform float fade; uniform float t; varying vec2 vUv;' +
    'vec2 cov(vec2 u){ vec2 s = sa > ia ? vec2(1.0, ia / sa) : vec2(sa / ia, 1.0); return (u - .5) * s; }' +
    'float dep(vec2 p){ return clamp(1.2 - p.y * 1.35, 0.0, 1.0) * .72 + .28 * (1.0 - clamp(length(p - vec2(.5, .5)) * 1.7, 0.0, 1.0)); }' +
    'vec3 shot(vec3 c, vec2 d){ vec2 p = cov(vUv) / c.z + c.xy; float z = dep(p); p += (z - .5) * d * .05; p = clamp(p, .002, .998); return texture2D(map, p).rgb; }' +
    'void main(){ vec3 col = mix(shot(Ac, Ad), shot(Bc, Bd), m); float vg = smoothstep(1.3, .3, length(vUv - .5) * 1.55); col *= mix(.5, 1.0, vg); col = mix(col, col * vec3(1.07, 1.0, .88), .45);' +
    'float n = fract(sin(dot(vUv * 731.0 + t, vec2(12.9898, 78.233))) * 43758.5453); col += (n - .5) * .03; gl_FragColor = vec4(col * fade, 1.0); }';
  var SH = [
    { a: [.5, .56, 1.06, -1, 0], b: [.5, .52, 1.24, 1, 0] },
    { a: [.32, .66, 1.75, 0, 1], b: [.35, .42, 1.85, 0, -1] },
    { a: [.7, .46, 2.0, 1, -.4], b: [.64, .3, 2.25, -1, -.4] },
    { a: [.52, .5, 1.6, 0, .7], b: [.5, .5, 1.0, 0, 0] }
  ];
  function mk(tag, css, txt) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  A.tour = function (o) { openTour(o || {}); };
  function openTour(o) {
    if (document.querySelector('[data-aq-tour]')) return;
    var prevFocus = document.activeElement, de = document.documentElement, prevOv = de.style.overflow; de.style.overflow = 'hidden';
    var secs = Math.max(3, +o.secs || 6), sd = secs / 4, cf = Math.min(.45, sd * .3), src = String(o.img || '').replace(/([?&])w=\d+/, '$1w=2000');
    var ee = function (x) { return -(Math.cos(Math.PI * x) - 1) / 2; };
    var root = mk('div', 'position:fixed;inset:0;z-index:300;background:#050403;color:#fff;font-family:var(--font-body);overflow:hidden;opacity:0;transition:opacity .35s ease');
    root.setAttribute('data-aq-tour', ''); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Recorrido: ' + (o.title || 'inmueble'));
    var stage = mk('div', 'position:absolute;inset:0;overflow:hidden'); root.appendChild(stage);
    root.appendChild(mk('div', 'position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(5,4,3,.6) 0%,rgba(5,4,3,0) 20%,rgba(5,4,3,0) 46%,rgba(5,4,3,.86) 100%)'));
    var top = mk('div', 'position:absolute;left:clamp(16px,4vw,48px);right:clamp(16px,4vw,48px);top:clamp(14px,3vh,28px);display:flex;align-items:center;gap:16px');
    var bars = mk('div', 'flex:1;display:flex;gap:6px'), fills = [];
    for (var b = 0; b < 4; b++) { var tr = mk('span', 'flex:1;height:4px;border-radius:999px;background:rgba(255,255,255,.24);overflow:hidden'), fl = mk('span', 'display:block;height:100%;width:0;border-radius:inherit;background:#f7c548'); tr.appendChild(fl); bars.appendChild(tr); fills.push(fl); }
    var tag = mk('span', 'font:700 12px/1 var(--font-body);letter-spacing:.16em;text-transform:uppercase;color:#ffe7a3;white-space:nowrap', 'Recorrido · ' + secs + ' s');
    var x = mk('button', 'flex:none;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(5,4,3,.4);color:#fff;display:grid;place-items:center;cursor:pointer');
    x.type = 'button'; x.setAttribute('aria-label', 'Cerrar recorrido'); x.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg>';
    top.appendChild(bars); top.appendChild(tag); top.appendChild(x); root.appendChild(top);
    var cap = mk('div', 'position:absolute;left:clamp(20px,5vw,72px);right:clamp(20px,5vw,72px);bottom:clamp(32px,9vh,88px);max-width:940px;transition:opacity .4s ease'); cap.setAttribute('aria-live', 'polite');
    var kick = mk('span', 'display:block;font:700 13px/1.3 var(--font-body);letter-spacing:.18em;text-transform:uppercase;color:#ffe7a3;margin:0 0 14px');
    var main = mk('p', 'margin:0;font-family:var(--font-heading);font-weight:800;font-size:clamp(30px,5vw,66px);line-height:1.04;letter-spacing:-.03em;max-width:18ch;text-wrap:balance;text-shadow:0 2px 26px rgba(0,0,0,.5)');
    cap.appendChild(kick); cap.appendChild(main); root.appendChild(cap);
    var caps = [[o.kicker || '', o.title || ''], ['Superficie y distribución', (o.facts || []).join(' · ') || o.title || ''], ['Lo que destaca', (o.feats || []).slice(0, 2).join(' · ') || (o.kicker || '')], [(o.status || '') + (o.ref ? ' · Ref. ' + o.ref : ''), o.price || '']];
    var end = mk('div', 'position:absolute;inset:0;display:none;align-items:flex-end;padding:clamp(20px,5vw,72px);padding-top:90px;overflow:auto');
    var card = mk('div', 'width:100%;max-width:640px;padding:clamp(22px,3vw,36px);border-radius:16px;background:rgba(16,14,10,.84);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 30px 80px rgba(0,0,0,.45);border:1px solid rgba(247,197,72,.32)');
    card.appendChild(mk('span', 'display:block;font:700 12px/1.3 var(--font-body);letter-spacing:.16em;text-transform:uppercase;color:#ffe7a3', o.kicker || ''));
    card.appendChild(mk('h2', 'margin:10px 0 0;font-family:var(--font-heading);font-size:clamp(24px,2.6vw,32px);line-height:1.1;color:#fff;text-wrap:balance', o.title || ''));
    card.appendChild(mk('p', 'margin:14px 0 0;font-family:var(--font-heading);font-weight:800;font-size:clamp(30px,3.6vw,44px);line-height:1;color:#ffe7a3;font-variant-numeric:tabular-nums', o.price || ''));
    var fx = mk('ul', 'margin:20px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px');
    (o.facts || []).concat(o.feats || []).slice(0, 7).forEach(function (s) { fx.appendChild(mk('li', 'padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.1);font-size:14px;font-weight:600', s)); });
    card.appendChild(fx);
    var acts = mk('div', 'display:flex;flex-wrap:wrap;gap:10px;margin-top:24px');
    var lead = mk('button', 'min-height:50px;padding:0 24px;font-size:15px', 'Pedir información'); lead.type = 'button'; lead.className = 'btn btn-primary';
    var again = mk('button', 'min-height:50px;padding:0 22px;font-size:15px;background:transparent;border:1px solid rgba(255,255,255,.4);color:#fff', 'Volver a ver'); again.type = 'button'; again.className = 'btn';
    var back = mk('button', 'min-height:50px;padding:0 22px;font-size:15px;background:transparent;border:1px solid rgba(255,255,255,.4);color:#fff', 'Ver la ficha'); back.type = 'button'; back.className = 'btn';
    acts.appendChild(lead); acts.appendChild(again); acts.appendChild(back); card.appendChild(acts);
    card.appendChild(mk('p', 'margin:18px 0 0;font-size:13px;line-height:1.5;color:rgba(255,255,255,.62)', 'Recorrido creado con encuadres y movimientos de cámara sobre la foto principal: no son fotografías adicionales del inmueble.'));
    end.appendChild(card); root.appendChild(end);
    document.body.appendChild(root); requestAnimationFrame(function () { root.style.opacity = '1'; }); x.focus();

    var gl = null, img = null, ready = false, t0 = 0, ci = -1, ended = false, raf = 0;
    function cover(z) { var sa = gl ? gl.U.sa.value : 1, ia = gl ? gl.U.ia.value : 1.5; return [sa > ia ? 1 : sa / ia, sa > ia ? ia / sa : 1, z]; }
    function shotAt(i, u) { var s = SH[i], e = reduce ? .5 : ee(cl(u)), r = []; for (var k = 0; k < 5; k++) r.push(s.a[k] + (s.b[k] - s.a[k]) * e); if (reduce) { r[3] = 0; r[4] = 0; } return r; }
    function setS(vc, vd, r) { var c = cover(r[2]), hx = Math.min(.5, .5 * c[0] / r[2] + (r[2] > 1.03 ? .02 : 0)), hy = Math.min(.5, .5 * c[1] / r[2] + (r[2] > 1.03 ? .02 : 0)); vc.set(cl(r[0], hx, 1 - hx), cl(r[1], hy, 1 - hy), r[2]); vd.set(r[3], r[4]); }
    function caption(i) { kick.textContent = caps[i][0]; main.textContent = caps[i][1]; if (!reduce && main.animate) { kick.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16,.84,.24,1)' }); main.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 60, easing: 'cubic-bezier(.16,.84,.24,1)', fill: 'backwards' }); } }
    function showEnd() { ended = true; cap.style.opacity = '0'; end.style.display = 'flex'; if (card.animate && !reduce) card.animate([{ opacity: 0, transform: 'perspective(1000px) translate3d(0,40px,-80px) rotateX(10deg)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.16,.84,.24,1)' }); lead.focus(); }
    function start() { t0 = performance.now(); ci = -1; ended = false; end.style.display = 'none'; cap.style.opacity = '1'; if (!raf) raf = requestAnimationFrame(tick); }
    function tick(now) {
      raf = 0; if (!root.isConnected) return; raf = requestAnimationFrame(tick);
      var t = (now - t0) / 1000, i = Math.min(3, Math.floor(t / sd)), u = (t - i * sd) / sd; if (t >= secs) { i = 3; u = 1; }
      if (i !== ci) { ci = i; caption(i); }
      fills.forEach(function (f, k) { f.style.width = (t >= secs || k < i ? 100 : k > i ? 0 : cl(u) * 100).toFixed(1) + '%'; });
      var fade = t >= secs ? Math.max(.4, 1 - (t - secs) * 1.3) : Math.min(1, t * 2.5);
      if (gl) {
        var R = gl.R, w = stage.clientWidth, h = stage.clientHeight; if (R._w !== w || R._h !== h) { R._w = w; R._h = h; R.setSize(w, h, false); gl.U.sa.value = w / Math.max(1, h); }
        setS(gl.U.Ac.value, gl.U.Ad.value, shotAt(i, u)); var tb = (i + 1) * sd - t;
        if (i < 3 && tb < cf) { setS(gl.U.Bc.value, gl.U.Bd.value, shotAt(i + 1, 0)); gl.U.m.value = ee(1 - tb / cf); } else gl.U.m.value = 0;
        gl.U.fade.value = fade; gl.U.t.value = t % 10; R.render(gl.S, gl.cam);
      } else if (img) {
        var r = shotAt(i, u); img.style.opacity = fade.toFixed(3);
        img.style.transform = 'perspective(1200px) scale(' + r[2].toFixed(4) + ') translate(' + ((.5 - r[0]) * 100).toFixed(2) + '%,' + ((r[1] - .5) * 100).toFixed(2) + '%) rotateX(' + (r[4] * 2).toFixed(2) + 'deg) rotateY(' + (-r[3] * 2).toFixed(2) + 'deg)';
      }
      if (t >= secs && !ended) showEnd();
    }
    function initCSS() {
      if (gl) { try { gl.R.dispose(); } catch (e) {} gl = null; } stage.innerHTML = '';
      img = new Image(); img.alt = ''; img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%;will-change:transform';
      var go = function () { if (!ready) { ready = true; start(); } }; img.onload = go; img.onerror = go; img.src = src || ''; stage.appendChild(img); if (!src) go();
    }
    function initGL() {
      var R = new T.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      R.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; R.domElement.setAttribute('aria-hidden', 'true'); stage.appendChild(R.domElement);
      var U = { map: { value: null }, sa: { value: 1 }, ia: { value: 1.5 }, Ac: { value: new T.Vector3(.5, .5, 1) }, Ad: { value: new T.Vector2() }, Bc: { value: new T.Vector3(.5, .5, 1) }, Bd: { value: new T.Vector2() }, m: { value: 0 }, fade: { value: 0 }, t: { value: 0 } };
      var S = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      S.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms: U, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: FS, depthTest: false, depthWrite: false })));
      gl = { R: R, S: S, cam: cam, U: U };
      if (!src) { initCSS(); return; }
      new T.TextureLoader().setCrossOrigin('anonymous').load(src, function (tx) { if (!gl) return; tx.minFilter = T.LinearFilter; tx.generateMipmaps = false; U.map.value = tx; U.ia.value = tx.image.width / Math.max(1, tx.image.height); ready = true; start(); }, undefined, function () { initCSS(); });
    }
    three().then(function () { if (!root.isConnected) return; try { initGL(); } catch (e) { initCSS(); } }).catch(function () { if (root.isConnected) initCSS(); });
    function close() {
      cancelAnimationFrame(raf); raf = 0; document.removeEventListener('keydown', key, true);
      if (gl) { try { if (gl.U.map.value) gl.U.map.value.dispose(); gl.R.dispose(); gl.R.forceContextLoss(); } catch (e) {} gl = null; }
      de.style.overflow = prevOv; root.style.opacity = '0'; setTimeout(function () { if (root.parentNode) root.parentNode.removeChild(root); }, 320);
      if (prevFocus && prevFocus.focus) try { prevFocus.focus({ preventScroll: true }); } catch (e) {}
    }
    function key(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { var f = [].slice.call(root.querySelectorAll('button')).filter(function (b) { return b.offsetParent !== null; }); if (!f.length) return; var a = f.indexOf(document.activeElement); if (e.shiftKey ? a <= 0 : a === f.length - 1) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); } }
    }
    document.addEventListener('keydown', key, true);
    x.addEventListener('click', close); back.addEventListener('click', close);
    again.addEventListener('click', function () { start(); x.focus(); });
    lead.addEventListener('click', function () { close(); if (o.onLead) o.onLead(); });
  }

  /* ---------- bucle, activación ---------- */
  var lastT = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    var t = now / 1000, dt = Math.min(.05, Math.max(0, t - (lastT || t))); lastT = t;
    tickStages(t);
    for (var i = scenes.length - 1; i >= 0; i--) {
      var s = scenes[i];
      if (!s.host.isConnected || (!A.on && !s.keep)) { s.dispose(); scenes.splice(i, 1); continue; }
      if (s.vis && !document.hidden) { try { s.frame(t, dt); } catch (e) { console.warn('[AQ3D]', e); s.dispose(); scenes.splice(i, 1); } }
    }
  }
  function teardown() {
    document.querySelectorAll('[data-aq-rv]').forEach(function (el) { el.removeAttribute('data-aq-rv'); if (io) io.unobserve(el); });
    scenes = scenes.filter(function (s) { if (s.keep) return true; s.dispose(); return false; });
    document.querySelectorAll('[data-aq3d="ciudad"],[data-aq3d-map]').forEach(function (h) { h._aq = 0; });
    stages.forEach(function (s) { s.style.transform = ''; s._rx = null; });
    untilt(cur); cur = null;
  }
  function set(c) { var was = A.on; A.on = c.on !== false; A.k = c.k || 1; if (was && !A.on) teardown(); else if (!was && A.on) scan(); }
  var pend = 0;
  function start() {
    new MutationObserver(function () { if (pend) return; pend = setTimeout(function () { pend = 0; scan(); }, 80); }).observe(document.body, { childList: true, subtree: true });
    scan(); requestAnimationFrame(loop);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
