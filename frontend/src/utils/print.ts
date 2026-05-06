import { parseMarkdown } from './markdown';

export function printRecipe(name: string, markdown: string): void {
  const html = parseMarkdown(markdown);
  const win = window.open('', '_blank', 'width=720,height=900');
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; max-width: 640px; margin: 2rem auto; color: #111; font-size: 13pt; line-height: 1.6; }
    h1, h2, h3 { font-family: -apple-system, sans-serif; color: #222; margin: 1rem 0 0.4rem; }
    h2 { color: #c0392b; }
    ul, ol { padding-left: 1.5rem; margin: 0.4rem 0; }
    li { margin: 0.2rem 0; }
    p { margin: 0.5rem 0; }
    hr { border: none; border-top: 1px solid #ccc; margin: 1rem 0; }
    strong { color: #111; }
    em { color: #444; }
    @media print { body { margin: 1.5cm 2cm; } }
  </style>
</head>
<body>${html}</body>
</html>`);
  win.document.close();
  win.focus();
  win.addEventListener('afterprint', () => win.close());
  win.print();
}
