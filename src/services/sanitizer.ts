export interface ExtractedContent {
  title: string;
  headings: string[];
  paragraphs: string[];
  codeSnippets: string[];
  cleanedText: string;
  extractedLength: number;
}

/**
 * Sanitizes HTML content extracted from external documentation.
 * Strips script tags, style sheets, inline handlers, navigation, and footers.
 * Never executes code. Extracts clean headings, text, and code snippets.
 */
export function sanitizeAndExtractHtml(rawHtml: string): ExtractedContent {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return {
      title: 'Untitled Document',
      headings: [],
      paragraphs: [],
      codeSnippets: [],
      cleanedText: '',
      extractedLength: 0,
    };
  }

  // 1. Remove dangerous executable or intrusive tags completely
  let sanitized = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ');

  // 2. Extract Document Title
  let title = 'JavaScript Documentation';
  const titleMatch = sanitized.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // 3. Extract Headings (h1, h2, h3)
  const headings: string[] = [];
  const headingMatches = sanitized.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi);
  for (const match of headingMatches) {
    const text = stripTagsAndClean(match[1]);
    if (text && text.length > 2 && !headings.includes(text)) {
      headings.push(text);
    }
  }

  // 4. Extract Code Snippets from <pre><code> or <pre>
  const codeSnippets: string[] = [];
  const codeMatches = sanitized.matchAll(/<pre[^>]*>(?:<code[^>]*>)?([\s\S]*?)(?:<\/code>)?<\/pre>/gi);
  for (const match of codeMatches) {
    const snippet = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, '').trim());
    if (snippet && snippet.length > 5 && !codeSnippets.includes(snippet)) {
      codeSnippets.push(snippet);
      if (codeSnippets.length >= 6) break; // Limit sample count
    }
  }

  // 5. Extract Paragraphs
  const paragraphs: string[] = [];
  const pMatches = sanitized.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const match of pMatches) {
    const pText = stripTagsAndClean(match[1]);
    if (pText && pText.length > 25) {
      paragraphs.push(pText);
    }
  }

  // 6. Assemble bounded summary text for transformation
  const combined = [
    `Title: ${title}`,
    'Key Headings: ' + headings.slice(0, 10).join(' | '),
    'Explanatory Sections:',
    ...paragraphs.slice(0, 15),
  ].join('\n\n');

  // Bound to safe size (max 12,000 chars)
  const boundedText = combined.slice(0, 12000);

  return {
    title,
    headings: headings.slice(0, 10),
    paragraphs: paragraphs.slice(0, 12),
    codeSnippets: codeSnippets.slice(0, 5),
    cleanedText: boundedText,
    extractedLength: boundedText.length,
  };
}

function stripTagsAndClean(str: string): string {
  return decodeHtmlEntities(
    str
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
