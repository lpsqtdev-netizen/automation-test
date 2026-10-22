(() => {
  const SELECTORS = ['[data-testid="item-box"]','[data-testid^="product-item-id-"]','.feed-grid__item'];
  const clean = s => (s || '').replace(/\s+/g,' ').trim();
  const parsePrice = text => {
    const m = clean(text).match(/(\d[\d\s.,]*)\s*€/);
    if (!m) return null;
    const normalized = m[1].replace(/\s/g,'').replace(/,(?=\d{1,2}$)/,'.').replace(/\.(?=\d{3}(?:\D|$))/g,'');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  };
  function collect() {
    const nodes = [...new Set(SELECTORS.flatMap(s => [...document.querySelectorAll(s)]))];
    return nodes.map(el => {
      const link = el.querySelector('a[href*="/items/"]') || el.querySelector('a[href]');
      const img = el.querySelector('img');
      const text = clean(el.innerText || el.textContent);
      const price = parsePrice(text);
      if (!link || price === null) return null;
      return {
        id: (link.href.match(/items\/(\d+)/) || [])[1] || link.href,
        title: clean(img?.alt) || text.split(/\n/)[0] || 'Annonce Vinted',
        price, url: link.href, image: img?.currentSrc || img?.src || '',
        currency: 'EUR', seenAt: Date.now()
      };
    }).filter(Boolean).filter((item, i, arr) => arr.findIndex(x => x.id === item.id) === i).slice(0,100);
  }
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === 'VINTED_COMPANION_COLLECT') sendResponse({items: collect(), pageTitle: document.title, url: location.href});
    return true;
  });
})();