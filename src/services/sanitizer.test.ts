import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeAndExtractHtml } from './sanitizer.ts';

test('sanitizeAndExtractHtml strips script tags, iframes, and styles', () => {
  const rawHtml = `
    <html>
      <head>
        <title>JavaScript Variables | MDN</title>
        <script>alert("XSS");</script>
        <style>body { color: red; }</style>
      </head>
      <body>
        <iframe src="evil.html"></iframe>
        <h1>Declaring variables</h1>
        <p>JavaScript has three kinds of variable declarations: var, let, and const.</p>
        <pre><code>let score = 100;</code></pre>
      </body>
    </html>
  `;

  const extracted = sanitizeAndExtractHtml(rawHtml);
  assert.equal(extracted.title, 'JavaScript Variables | MDN');
  assert.equal(extracted.headings.includes('Declaring variables'), true);
  assert.equal(extracted.codeSnippets.length, 1);
  assert.equal(extracted.codeSnippets[0], 'let score = 100;');
  assert.equal(extracted.cleanedText.includes('alert('), false);
  assert.equal(extracted.cleanedText.includes('evil.html'), false);
});

test('sanitizeAndExtractHtml decodes HTML entities safely', () => {
  const rawHtml = `
    <html>
      <head><title>Operators &amp; Expressions</title></head>
      <body>
        <p>Comparison operators like &lt;= and &gt;= are used in logic.</p>
      </body>
    </html>
  `;

  const extracted = sanitizeAndExtractHtml(rawHtml);
  assert.equal(extracted.title, 'Operators & Expressions');
  assert.ok(extracted.paragraphs[0].includes('<= and >='));
});
