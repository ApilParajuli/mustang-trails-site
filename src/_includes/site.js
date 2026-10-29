(function () {
  var root = document.documentElement;

  // Theme toggle: light / dark, remembered per browser.
  var btn = document.getElementById("theme-toggle"), lbl = document.getElementById("theme-label");
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : !!(mq && mq.matches); }
  function sync() {
    var d = isDark();
    root.classList.toggle("is-dark", d);
    lbl.textContent = d ? "Dark" : "Light";
    btn.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode");
  }
  btn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("mt-theme", next); } catch (e) {}
    sync();
  });
  if (mq && mq.addEventListener) mq.addEventListener("change", sync);
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  sync();


  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Connecting dots behind the hero: drifting points joined by lines when close, reaching for the cursor.
  (function () {
    var c = document.getElementById("dots"); if (!c || !c.getContext) return;
    var g = c.getContext("2d"), hero = c.parentNode, pts = [], W = 0, H = 0, dpr = 1, mouse = null, running = false, raf = 0, col = {};
    var flagCols = ["--flag-blue", "--flag-red", "--flag-green", "--flag-yellow"];
    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      col.dot = "#8fe0aa";
      col.line = "#ffffff";
      col.flags = flagCols.map(function (k) { return cs.getPropertyValue(k).trim(); });
    }
    function size() {
      var r = hero.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(28, Math.min(90, Math.round(W * H / 14000)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: 1.4 + Math.random() * 1.8, f: Math.random() < 0.14 ? (i % 4) : -1
      });
    }
    function frame() {
      g.clearRect(0, 0, W, H);
      var link = Math.min(150, Math.max(100, W / 9)), i, j, a, b, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        a = pts[i];
        if (!reduce) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1;
          if (a.y < 0 || a.y > H) a.vy *= -1;
        }
        for (j = i + 1; j < pts.length; j++) {
          b = pts[j]; dx = a.x - b.x; dy = a.y - b.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < link) { g.globalAlpha = (1 - d / link) * 0.28; g.strokeStyle = col.line; g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        }
        if (mouse) {
          dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < link * 1.4) {
            g.globalAlpha = (1 - d / (link * 1.4)) * 0.7; g.strokeStyle = col.dot; g.lineWidth = 1.2;
            g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(mouse.x, mouse.y); g.stroke();
            if (!reduce) { a.x -= dx * 0.004; a.y -= dy * 0.004; }
          }
        }
      }
      for (i = 0; i < pts.length; i++) {
        a = pts[i]; g.globalAlpha = a.f >= 0 ? 0.95 : 0.7;
        g.fillStyle = a.f >= 0 ? col.flags[a.f] : col.dot;
        g.beginPath(); g.arc(a.x, a.y, a.f >= 0 ? a.r + 0.8 : a.r, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
      if (running && !reduce) raf = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    readColors(); size(); frame();
    if (!reduce) {
      if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(hero);
      else start();
      document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    }
    hero.addEventListener("pointermove", function (e) { var r = hero.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; if (reduce) frame(); });
    hero.addEventListener("pointerleave", function () { mouse = null; if (reduce) frame(); });
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { size(); frame(); }, 150); });
    new MutationObserver(function () { setTimeout(function () { readColors(); if (reduce || !running) frame(); }, 30); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
  })();

  // Count-up for the headline numbers, the first time they come into view.
  if (!reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, to = +el.getAttribute("data-count"), t0 = performance.now(), dur = 1400;
        (function tick(t) { var p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * k); if (p < 1) requestAnimationFrame(tick); })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  // Scroll reveal for content below the fold. Anything already on screen is left alone.
  if (!reduce && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll("section .section-head, section .prose, .stats, .loop, .card, .rules li, .carousel, .map-fig, form, .legend, .table-wrap");
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    var fold = window.innerHeight;
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < fold) return;
      var sib = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
      el.style.setProperty("--d", (Math.min(sib, 5) * 0.08) + "s");
      el.classList.add("reveal"); rio.observe(el);
    });
    // Safety: never leave anything hidden if the observer doesn't fire.
    setTimeout(function () { document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in"); }); }, 2500);
  }


  // Gallery filters and lightbox
  (function () {
    var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile"));
    var chips = document.querySelectorAll(".chip-btn");
    var car = document.getElementById("carousel"), prev = document.getElementById("car-prev"), next = document.getElementById("car-next");
    function perView() { var t = visible()[0]; return t ? Math.max(1, Math.round(car.clientWidth / (t.getBoundingClientRect().width + 14))) : 1; }
    function sync() {
      var v = visible(), n = v.length, max = car.scrollWidth - car.clientWidth;
      prev.disabled = car.scrollLeft <= 4; next.disabled = car.scrollLeft >= max - 4;
      var w = v[0] ? v[0].getBoundingClientRect().width + 14 : 1, first = Math.min(n, Math.round(car.scrollLeft / w) + 1), last = Math.min(n, first + perView() - 1);
      document.getElementById("car-count").textContent = (first === last ? first : first + "–" + last) + " of " + n;
      var bar = document.getElementById("car-bar"), frac = car.clientWidth / Math.max(car.scrollWidth, 1);
      bar.style.width = (frac * 100) + "%"; bar.style.marginLeft = (max > 0 ? (car.scrollLeft / max) * (1 - frac) * 100 : 0) + "%";
    }
    function page(d) { car.scrollBy({ left: d * car.clientWidth, behavior: reduce ? "auto" : "smooth" }); }
    prev.addEventListener("click", function () { page(-1); });
    next.addEventListener("click", function () { page(1); });
    car.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); page(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); page(-1); } });
    var st; car.addEventListener("scroll", function () { cancelAnimationFrame(st); st = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener("resize", sync);
    if (document.readyState === "complete") sync(); else window.addEventListener("load", sync);
    sync();
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var f = c.getAttribute("data-filter");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        tiles.forEach(function (t) { t.hidden = !(f === "all" || t.getAttribute("data-cat") === f); });
        car.scrollTo({ left: 0, behavior: "instant" }); setTimeout(sync, 50);
      });
    });
    var lb = document.getElementById("lightbox"), img = document.getElementById("lb-img"), cap = document.getElementById("lb-cap"), cur = 0, lastFocus = null;
    function visible() { return tiles.filter(function (t) { return !t.hidden; }); }
    function show(tile) {
      var b = tile.querySelector(".tile-btn");
      img.src = b.getAttribute("data-full"); img.alt = tile.querySelector("img").alt; cap.textContent = b.getAttribute("data-cap");
      cur = visible().indexOf(tile);
    }
    function step(d) { var v = visible(); if (!v.length) return; show(v[(cur + d + v.length) % v.length]); }
    function open(tile) { lastFocus = document.activeElement; show(tile); lb.hidden = false; document.body.style.overflow = "hidden"; document.getElementById("lb-close").focus(); }
    function close() { lb.hidden = true; img.removeAttribute("src"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    tiles.forEach(function (t) { t.querySelector(".tile-btn").addEventListener("click", function () { open(t); }); });
    document.getElementById("lb-close").addEventListener("click", close);
    document.getElementById("lb-prev").addEventListener("click", function () { step(-1); });
    document.getElementById("lb-next").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
    });
    var x0 = null;
    lb.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    lb.addEventListener("pointerup", function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
  })();

  // Prayer flags strung along a sagging cord, in the traditional order.
  var order = ["fb", "fw", "fr", "fg", "fy"];
  document.querySelectorAll("[data-flags]").forEach(function (svg, k) {
    var ns = "http://www.w3.org/2000/svg", n = 30, w = 1200, sag = 26;
    var cord = document.createElementNS(ns, "path");
    cord.setAttribute("class", "cord");
    cord.setAttribute("d", "M0 6 Q" + w / 2 + " " + (6 + sag * 2) + " " + w + " 6");
    svg.appendChild(cord);
    for (var i = 0; i < n; i++) {
      var x = (i + 0.5) * (w / n), t = x / w, y = 6 + sag * 4 * t * (1 - t);
      var r = document.createElementNS(ns, "rect");
      r.setAttribute("x", (x - 13).toFixed(1)); r.setAttribute("y", y.toFixed(1));
      r.setAttribute("width", "26"); r.setAttribute("height", "30");
      r.setAttribute("class", "f " + order[i % 5]);
      r.style.animationDelay = (-((i * 0.37 + k) % 3.2)).toFixed(2) + "s";
      svg.appendChild(r);
    }
  });


  document.getElementById("yr").textContent = new Date().getFullYear();

  // Contact details come from the control panel (src/_data/site.json), filled in at build time.
  var CONTACT_EMAIL = window.MT_CONFIG.email, CONTACT_PHONE = window.MT_CONFIG.phone;
  // FormSubmit delivers form messages to this inbox. After the first message, it sends
  // a one-time "Activate" email there; click it once and every later message arrives.
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;

  var sform = document.getElementById("signup-form"), snote = document.getElementById("signup-note"), ssend = document.getElementById("s-send");
  sform.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!sform.checkValidity()) { snote.textContent = "Please enter a valid email."; return; }
    ssend.disabled = true; snote.textContent = "Signing you up…";
    fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email: sform.elements["email"].value, _subject: "Mustang Trails: new email sign-up", _template: "table", _captcha: "false" }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== "true") throw 0; }); })
      .then(function () { snote.textContent = "You're on the list. We'll be in touch."; sform.reset(); })
      .catch(function () { snote.textContent = "That didn't go through. Email " + CONTACT_EMAIL + " to sign up."; })
      .then(function () { ssend.disabled = false; });
  });

  var form = document.getElementById("contact-form"), note = document.getElementById("form-note"), send = document.getElementById("c-send");
  function say(msg, cls) { note.textContent = msg; note.className = "form-note" + (cls ? " " + cls : ""); }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!form.checkValidity()) { say("Please fill in your name, a valid email and a message.", "err"); return; }
    if (form.elements["_honey"].value) return;
    var data = {
      name: form.elements["name"].value, email: form.elements["email"].value, phone: form.elements["phone"].value,
      topic: form.elements["topic"].value, message: form.elements["message"].value,
      _subject: "Mustang Trails website: " + form.elements["topic"].value, _replyto: form.elements["email"].value, _template: "table", _captcha: "false"
    };
    send.disabled = true; say("Sending…");
    fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== "true") throw new Error(j.message || "Send failed"); }); })
      .then(function () { say("Thanks, your message was sent. We'll get back to you soon.", "ok"); form.reset(); })
      .catch(function () { say("That didn't go through. Please call " + CONTACT_PHONE + " or email " + CONTACT_EMAIL + ".", "err"); })
      .then(function () { send.disabled = false; });
  });
})();
