import fs from 'fs';
import path from 'path';

const roots = ['src', 'pages', 'app'];
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);
const changed = [];

const keep = (p) => fs.existsSync(p);

function walk(dir, acc) {
  if (!keep(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (exts.has(path.extname(e.name))) acc.push(p);
  }
}

const files = [];
roots.forEach((r) => walk(r, files));

// Remove legacy Pages 404/500/_error files (both pages/ and src/pages/)
const legacyFiles = [
  'pages/404.tsx', 'pages/404.jsx', 'pages/404.js',
  'pages/500.tsx', 'pages/500.jsx', 'pages/500.js',
  'pages/_error.tsx', 'pages/_error.jsx', 'pages/_error.js',
  'src/pages/404.tsx', 'src/pages/404.jsx', 'src/pages/404.js',
  'src/pages/500.tsx', 'src/pages/500.jsx', 'src/pages/500.js',
  'src/pages/_error.tsx', 'src/pages/_error.jsx', 'src/pages/_error.js',
];
for (const f of legacyFiles) {
  if (keep(f)) { fs.rmSync(f); changed.push(`removed ${f}`); }
}

// Ensure App Router error + 404
const ensureFile = (p, content) => {
  if (!keep(path.dirname(p))) fs.mkdirSync(path.dirname(p), { recursive: true });
  if (!keep(p)) {
    fs.writeFileSync(p, content, 'utf8');
    changed.push(`created ${p}`);
  }
};

ensureFile('src/app/not-found.tsx', `export const metadata = { title: 'Not found' };
export default function NotFound() {
  return (
    <main style={{ padding: 32 }}>
      <h1>404 - Page not found</h1>
    </main>
  );
}
`);

ensureFile('src/app/error.tsx', `'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ padding: 32 }}>
      <h1>Something went wrong</h1>
      <button onClick={reset} style={{ marginTop: 12 }}>Try again</button>
    </main>
  );
}
`);

const isPagesDocument = (rel) => /(^|\/)pages\/_document\.(t|j)sx?$/.test(rel);
const isAppLayout = (rel) => /(^|\/)(src\/)?app\/layout\.(t|j)sx$/.test(rel);

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  if (isPagesDocument(rel)) continue;

  let src = fs.readFileSync(file, 'utf8');
  const hadImport = /from\s+['"]next\/document['"]/.test(src) || /require\(['"]next\/document['"]\)/.test(src);
  const hadTags = /<(Html|Head|Main|NextScript)\b/.test(src);
  if (!hadImport && !hadTags) continue;

  const before = src;

  // Remove any import from next/document
  src = src.replace(/^\s*import[^;]*from\s*['"]next\/document['"];\s*$/mg, '');
  src = src.replace(/^\s*const\s+\{[^}]*\}\s*=\s*require\(['"]next\/document['"]\);\s*$/mg, '');

  if (isAppLayout(rel)) {
    // In app/layout, convert to lowercase and remove Main/NextScript
    src = src.replace(/<\/?Html\b/g, (m) => m.replace('Html', 'html'));
    src = src.replace(/<\/?Head\b/g, (m) => m.replace('Head', 'head'));
    src = src.replace(/<Main\s*\/?>/g, '').replace(/<\/Main>/g, '');
    src = src.replace(/<NextScript\s*\/?>/g, '').replace(/<\/NextScript>/g, '');
  } else {
    // In all other files, strip head/main/nextscript; replace Html with div
    src = src.replace(/<\/?Head\b[^>]*>/g, '');
    src = src.replace(/<Main\s*\/?>/g, '').replace(/<\/Main>/g, '');
    src = src.replace(/<NextScript\s*\/?>/g, '').replace(/<\/NextScript>/g, '');
    src = src.replace(/<Html\b([^>]*)>/g, '<div$1>').replace(/<\/Html>/g, '</div>');
  }

  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    changed.push(`modified ${rel}`);
  }
}

console.log(changed.length ? `Made ${changed.length} changes:\n- ${changed.join('\n- ')}` : 'No changes needed.');
