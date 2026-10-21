export interface ApprovedSource {
  id: string;
  topicKey: string;
  topicName: string;
  url: string;
  title: string;
  description: string;
  license: string;
  attributionNotice: string;
  lastIngestedAt?: string;
  status: 'seeded' | 'ready' | 'ingesting' | 'error';
  errorMessage?: string;
}

export const ALLOWED_DOMAINS = ['developer.mozilla.org', 'www.tpointtech.com', 'tpointtech.com'];

export const APPROVED_SOURCES: ApprovedSource[] = [
  {
    id: 'src-variables',
    topicKey: 'variables',
    topicName: 'Variables & Data Types',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types',
    title: 'Grammar and types - JavaScript | MDN',
    description: 'Declarations (var, let, const), variable naming rules, primitive data types, and data structure semantics.',
    license: 'CC-BY-SA 2.5',
    attributionNotice: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
    status: 'seeded',
  },
  {
    id: 'src-strings',
    topicKey: 'strings',
    topicName: 'Strings & Text',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
    title: 'String - JavaScript | MDN',
    description: 'String primitives, string literals, characters, escape sequences, length property, and immutability.',
    license: 'CC-BY-SA 2.5',
    attributionNotice: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
    status: 'seeded',
  },
  {
    id: 'src-numbers',
    topicKey: 'numbers',
    topicName: 'Numbers & Arithmetic',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
    title: 'Number - JavaScript | MDN',
    description: 'Double-precision 64-bit binary format (IEEE 754), integer ranges, decimal literals, and special values.',
    license: 'CC-BY-SA 2.5',
    attributionNotice: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
    status: 'seeded',
  },
  {
    id: 'src-operators',
    topicKey: 'operators',
    topicName: 'Expressions & Operators',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators',
    title: 'Expressions and operators - JavaScript | MDN',
    description: 'Arithmetic operators (+, -, *, /), string concatenation, assignment, operator precedence and associativity.',
    license: 'CC-BY-SA 2.5',
    attributionNotice: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
    status: 'seeded',
  },
  {
    id: 'src-template-literals',
    topicKey: 'template-literals',
    topicName: 'Template Literals',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals',
    title: 'Template literals (Template strings) - JavaScript | MDN',
    description: 'Backtick delimiters, expression interpolation (${expression}), multi-line strings, and tagged templates.',
    license: 'CC-BY-SA 2.5',
    attributionNotice: 'Portions of this documentation are based on MDN Web Docs by Mozilla Contributors, licensed under CC-BY-SA 2.5.',
    status: 'seeded',
  },
  {
    id: 'src-tpointtech-intro',
    topicKey: 'js-overview',
    topicName: 'What is JavaScript & Core Features',
    url: 'https://www.tpointtech.com/javascript-tutorial',
    title: 'JavaScript Tutorial - Learn JavaScript from Basics to Advanced Concepts - Tpoint Tech',
    description: 'Overview of JavaScript runtime execution, lightweight interpreted/JIT nature, dynamic typing, and client-side web applications.',
    license: 'Educational Fair Attribution (© TpointTech.com)',
    attributionNotice: 'Concepts referenced from Tpoint Tech (tpointtech.com/javascript-tutorial). All rights reserved by Tpoint Tech.',
    status: 'seeded',
  },
];

/**
 * Validates a target URL against the security allowlist.
 * Rejects non-HTTPS, internal IPs, localhost, unauthorized domains, and paths outside documentation.
 */
export function isUrlApproved(rawUrl: string): { approved: boolean; reason?: string; source?: ApprovedSource } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { approved: false, reason: 'URL must be a non-empty string.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { approved: false, reason: 'Malformed URL.' };
  }

  // 1. Enforce HTTPS only (no file://, http://, ftp://)
  if (parsed.protocol !== 'https:') {
    return { approved: false, reason: 'Only HTTPS protocol is permitted.' };
  }

  // 2. Enforce strict hostname check (no SSRF / internal IP / localhost)
  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_DOMAINS.includes(host)) {
    return {
      approved: false,
      reason: `Domain '${host}' is not on the approved documentation allowlist (${ALLOWED_DOMAINS.join(', ')}).`,
    };
  }

  // 3. Prevent loopback, private IP notation, or port scanning
  if (parsed.port && parsed.port !== '443') {
    return { approved: false, reason: 'Non-standard port specified.' };
  }

  // 4. Validate allowed path prefix per domain
  if (host === 'developer.mozilla.org') {
    if (!parsed.pathname.startsWith('/en-US/docs/Web/JavaScript/')) {
      return {
        approved: false,
        reason: 'MDN URL must reside within /en-US/docs/Web/JavaScript/.',
      };
    }
  } else if (host.includes('tpointtech.com')) {
    if (!parsed.pathname.startsWith('/javascript-tutorial') && !parsed.pathname.startsWith('/javascript')) {
      return {
        approved: false,
        reason: 'TPoint Tech URL must reside within /javascript-tutorial or /javascript.',
      };
    }
  }

  // 5. Match against known curated sources
  const normalized = `${parsed.origin}${parsed.pathname}`;
  const matched = APPROVED_SOURCES.find(
    (s) => s.url.toLowerCase() === normalized.toLowerCase()
  );

  return {
    approved: true,
    source: matched,
  };
}
