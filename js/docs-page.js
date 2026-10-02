(function () {
  'use strict';
  var docKey = (document.body && document.body.getAttribute('data-doc')) || 'help';
  var catalog = null;
  var pdfMap = { help: 'docs/ZAZISE-Help.pdf', privacy: 'docs/ZAZISE-Privacy.pdf', terms: 'docs/ZAZISE-Terms.pdf' };
  function lang() { return (window.ZaziseI18n && window.ZaziseI18n.getLang) ? window.ZaziseI18n.getLang() : 'en'; }
  function pack(code) {
    if (!catalog) return null;
    var c = code || lang();
    if (catalog[c] && catalog[c][docKey]) return { root: catalog[c], page: catalog[c][docKey], code: c };
    if (catalog.en && catalog.en[docKey]) return { root: catalog.en, page: catalog.en[docKey], code: 'en' };
    return null;
  }
  function setText(sel, val) { var el = document.querySelector(sel); if (!el || val == null) return; el.textContent = val; }
  function applyShared(root) {
    if (!root) return;
    setText('[data-docs="download_pdf"]', root.download_pdf);
    setText('[data-docs="footer_copy"]', root.footer_copy);
    setText('[data-docs="back_register"]', root.back_register);
    setText('[data-docs="nav_help"]', root.nav_help);
    setText('[data-docs="nav_privacy"]', root.nav_privacy);
    setText('[data-docs="nav_terms"]', root.nav_terms);
    var a = document.querySelector('.docs-download');
    if (a && pdfMap[docKey]) a.setAttribute('href', pdfMap[docKey]);
  }
  function applyPage(page) {
    if (!page) return;
    if (page.page_title) document.title = page.page_title;
    setText('[data-docs="meta"]', page.meta);
    setText('[data-docs="meta_sub"]', page.meta_sub);
    setText('[data-docs="badge"]', page.badge);
    setText('[data-docs="h1"]', page.h1);
    setText('[data-docs="lede"]', page.lede);
    document.querySelectorAll('[data-docs-key]').forEach(function (el) {
      var key = el.getAttribute('data-docs-key');
      if (key && page[key] != null) el.textContent = page[key];
    });
  }
  function render() {
    var p = pack();
    if (!p) return;
    applyShared(p.root);
    applyPage(p.page);
    document.querySelectorAll('.docs-nav a').forEach(function (a) {
      var k = a.getAttribute('data-doc-nav');
      a.classList.toggle('is-active', k === docKey);
    });
  }
  async function boot() {
    try {
      var res = await fetch('i18n/docs.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('docs.json missing');
      catalog = await res.json();
    } catch (e) { catalog = null; }
    if (window.ZaziseI18n && window.ZaziseI18n.load) {
      try { await window.ZaziseI18n.load(); } catch (e) {}
    }
    render();
    document.addEventListener('zazise:lang', render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
