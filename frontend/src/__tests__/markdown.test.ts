import { describe, it, expect } from 'vitest';
import { parseMarkdown, extractAiComment, parseRecipeSections } from '../utils/markdown';

// ---------------------------------------------------------------------------
// parseMarkdown
// ---------------------------------------------------------------------------

describe('parseMarkdown', () => {
  it('converts bold markdown to <strong>', () => {
    expect(parseMarkdown('**hello**')).toContain('<strong>hello</strong>');
  });

  it('converts headers', () => {
    expect(parseMarkdown('# Title')).toContain('<h1>');
  });

  it('converts unordered lists', () => {
    const html = parseMarkdown('- item one\n- item two');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
  });

  it('converts numbered lists', () => {
    const html = parseMarkdown('1. first\n2. second');
    expect(html).toContain('<ol>');
  });

  it('strips <script> tags (XSS)', () => {
    const html = parseMarkdown('<script>alert("xss")</script>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert');
  });

  it('strips javascript: href (XSS)', () => {
    const html = parseMarkdown('[click](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });

  it('strips onerror event attribute (XSS)', () => {
    const html = parseMarkdown('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('strips onclick event attribute (XSS)', () => {
    const html = parseMarkdown('<p onclick="evil()">text</p>');
    expect(html).not.toContain('onclick');
  });

  it('preserves safe inline HTML like <em>', () => {
    expect(parseMarkdown('*italic*')).toContain('<em>');
  });

  it('returns a string for empty input', () => {
    expect(typeof parseMarkdown('')).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// extractAiComment
// ---------------------------------------------------------------------------

describe('extractAiComment', () => {
  it('returns the last plain paragraph', () => {
    const md = '**Recipe Name**\n\nSome body text.\n\nWant me to adjust anything?';
    expect(extractAiComment(md)).toBe('Want me to adjust anything?');
  });

  it('skips trailing list items to find a paragraph', () => {
    const md = 'Some intro.\n\n- item one\n- item two';
    expect(extractAiComment(md)).toBe('Some intro.');
  });

  it('skips trailing headers', () => {
    const md = 'Here is a tip!\n\n# A Header';
    expect(extractAiComment(md)).toBe('Here is a tip!');
  });

  it('skips markdown tables', () => {
    const md = 'Great choice!\n\n| col | col |\n|-----|-----|';
    expect(extractAiComment(md)).toBe('Great choice!');
  });

  it('skips horizontal rules', () => {
    const md = 'Enjoy your meal!\n\n---';
    expect(extractAiComment(md)).toBe('Enjoy your meal!');
  });

  it('returns null when there is only structural content', () => {
    const md = '# Header\n\n- item\n\n| a | b |\n|---|---|';
    expect(extractAiComment(md)).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(extractAiComment('')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseRecipeSections
// ---------------------------------------------------------------------------

describe('parseRecipeSections', () => {
  const SAMPLE = `Here are two recipes for you.

---

**Chicken Stir-Fry**
*Quick and easy*

- **Time:** 20 min

---

**Rice Bowl**
*Healthy and filling*

- **Time:** 30 min

---

Let me know if you want adjustments!`;

  it('returns an array of sections', () => {
    const sections = parseRecipeSections(SAMPLE);
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);
  });

  it('identifies recipe sections by bold title', () => {
    const sections = parseRecipeSections(SAMPLE);
    const recipes = sections.filter(s => s.type === 'recipe');
    expect(recipes.length).toBe(2);
  });

  it('extracts correct recipe titles', () => {
    const sections = parseRecipeSections(SAMPLE);
    const recipes = sections.filter(s => s.type === 'recipe' as const);
    expect(recipes[0].type === 'recipe' && recipes[0].title).toBe('Chicken Stir-Fry');
    expect(recipes[1].type === 'recipe' && recipes[1].title).toBe('Rice Bowl');
  });

  it('classifies non-recipe content as text sections', () => {
    const sections = parseRecipeSections(SAMPLE);
    const texts = sections.filter(s => s.type === 'text');
    expect(texts.length).toBeGreaterThan(0);
  });

  it('handles a single recipe with no surrounding text', () => {
    const md = '**Pasta Carbonara**\n*Classic Italian*\n\n- **Time:** 25 min';
    const sections = parseRecipeSections(md);
    expect(sections.length).toBe(1);
    expect(sections[0].type).toBe('recipe');
    const s = sections[0];
    expect(s.type === 'recipe' && s.title).toBe('Pasta Carbonara');
  });

  it('returns a single text section for plain text', () => {
    const md = 'Sorry, I need more ingredients to suggest recipes.';
    const sections = parseRecipeSections(md);
    expect(sections.length).toBe(1);
    expect(sections[0].type).toBe('text');
  });

  it('returns empty array for empty input', () => {
    expect(parseRecipeSections('')).toEqual([]);
  });
});
