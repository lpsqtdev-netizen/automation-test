(() => {
  const parser = globalThis.VintedCompanionParser;
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type !== 'VINTED_COMPANION_COLLECT') return false;
    try {
      sendResponse({
        items: parser ? parser.collectFromDocument(document) : [],
        pageTitle: document.title,
        url: location.href
      });
    } catch (error) {
      sendResponse({ items: [], pageTitle: document.title, url: location.href, error: 'collect-failed' });
    }
    return false;
  });
})();