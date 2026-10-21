import test from 'node:test';
import assert from 'node:assert/strict';
import { isUrlApproved, ALLOWED_DOMAINS } from './allowlist.ts';

test('isUrlApproved permits official MDN JavaScript documentation URLs', () => {
  const result = isUrlApproved('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types');
  assert.equal(result.approved, true);
  assert.ok(result.source);
  assert.equal(result.source?.topicKey, 'variables');
});

test('isUrlApproved rejects non-HTTPS protocols (file://, http://)', () => {
  const fileRes = isUrlApproved('file:///etc/passwd');
  assert.equal(fileRes.approved, false);
  assert.ok(fileRes.reason?.includes('HTTPS'));

  const httpRes = isUrlApproved('http://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types');
  assert.equal(httpRes.approved, false);
  assert.ok(httpRes.reason?.includes('HTTPS'));
});

test('isUrlApproved blocks SSRF attempts on internal networks and localhost', () => {
  const localhostRes = isUrlApproved('https://localhost:3000/api/secrets');
  assert.equal(localhostRes.approved, false);

  const ipRes = isUrlApproved('https://169.254.169.254/computeMetadata/v1/');
  assert.equal(ipRes.approved, false);

  const evilDomain = isUrlApproved('https://evil-attacker.com/en-US/docs/Web/JavaScript/');
  assert.equal(evilDomain.approved, false);
});

test('isUrlApproved rejects non-documentation paths on developer.mozilla.org', () => {
  const loginRes = isUrlApproved('https://developer.mozilla.org/en-US/plus');
  assert.equal(loginRes.approved, false);
  assert.ok(loginRes.reason?.includes('/en-US/docs/Web/JavaScript/'));
});

test('isUrlApproved rejects non-standard port attacks', () => {
  const portRes = isUrlApproved('https://developer.mozilla.org:8443/en-US/docs/Web/JavaScript/Guide/Grammar_and_types');
  assert.equal(portRes.approved, false);
  assert.ok(portRes.reason?.includes('port'));
});

test('isUrlApproved permits approved Tpoint Tech JavaScript tutorial URL', () => {
  const tpointRes = isUrlApproved('https://www.tpointtech.com/javascript-tutorial');
  assert.equal(tpointRes.approved, true);
  assert.ok(tpointRes.source);
  assert.equal(tpointRes.source?.topicKey, 'js-overview');
  assert.equal(tpointRes.source?.title.includes('Tpoint Tech'), true);
});

test('isUrlApproved rejects unauthorized paths on tpointtech.com', () => {
  const unauthorizedPath = isUrlApproved('https://www.tpointtech.com/unauthorized-endpoint');
  assert.equal(unauthorizedPath.approved, false);
  assert.ok(unauthorizedPath.reason?.includes('/javascript-tutorial'));
});

