import { marked } from 'marked';

marked.setOptions({ breaks: true });

export function parseMarkdown(md: string): string {
  return marked.parse(md) as string;
}

export function extractAiComment(markdown: string): string | null {
  const paras = markdown.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  for (let i = paras.length - 1; i >= 0; i--) {
    const p = paras[i];
    if (
      !p.startsWith('#') &&
      !p.startsWith('-') &&
      !p.startsWith('*') &&
      !p.startsWith('|') &&
      !p.startsWith('---') &&
      !/^\d+\./.test(p)
    ) {
      return p;
    }
  }
  return null;
}

export interface RecipeSection {
  type: 'recipe';
  title: string;
  markdown: string;
}

export interface TextSection {
  type: 'text';
  markdown: string;
}

export type Section = RecipeSection | TextSection;

export function parseRecipeSections(markdown: string): Section[] {
  const parts = markdown.split(/\n---+\n/);
  const sections: Section[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^\*\*\[?(.+?)\]?\*\*/m);
    if (match) {
      sections.push({ type: 'recipe', title: match[1].trim(), markdown: trimmed });
    } else {
      sections.push({ type: 'text', markdown: trimmed });
    }
  }

  return sections;
}
