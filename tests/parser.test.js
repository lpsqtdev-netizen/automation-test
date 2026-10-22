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
