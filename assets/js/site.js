/* Calvin's Tech Support - site.js
   No dependencies, no network calls, no tracking. ES5 syntax so it runs on older phones.
   Theme state lives in the inline boot script (window.CTS); this file only wires up the UI.
   Everything here is progressive enhancement: the site is readable and navigable without it. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js-ready');
  root.classList.remove('js-failed'); /* the 3s fallback may have fired on a slow connection; we are running now */

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt); }

  /* ---------- Sticky header: subtle border/shadow after scrolling (height never changes, so no layout shift) ---------- */
  var hdr = $('[data-header]');
  if (hdr) {
    var ticking = false;
    var updHdr = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; };
    on(window, 'scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(updHdr); } }, { passive: true });
    updHdr();
  }

  /* ---------- Dialog helpers (native <dialog>: focus trap, Esc and inert background come for free) ---------- */
  function openDlg(d, opener) {
    if (!d || d.open) return;
    d._opener = opener || doc.activeElement;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  function closeDlg(d) {
    if (!d || !d.open) return;
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }
  $$('dialog').forEach(function (d) {
    on(d, 'close', function () {
      var o = d._opener;
      if (o && doc.contains(o)) { try { o.focus(); } catch (e) { /* ignore */ } }
    });
    on(d, 'click', function (e) { if (e.target === d) closeDlg(d); }); /* click on backdrop */
    $$('[data-close]', d).forEach(function (b) { on(b, 'click', function () { closeDlg(d); }); });
  });

  /* ---------- Mobile drawer ---------- */
  var drawer = $('[data-drawer]');
  $$('[data-open-drawer]').forEach(function (b) { on(b, 'click', function () { openDlg(drawer, b); }); });
  if (drawer) {
    $$('a', drawer).forEach(function (a) { on(a, 'click', function () { closeDlg(drawer); }); });
    on(window, 'resize', function () { if (drawer.open && window.innerWidth > 1040) closeDlg(drawer); });
  }

  /* ---------- Display settings + theme UI (state itself is in window.CTS from the inline boot script) ---------- */
  var settings = $('[data-settings]');
  function syncTheme() {
    if (!window.CTS) return;
    var t = window.CTS.theme(), m = window.CTS.mode();
    $$('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      b.setAttribute('title', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    $$('input[name="theme"]', settings || doc).forEach(function (r) { r.checked = (r.value === m); });
    var mo = $('input[name="motion"]', settings || doc);
    if (mo) mo.checked = window.CTS.reduced();
  }
  doc.addEventListener('cts:theme', syncTheme);
  $$('[data-theme-toggle]').forEach(function (b) {
    on(b, 'click', function () { if (window.CTS) window.CTS.setMode(window.CTS.theme() === 'dark' ? 'light' : 'dark'); });
  });
  $$('input[name="theme"]', settings || doc).forEach(function (r) {
    on(r, 'change', function () { if (r.checked && window.CTS) window.CTS.setMode(r.value); });
  });
  on($('input[name="motion"]', settings || doc), 'change', function (e) { if (window.CTS) window.CTS.setReduced(e.target.checked); });
  $$('[data-open-settings]').forEach(function (b) {
    on(b, 'click', function () {
      var opener = b;
      if (drawer && drawer.open) { closeDlg(drawer); opener = $('[data-open-drawer]') || b; }
      syncTheme();
      openDlg(settings, opener);
    });
  });
  syncTheme();

  /* ---------- Scroll reveals + process trace (IntersectionObserver; content is visible if it is unavailable) ---------- */
  var revealEls = $$('[data-reveal], [data-trace]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
    var hero = $('[data-hero]');
    if (hero) {
      new IntersectionObserver(function (es) { hero.classList.toggle('is-offscreen', !es[0].isIntersecting); }).observe(hero);
    }
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Home: job card ---------- */
  var jc = $('[data-jobcard]');
  if (jc) {
    var jcChips = $$('[data-panel]', jc), jcPanels = $$('[data-panel-id]', jc), jcWa = $('[data-jc-wa]', jc);
    var showPanel = function (slug) {
      jcPanels.forEach(function (p) {
        var isOn = p.getAttribute('data-panel-id') === slug;
        p.classList.remove('is-fresh');
        p.classList.toggle('is-on', isOn);
        if (isOn) { void p.offsetWidth; p.classList.add('is-fresh'); if (jcWa) jcWa.href = p.getAttribute('data-wa'); }
      });
      jcChips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-panel') === slug ? 'true' : 'false'); });
    };
    jcChips.forEach(function (c) { on(c, 'click', function () { showPanel(c.getAttribute('data-panel')); }); });
  }

  /* ---------- Filters (services, gallery) ---------- */
  var nouns = { services: ['service', 'services'], gallery: ['photo', 'photos'] };
  $$('[data-filter-group]').forEach(function (group) {
    var list = $('[data-filter-list]');
    if (!list) return;
    var items = $$('[data-tags]', list), btns = $$('[data-filter]', group), count = $('[data-count]');
    var noun = nouns[group.getAttribute('data-filter-group')] || ['item', 'items'];
    var apply = function (key) {
      var n = 0;
      items.forEach(function (it) {
        var show = key === 'all' || (it.getAttribute('data-tags') || '').split(' ').indexOf(key) > -1;
        it.hidden = !show; if (show) n++;
      });
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === key ? 'true' : 'false'); });
      if (count) count.textContent = n + ' ' + (n === 1 ? noun[0] : noun[1]) + ' shown';
    };
    btns.forEach(function (b) { on(b, 'click', function () { apply(b.getAttribute('data-filter')); }); });
    apply('all');
  });

  /* ---------- Problems: search ---------- */
  var si = $('[data-search-input]');
  if (si) {
    var pItems = $$('.problem-item'), pCount = $('[data-count]'), pEmpty = $('[data-empty]');
    var runSearch = function () {
      var terms = si.value.trim().toLowerCase().split(/\s+/).filter(Boolean), n = 0;
      pItems.forEach(function (it) {
        var hay = it.getAttribute('data-search') || '';
        var ok = terms.every(function (t) { return hay.indexOf(t) > -1; });
        it.hidden = !ok; if (ok) n++;
      });
      if (pCount) pCount.textContent = n + (n === 1 ? ' problem' : ' problems') + ' shown';
      if (pEmpty) pEmpty.hidden = n !== 0;
    };
    on(si, 'input', runSearch); runSearch();
  }

  /* ---------- Deep links open the matching <details> (problems, FAQ) ---------- */
  function openFromHash() {
    var id = ''; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { return; }
    if (!id) return;
    var el = doc.getElementById(id);
    if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView(); }
  }
  on(window, 'hashchange', openFromHash); openFromHash();

  /* ---------- FAQ: expand / collapse all ---------- */
  $$('[data-faq-all]').forEach(function (b) {
    on(b, 'click', function () {
      var open = b.getAttribute('data-faq-all') === 'open';
      $$('details.faq').forEach(function (d) { d.open = open; });
    });
  });

  /* ---------- Diagnostics: example report tabs ---------- */
  var tabs = $$('[data-report-tab]');
  if (tabs.length) {
    var reports = $$('[data-report]');
    tabs.forEach(function (t) {
      on(t, 'click', function () {
        var id = t.getAttribute('data-report-tab');
        reports.forEach(function (r) { r.hidden = r.getAttribute('data-report') !== id; });
        tabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
      });
    });
  }

  /* ---------- Gallery lightbox (links to the image file work without JS) ---------- */
  var lb = $('[data-lightbox-dialog]');
  if (lb) {
    var lbImg = $('[data-lb-img]', lb), lbCap = $('[data-lb-cap]', lb), lbCnt = $('[data-lb-count]', lb);
    var lbList = [], lbIdx = 0;
    var lbRender = function () {
      var a = lbList[lbIdx], th = $('img', a);
      lbImg.src = a.getAttribute('href'); lbImg.alt = th ? th.alt : '';
      lbCap.textContent = a.getAttribute('data-caption') || '';
      lbCnt.textContent = (lbIdx + 1) + ' of ' + lbList.length;
    };
    var lbStep = function (d) { lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbRender(); };
    on(doc, 'click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-lightbox]') : null;
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      lbList = $$('.gal-item:not([hidden]) [data-lightbox]');
      lbIdx = Math.max(0, lbList.indexOf(a)); lbRender();
      openDlg(lb, a);
    });
    on($('[data-lb-prev]', lb), 'click', function () { lbStep(-1); });
    on($('[data-lb-next]', lb), 'click', function () { lbStep(1); });
    on(lb, 'keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); lbStep(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); lbStep(1); }
    });
  }

  /* ---------- Copy helpers ---------- */
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) {
      var ta = doc.createElement('textarea'), ok = false;
      ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      doc.body.appendChild(ta); ta.select();
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      doc.body.removeChild(ta);
      if (ok) res(); else rej();
    });
  }
  $$('[data-copy]').forEach(function (b) {
    var lab = $('[data-copy-label]', b), st = $('[data-copy-status]');
    on(b, 'click', function () {
      copyText(b.getAttribute('data-copy')).then(function () {
        if (lab) lab.textContent = 'Copied';
        if (st) st.textContent = 'Number copied to your clipboard.';
        setTimeout(function () { if (lab) lab.textContent = 'Copy number'; }, 2500);
      }, function () { if (st) st.textContent = 'Could not copy automatically. The number is ' + b.getAttribute('data-copy') + '.'; });
    });
  });

  /* ---------- Contact: WhatsApp request builder ---------- */
  var form = $('[data-builder]');
  if (form) {
    var num = form.getAttribute('data-wa-number'), preview = $('[data-preview]', form), status = $('[data-status]', form);

    /* Trim, strip control and bidi-override characters, collapse whitespace, cap length. */
    var clean = function (s, max) {
      s = String(s == null ? '' : s);
      try { s = s.normalize('NFC'); } catch (e) { /* old browsers */ }
      s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u00AD\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g, '');
      s = s.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      return s.slice(0, max);
    };
    /* encodeURIComponent throws on lone surrogates (malformed input), so fall back to stripping surrogates. */
    var enc = function (s) {
      try { return encodeURIComponent(s); } catch (e) { return encodeURIComponent(s.replace(/[\uD800-\uDFFF]/g, '')); }
    };
    var val = function (n, max) { var el = form.elements[n]; return el ? clean(el.value, max || 120) : ''; };
    var radio = function (n) { var el = form.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; };

    var build = function () {
      var lines = ['Hi Calvin, I need tech support.', ''];
      var name = val('name', 60), dev = radio('device'), model = val('model', 80), pt = val('ptype'), prob = val('problem', 1000), area = val('area'), timing = radio('timing');
      if (name) lines.push('Name: ' + name);
      if (dev) lines.push('Device: ' + dev + (model ? ' (' + model + ')' : '')); else if (model) lines.push('Device: ' + model);
      if (pt) lines.push('Problem type: ' + pt);
      if (prob) lines.push('Problem: ' + prob);
      if (area) lines.push('Area: ' + area);
      if (timing) lines.push('Timing: ' + timing);
      lines.push('', 'I can send photos or a short video if that helps.');
      return lines.join('\n');
    };
    var refresh = function () { preview.textContent = build(); };

    var setErr = function (inputs, errEl, bad) {
      if (errEl) errEl.hidden = !bad;
      inputs.forEach(function (i) { if (bad) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); });
    };
    var validate = function () {
      var devOk = !!radio('device'), probOk = val('problem', 1000).length >= 3, first = null;
      setErr($$('input[name="device"]', form), $('#err-device', form), !devOk);
      setErr([form.elements.problem], $('#err-problem', form), !probOk);
      if (!devOk) first = $('input[name="device"]', form); else if (!probOk) first = form.elements.problem;
      if (first) { first.focus(); status.textContent = 'Please fix the highlighted field and try again.'; return false; }
      return true;
    };

    on(form, 'input', function () { refresh(); status.textContent = ''; });
    on(form, 'change', function () { refresh(); });
    on(form, 'submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      var url = 'https://wa.me/' + num + '?text=' + enc(build());
      var w = null;
      try { w = window.open(url, '_blank'); } catch (err) { w = null; }
      status.textContent = '';
      if (w) {
        try { w.opener = null; } catch (err2) { /* ignore */ }
        status.textContent = 'WhatsApp opened in a new tab. Check the message there and press send.';
      } else {
        /* pop-up blocked: give a real link and the copy option */
        status.textContent = 'Your browser blocked the pop-up. ';
        var a = doc.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open WhatsApp';
        status.appendChild(a);
        status.appendChild(doc.createTextNode(', or use Copy message and paste it into WhatsApp.'));
      }
    });
    on($('[data-copy-message]', form), 'click', function () {
      if (!validate()) return;
      copyText(build()).then(function () { status.textContent = 'Message copied. Paste it into WhatsApp and press send.'; },
        function () { status.textContent = 'Could not copy automatically. Select the message above and copy it.'; });
    });
    refresh();
  }
})();
