(() => {
  const SUPPORTED_HOST = /(^|\.)vinted\.(fr|be|de|es|it|nl|pl|pt)$/i;
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

  function parsePrice(value) {
    const text = String(value ?? '').replace(/\u00a0/g, ' ');
    const match = text.match(/(\d[\d\s.,]*\d|\d)\s*€/);
    if (!match) return null;
    let number = match[1].replace(/\s/g, '');
    const comma = number.lastIndexOf(',');
    const dot = number.lastIndexOf('.');
    if (comma !== -1 && dot !== -1) {
      const decimal = comma > dot ? ',' : '.';
      const grouping = decimal === ',' ? /\./g : /,/g;
      number = number.replace(grouping, '');
      if (decimal === ',') number = number.replace(',', '.');
    } else if (comma !== -1 || dot !== -1) {
      const separator = comma !== -1 ? ',' : '.';
      const parts = number.split(separator);
      const trailing = parts[parts.length - 1].length;
      if (trailing === 1 || trailing === 2) {
        number = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
      } else {
        number = parts.join('');
      }
    }
    const parsed = Number(number);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  function isSupportedListingUrl(value, base = 'https://www.vinted.fr') {
    try {
      const parsed = new URL(value, base);
      return parsed.protocol === 'https:' &&
        SUPPORTED_HOST.test(parsed.hostname) &&
        /^\/items\/\d+(?:[-/]|$)/.test(parsed.pathname);
    } catch {
      return false;
    }
  }

  function itemId(url) {
    try {
      const parsed = new URL(url, 'https://www.vinted.fr');
      const match = parsed.pathname.match(/\/items\/(\d+)/);
      return match ? match[1] : parsed.href;
    } catch {
      return String(url ?? '');
    }
  }

  function collectFromDocument(doc, now = Date.now()) {
    const baseUrl = doc.location?.href || 'https://www.vinted.fr';
    const selectors = [
      '[data-testid="item-box"]',
      '[data-testid^="product-item-id-"]',
      '.feed-grid__item',
      '[class*="feed-grid__item"]',
      '[class*="ItemBox"]'
    ];
    const candidates = new Set();
    for (const selector of selectors) {
      doc.querySelectorAll(selector).forEach(node => candidates.add(node));
    }

    if (!candidates.size) {
      doc.querySelectorAll('a[href*="/items/"]').forEach(link => {
        let node = link;
        for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
          const text = node.innerText || node.textContent || '';
          if (node.querySelector?.('img') && /€/.test(text) && text.length < 900) {
            candidates.add(node);
            break;
          }
        }
      });
    }

    const results = [];
    const seen = new Set();
    for (const node of candidates) {
      const link = node.querySelector('a[href*="/items/"]');
      if (!link) continue;
      const rawUrl = link.href || link.getAttribute('href');
      if (!rawUrl || !isSupportedListingUrl(rawUrl, baseUrl)) continue;
      const parsedUrl = new URL(rawUrl, baseUrl);
      const id = itemId(parsedUrl.href);
      if (seen.has(id)) continue;
      const rawText = node.innerText || node.textContent || '';
      const price = parsePrice(rawText);
      if (price === null) continue;
      const img = node.querySelector('img');
      const lines = String(rawText).split(/\n+/).map(clean).filter(Boolean);
      const alt = clean(img?.alt);
      const title = alt && !/^(photo|image|vinted)/i.test(alt)
        ? alt
        : (lines.find(line => !/^\d[\d\s.,]*\s*€$/.test(line) && !/^(favori|sponsorisé|promoted)$/i.test(line)) || 'Annonce Vinted');
      results.push({
        id, title: title.slice(0, 240), price, url: parsedUrl.href,
        image: img?.currentSrc || img?.src || '', currency: 'EUR', seenAt: now
      });
      seen.add(id);
      if (results.length >= 100) break;
    }
    return results;
  }

  const api = { clean, parsePrice, itemId, isSupportedListingUrl, collectFromDocument };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.VintedCompanionParser = api;
})();