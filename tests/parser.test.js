const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePrice, itemId, clean, isSupportedListingUrl } = require('../parser.js');

test('parses French decimal and thousands formats', () => {
  assert.equal(parsePrice('20 €'), 20);
  assert.equal(parsePrice('20,00 €'), 20);
  assert.equal(parsePrice('1 234,56 €'), 1234.56);
  assert.equal(parsePrice('1.234,56 €'), 1234.56);
});

test('parses dot decimals and US-style thousands', () => {
  assert.equal(parsePrice('20.50 €'), 20.5);
  assert.equal(parsePrice('1,234.56 €'), 1234.56);
});

test('ignores text without euro price and invalid values', () => {
  assert.equal(parsePrice('Taille M, très bon état'), null);
  assert.equal(parsePrice(''), null);
});

test('extracts stable item identifiers from Vinted URLs', () => {
  assert.equal(itemId('https://www.vinted.fr/items/1234567890-shirt'), '1234567890');
  assert.equal(itemId('/items/1234567890-shirt'), '1234567890');
});

test('accepts only HTTPS item URLs on supported Vinted domains', () => {
  assert.equal(isSupportedListingUrl('https://www.vinted.fr/items/1234567890-shirt'), true);
  assert.equal(isSupportedListingUrl('/items/1234567890-shirt', 'https://www.vinted.be/catalog'), true);
  assert.equal(isSupportedListingUrl('http://www.vinted.fr/items/1234567890-shirt'), false);
  assert.equal(isSupportedListingUrl('https://example.com/items/1234567890-shirt'), false);
  assert.equal(isSupportedListingUrl('https://www.vinted.fr.evil.example/items/1234567890-shirt'), false);
  assert.equal(isSupportedListingUrl('https://www.vinted.fr/profile/123'), false);
});

test('normalizes whitespace', () => {
  assert.equal(clean('  Pull\n  bleu   taille M '), 'Pull bleu taille M');
});


test('declares Firefox WebExtension metadata and Manifest V3', () => {
  const fs = require('node:fs');
  const manifest = JSON.parse(fs.readFileSync(require('node:path').join(__dirname, '..', 'manifest.json'), 'utf8'));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(typeof manifest.browser_specific_settings.gecko.id, 'string');
  assert.ok(manifest.browser_specific_settings.gecko.id.length > 0);
});

test('uses browser API with Chrome fallback in extension scripts', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const popup = fs.readFileSync(path.join(__dirname, '..', 'popup.js'), 'utf8');
  const content = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');
  assert.match(popup, /globalThis\.browser\s*\?\?\s*globalThis\.chrome/);
  assert.match(content, /globalThis\.browser\s*\?\?\s*globalThis\.chrome/);
  assert.doesNotMatch(popup, /\bchrome\.(tabs|storage)\b/);
  assert.doesNotMatch(content, /\bchrome\.runtime\b/);
});
