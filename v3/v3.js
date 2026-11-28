// Projects track: counter and prev/next buttons.
(function () {
  var track = document.getElementById('track');
  if (!track) return;
  var cards = track.querySelectorAll('.card');
  var cur = document.getElementById('cur');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var index = 0;
  function show(i) {
    index = Math.max(0, Math.min(cards.length - 1, i));
    cur.textContent = String(index + 1).padStart(2, '0');
    prev.disabled = index === 0;
    next.disabled = index === cards.length - 1;
  }
  function go(i) {
    if (track.__go) return track.__go(i);
    var c = cards[Math.max(0, Math.min(cards.length - 1, i))];
    track.scrollTo({ left: c.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }
  if ('IntersectionObserver' in window) {
    var io = track.__io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) show(Array.prototype.indexOf.call(cards, e.target));
      });
    }, { root: track, threshold: 0.6 });
    cards.forEach(function (c) { io.observe(c); });
  }
  prev.addEventListener('click', function () { go(index - 1); });
  next.addEventListener('click', function () { go(index + 1); });
  track.__show = show;
  show(0);
})();

// Brand logos: swap one slot at a time so all ten brands appear.
(function () {
  var ul = document.querySelector('.clients ul[data-rotate]');
  if (!ul || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var data = {
    'qualcomm': [55, 21], 'unitedhealthcare': [94, 30], 'audi': [106, 26], 'coca-cola': [94, 30],
    'microsoft': [64, 24], 'red-bull': [72, 23], 'walmart': [71, 22], 'vodafone': [75, 24],
    'siemens': [48, 17], 'sonae': [85, 24]
  };
  var slots = Array.prototype.slice.call(ul.children);
  var shown = ['qualcomm', 'unitedhealthcare', 'audi', 'coca-cola', 'microsoft', 'red-bull'];
  var queue = ['walmart', 'vodafone', 'siemens', 'sonae'];
  var order = [0, 4, 2, 5, 1, 3], step = 0, timer = null, visible = false;
  var base = slots[0].querySelector('img').src.replace(/[^/]+$/, '');
  queue.forEach(function (n) { var i = new Image(); i.src = base + n + '.webp'; });
  function swap() {
    var s = order[step++ % order.length], li = slots[s], img = li.querySelector('img');
    var next = queue.shift(); queue.push(shown[s]); shown[s] = next;
    li.classList.add('out');
    setTimeout(function () {
      img.src = base + next + '.webp';
      img.height = data[next][0];
      li.style.setProperty('--h', data[next][1]);
      li.classList.add('pre');
      li.classList.remove('out');
      void img.offsetWidth; // commit the start position below the slot before sliding up
      li.classList.remove('pre');
    }, 420);
  }
  function run() {
    var go = visible && !document.hidden;
    if (go && !timer) timer = setInterval(swap, 2600);
    if (!go && timer) { clearInterval(timer); timer = null; }
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; run(); }).observe(ul);
  document.addEventListener('visibilitychange', run);
})();

// "About" links land on the section's content, not on its top padding.
(function () {
  var about = document.getElementById('about');
  if (!about) return;
  var label = about.querySelector('.label');
  document.querySelectorAll('a[href="#about"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var y = label.getBoundingClientRect().top + window.scrollY - 32;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#about');
    });
  });
})();

// Motion: reveals, count-up, hero parallax and curtain, pinned projects, scrubbed headings.
(function () {
  if (!('IntersectionObserver' in window)) return;
  var root = document.documentElement;
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var desktop = mq('(min-width: 901px)');
  var fancy = !reduce;
  var vh = window.innerHeight;
  var $ = function (s) { return document.querySelector(s); };

  // ---- reveals -----------------------------------------------------------
  // [selector, type, delay(s), rise]
  var plan = [
    ['.statement', 'lines', 0], ['.lead', 'bar', 120, 16], ['.nums > div', '', [200, 260, 300], 14], ['.about-side', 'side', 160],
    ['.work .head h2', 'clip', 0], ['.work .aside', '', 140, 12], ['.track', '', 80, 24],
    ['.path .aside', '', 140, 12], ['.steps > li', 'row', 0], ['.beyond-head', '', 0, 16], ['.beyond-cols > div', '', [80, 150, 200], 18],
    ['#answers-h', 'clip', 0], ['.faq details', 'faq', 0]
  ];
  var items = [];
  plan.forEach(function (p) {
    Array.prototype.forEach.call(document.querySelectorAll(p[0]), function (el, i) {
      if (el.getBoundingClientRect().top < vh) return; // already on screen: leave it alone
      var type = fancy ? p[1] : '';
      if (type === 'lines') {
        Array.prototype.forEach.call(el.children, function (ln) {
          var inner = document.createElement('span');
          inner.className = 'ln-i';
          while (ln.firstChild) inner.appendChild(ln.firstChild);
          ln.appendChild(inner);
          ln.classList.add('ln');
        });
      }
      if (type === 'faq') {
        var sum = el.querySelector('summary'), q = document.createElement('span'), qi = document.createElement('span');
        q.className = 'q'; qi.className = 'q-i';
        while (sum.firstChild) qi.appendChild(sum.firstChild);
        q.appendChild(qi); sum.appendChild(q);
      }
      el.setAttribute('data-r', type);
      var d = Array.isArray(p[2]) ? p[2][Math.min(i, p[2].length - 1)] : p[2];
      if (d) el.style.setProperty('--d', d + 'ms');
      if (p[3]) el.style.setProperty('--y', p[3] + 'px');
      items.push(el);
    });
  });
  root.classList.add('js-motion');

  function count(dt) {
    var m = /^(\d+)(\+?)$/.exec(dt.textContent.trim());
    if (!m || +m[1] < 10 || reduce) return;
    var end = +m[1], suffix = m[2], t0 = null, dur = 1100;
    dt.style.minWidth = dt.offsetWidth + 'px';
    function frame(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      dt.textContent = Math.round(end * e) + suffix;
      if (k < 1) requestAnimationFrame(frame);
    }
    dt.textContent = '0' + suffix;
    requestAnimationFrame(frame);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      io.unobserve(el);
      var dt = el.parentNode && el.parentNode.classList.contains('nums') && el.querySelector('dt');
      if (dt) setTimeout(function () { count(dt); }, parseInt(el.style.getPropertyValue('--d') || 0, 10));
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  items.forEach(function (el) { io.observe(el); });

  // ---- FAQ: animate open height where the browser can ----------------------
  if (fancy && window.CSS && CSS.supports('interpolate-size', 'allow-keywords')) root.classList.add('fx-acc');

  if (!fancy || !desktop) return;

  // ---- scroll-linked effects (desktop, motion allowed) ---------------------
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var stage = $('.stage'), stack = $('.stack'), photo = $('.photo'), ghost = $('.ghost'), hero = $('.hero');
  var pathH = $('#path-h'), pathEm = pathH && pathH.querySelector('em');
  var contactH = $('.contact h2');
  var work = $('.work'), track = document.getElementById('track');
  var curtain = false, pin = null, mx = 0, my = 0, tx = 0, ty = 0, ticking = false;

  function setupCurtain() {
    curtain = !!stage && stage.offsetHeight <= window.innerHeight + 1;
    root.classList.toggle('fx-curtain', curtain);
  }

  function setupPin() {
    if (!work || !track) return;
    var cards = track.querySelectorAll('.card');
    if (window.innerHeight < 680 || cards.length < 2) { root.classList.remove('fx-pin'); pin = null; work.style.height = ''; track.style.transform = ''; return; }
    if (!work.querySelector('.pin')) {
      var wrap = document.createElement('div');
      wrap.className = 'pin';
      while (work.firstChild) wrap.appendChild(work.firstChild);
      work.appendChild(wrap);
      var bar = document.createElement('span');
      bar.className = 'bar-p';
      bar.setAttribute('aria-hidden', 'true');
      bar.appendChild(document.createElement('i'));
      work.querySelector('.ctrl').appendChild(bar);
      if (track.__io) track.__io.disconnect();
      track.removeAttribute('tabindex');
      track.addEventListener('focusin', function (e) {
        if (e.target.closest && e.target.closest('.shots')) return;
        var c = e.target.closest && e.target.closest('.card');
        if (c && pin) window.scrollTo(0, pin.top + pin.len * Array.prototype.indexOf.call(cards, c) / (cards.length - 1));
      });
      track.__go = function (i) {
        i = Math.max(0, Math.min(cards.length - 1, i));
        window.scrollTo({ top: pin.top + pin.len * i / (cards.length - 1), behavior: 'smooth' });
      };
    }
    root.classList.add('fx-pin');
    track.style.transform = '';
    work.style.height = '';
    var last = cards[cards.length - 1].getBoundingClientRect();
    var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    var dist = Math.max(0, Math.round(last.right + pad - window.innerWidth));
    var len = Math.max(dist, Math.round((cards.length - 1) * 0.75 * window.innerHeight));
    work.style.height = (window.innerHeight + len) + 'px';
    pin = { top: work.getBoundingClientRect().top + window.scrollY, dist: dist, len: len, n: cards.length, bar: work.querySelector('.bar-p i'), idx: -1 };
  }

  function render() {
    ticking = false;
    var y = window.scrollY, h = window.innerHeight;
    // reads
    var pr = pathH ? pathH.getBoundingClientRect() : null;
    var cr = contactH ? contactH.getBoundingClientRect() : null;
    // hero: pointer drift + scroll parallax under the curtain
    tx += (mx - tx) * 0.12; ty += (my - ty) * 0.12;
    var p = curtain ? clamp(y / stage.offsetHeight) : 0;
    if (y < stage.offsetHeight + 40) {
      if (ghost) ghost.style.transform = 'translate3d(' + (tx * -18 - p * 90).toFixed(1) + 'px,' + (ty * -8).toFixed(1) + 'px,0)';
      if (photo) photo.style.transform = 'translateX(-50%) translate3d(' + (tx * 10).toFixed(1) + 'px,' + (ty * 5 + p * 70).toFixed(1) + 'px,0) scale(' + (1 + p * 0.05).toFixed(4) + ')';
      if (stack) { stack.style.transform = 'translate3d(' + (tx * -4).toFixed(1) + 'px,' + (p * -110).toFixed(1) + 'px,0)'; stack.style.opacity = (1 - p * 1.25).toFixed(3); }
    }
    // projects: vertical scroll drives the horizontal track
    if (pin) {
      var q = pin.len ? clamp((y - pin.top) / pin.len) : 0;
      track.style.transform = 'translate3d(' + (-q * pin.dist).toFixed(1) + 'px,0,0)';
      pin.bar.style.transform = 'scaleX(' + q.toFixed(4) + ')';
      var idx = Math.round(q * (pin.n - 1));
      if (idx !== pin.idx && track.__show) { pin.idx = idx; track.__show(idx); }
    }
    // path heading: the two lines meet as the section arrives
    if (pr && pr.top < h * 1.2 && pr.bottom > -h * 0.2) {
      var a = easeOut(clamp(1 - (pr.top - h * 0.3) / (h * 0.7)));
      pathH.style.transform = 'translate3d(' + ((1 - a) * -90).toFixed(1) + 'px,0,0)';
      if (pathEm) pathEm.style.transform = 'translate3d(' + ((1 - a) * 260).toFixed(1) + 'px,0,0)';
    }
    // contact: the headline grows into place
    if (cr && cr.top < h * 1.2) {
      var b = easeOut(clamp(1 - (cr.top - h * 0.25) / (h * 0.75)));
      contactH.style.transform = 'scale(' + (0.78 + 0.22 * b).toFixed(4) + ')';
      contactH.style.opacity = (0.25 + 0.75 * b).toFixed(3);
    }
    if (Math.abs(mx - tx) > 0.002 || Math.abs(my - ty) > 0.002) request();
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }

  function setup() { setupCurtain(); setupPin(); request(); }
  root.classList.add('fx');
  setup();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', setup);
  window.addEventListener('load', setup);
  if (hero && mq('(hover: hover) and (pointer: fine)')) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
      request();
    });
    hero.addEventListener('pointerleave', function () { mx = 0; my = 0; request(); });
  }
})();

(function () {
  var menu = document.getElementById('menu'), open = document.querySelector('.bar .burger');
  if (!menu || !open) return;
  var close = menu.querySelector('.burger'), root = document.documentElement, t;
  [].forEach.call(menu.querySelectorAll('nav a'), function (a, i) { a.style.setProperty('--i', i); a.addEventListener('click', function () { set(false, true); }); });
  function set(on, silent) {
    clearTimeout(t);
    open.setAttribute('aria-expanded', on);
    root.classList.toggle('menu-on', on);
    if (on) { menu.hidden = false; menu.offsetWidth; menu.classList.add('on'); close.focus(); }
    else { menu.classList.remove('on'); t = setTimeout(function () { menu.hidden = true; }, 600); if (!silent) open.focus(); }
  }
  open.addEventListener('click', function () { set(true); });
  close.addEventListener('click', function () { set(false); });
  document.addEventListener('keydown', function (e) {
    if (!menu.classList.contains('on')) return;
    if (e.key === 'Escape') set(false);
    if (e.key === 'Tab') {
      var f = menu.querySelectorAll('button,a'), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  if (window.matchMedia) window.matchMedia('(min-width:721px)').addEventListener('change', function (e) { if (e.matches && menu.classList.contains('on')) set(false, true); });
})();

// Screenshot sliders inside a project card: several screens in one window.
(function () {
  var sliders = document.querySelectorAll('[data-shots]');
  Array.prototype.forEach.call(sliders, function (el) {
    var imgs = el.querySelectorAll('.win img');
    var nav = el.querySelector('.shots');
    if (!nav || imgs.length < 2) return;
    var cap = nav.querySelector('.shots-cap');
    var btns = nav.querySelectorAll('button');
    var index = 0;
    function show(i) {
      index = (i + imgs.length) % imgs.length;
      Array.prototype.forEach.call(imgs, function (img, n) { img.classList.toggle('on', n === index); });
      cap.textContent = '';
      cap.appendChild(document.createTextNode(imgs[index].getAttribute('data-cap') || ''));
      var b = document.createElement('b');
      b.textContent = (index + 1) + ' / ' + imgs.length;
      cap.appendChild(b);
    }
    // The other screens are lazy; fetch them once the first one is asked for.
    function warm() { Array.prototype.forEach.call(imgs, function (img) { img.loading = 'eager'; }); }
    btns[0].addEventListener('click', function () { warm(); show(index - 1); });
    btns[1].addEventListener('click', function () { warm(); show(index + 1); });
    nav.hidden = false;
    show(0);
  });
})();
