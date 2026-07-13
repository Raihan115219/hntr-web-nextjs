// Multi-page navigation adapter (generated)
(function() {
  const PAGE_MAP = {
    home: 'index.html',
    vault: 'vault.html',
    pools: 'pools.html',
    pooldetail: 'pool-detail.html',
    membership: 'membership.html',
    network: 'network.html',
    collection: 'collection.html',
    learn: 'learn.html'
  };

  window.go = function(page) {
    const target = PAGE_MAP[page];
    if (!target) return;
    const currentFile = location.pathname.split('/').pop() || 'index.html';
    if (target === currentFile) return;
    if (page === 'home' && (currentFile === '' || currentFile === 'index.html')) return;
    location.href = target;
  };

  window.openLearn = function() { location.href = 'learn.html'; };
  window.closeLearn = function() {
    if (history.length > 1) history.back();
    else location.href = 'index.html';
  };

  document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page || 'home';
    document.querySelectorAll('.si[data-page]').forEach(function(si) {
      si.classList.toggle('active', si.dataset.page === page);
      const p = si.dataset.page;
      si.removeAttribute('onclick');
      si.style.cursor = 'pointer';
      si.addEventListener('click', function(e) {
        e.preventDefault();
        if (p === 'learn') openLearn();
        else go(p);
      });
    });

    document.querySelectorAll('.nav-brand').forEach(function(el) {
      el.removeAttribute('onclick');
      el.style.cursor = 'pointer';
      el.addEventListener('click', function() { go('home'); });
    });

    document.querySelectorAll('[onclick]').forEach(function(el) {
      const attr = el.getAttribute('onclick') || '';
      const goMatch = attr.match(/go\('([^']+)'\)/);
      if (goMatch) {
        const p = goMatch[1];
        el.removeAttribute('onclick');
        el.style.cursor = 'pointer';
        el.addEventListener('click', function() { go(p); });
      }
    });

    if (typeof onPageEnter === 'function') {
      try { onPageEnter(page); } catch (e) { console.warn('onPageEnter:', e); }
    }
  });
})();
