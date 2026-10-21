import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanUrl,
  extractDomain,
  extractStoreName,
  compileTemplate,
  parseUrlList,
  getNextPendingIndex,
  calculateMetrics,
  getContactScannerScript,
  getFormAutoFillScript,
  getStoreContactRoutes,
  generateAutoFillBookmarklet,
  StoreItem
} from './engine.ts';

test('cleanUrl normalizes naked domains and strips tracking parameters', () => {
  assert.equal(cleanUrl('allbirds.com'), 'https://allbirds.com/');
  assert.equal(cleanUrl('http://gymshark.com'), 'http://gymshark.com/');
  const withTracking = cleanUrl('https://gymshark.com/?utm_source=facebook&utm_medium=cpc');
  assert.equal(withTracking, 'https://gymshark.com/');
});

test('extractDomain correctly parses domains without www', () => {
  assert.equal(extractDomain('https://www.allbirds.com/pages/contact'), 'allbirds.com');
  assert.equal(extractDomain('https://gymshark.com/collections/all'), 'gymshark.com');
  assert.equal(extractDomain('clean-skincare.myshopify.com'), 'clean-skincare.myshopify.com');
});

test('extractStoreName turns domain slugs into elegant titles', () => {
  assert.equal(extractStoreName('https://gymshark.com'), 'Gymshark');
  assert.equal(extractStoreName('nordic-wear-studio.com'), 'Nordic Wear Studio');
  assert.equal(extractStoreName('the-wellness-club.myshopify.com'), 'The Wellness Club');
});

test('compileTemplate replaces {store_name}, {domain}, {full_name}, and {email}', () => {
  const template = 'Hi {store_name} Team! Saw your products on {domain}. Best, {full_name} ({email})';
  const result = compileTemplate(template, {
    storeName: 'Aura Candle Co',
    domain: 'auracandles.com',
    fullName: 'Alex Vance',
    email: 'alex@brandreach.io'
  });
  assert.equal(result, 'Hi Aura Candle Co Team! Saw your products on auracandles.com. Best, Alex Vance (alex@brandreach.io)');
});

test('parseUrlList correctly parses line-delimited and csv urls and prevents duplicates', () => {
  const text = `
    allbirds.com
    https://gymshark.com/pages/contact
    allbirds.com
    https://colourpop.com
  `;
  const parsed = parseUrlList(text);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].domain, 'allbirds.com');
  assert.equal(parsed[1].domain, 'gymshark.com');
  assert.equal(parsed[2].domain, 'colourpop.com');
  assert.equal(parsed[0].status, 'pending');
});

test('getNextPendingIndex properly cycles to the next pending store', () => {
  const items: StoreItem[] = [
    { id: '1', rawUrl: 'a.com', cleanUrl: 'https://a.com', domain: 'a.com', storeName: 'A', status: 'completed' },
    { id: '2', rawUrl: 'b.com', cleanUrl: 'https://b.com', domain: 'b.com', storeName: 'B', status: 'skipped' },
    { id: '3', rawUrl: 'c.com', cleanUrl: 'https://c.com', domain: 'c.com', storeName: 'C', status: 'pending' },
    { id: '4', rawUrl: 'd.com', cleanUrl: 'https://d.com', domain: 'd.com', storeName: 'D', status: 'pending' },
  ];

  // From index 0, should find index 2
  assert.equal(getNextPendingIndex(items, 0), 2);
  // From index 2, should find index 3
  assert.equal(getNextPendingIndex(items, 2), 3);
});

test('calculateMetrics computes correct counts and completion percentage', () => {
  const items: StoreItem[] = [
    { id: '1', rawUrl: 'a.com', cleanUrl: '', domain: 'a.com', storeName: 'A', status: 'completed' },
    { id: '2', rawUrl: 'b.com', cleanUrl: '', domain: 'b.com', storeName: 'B', status: 'completed' },
    { id: '3', rawUrl: 'c.com', cleanUrl: '', domain: 'c.com', storeName: 'C', status: 'skipped' },
    { id: '4', rawUrl: 'd.com', cleanUrl: '', domain: 'd.com', storeName: 'D', status: 'pending' },
  ];

  const metrics = calculateMetrics(items);
  assert.equal(metrics.total, 4);
  assert.equal(metrics.completed, 2);
  assert.equal(metrics.skipped, 1);
  assert.equal(metrics.pending, 1);
  assert.equal(metrics.completionRate, 50);
});

test('getContactScannerScript and getFormAutoFillScript generate valid JS wrappers', () => {
  const scanner = getContactScannerScript();
  assert.ok(scanner.includes('commonPatterns'));
  assert.ok(scanner.includes('/pages/contact'));

  const autoFill = getFormAutoFillScript({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 555-0199',
    subject: 'Partnership Inquiry',
    message: 'Hello world'
  });
  assert.ok(autoFill.includes('Jane Doe'));
  assert.ok(autoFill.includes('new Event(\'input\''));
  assert.ok(autoFill.includes('scrollIntoView'));
});

test('getStoreContactRoutes generates standard Shopify, contact-us, and Google site search links', () => {
  const routes = getStoreContactRoutes('https://gymshark.com/collections/all');
  assert.equal(routes.shopifyPagesContact, 'https://gymshark.com/pages/contact');
  assert.equal(routes.contactUs, 'https://gymshark.com/contact-us');
  assert.equal(routes.contact, 'https://gymshark.com/contact');
  assert.equal(routes.googleSearch, 'https://www.google.com/search?q=site:gymshark.com+contact');
});

test('generateAutoFillBookmarklet produces a valid executable javascript: uri', () => {
  const bookmarklet = generateAutoFillBookmarklet({
    fullName: 'Sarah Connor',
    email: 'sarah@skynet.com',
    phone: '555-1234',
    subject: 'Question for {store_name}',
    messageTemplate: 'Hello {store_name} on {domain}'
  });
  assert.ok(bookmarklet.startsWith('javascript:'));
  assert.ok(bookmarklet.includes('Sarah Connor'));
  assert.ok(bookmarklet.includes('new Event'));
});

