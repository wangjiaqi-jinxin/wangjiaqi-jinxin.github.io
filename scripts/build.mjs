import { cp, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';

const root = path.resolve(import.meta.dirname, '..');
const postsDir = path.join(root, 'content', 'posts');
const outDir = path.join(root, 'posts');
const assetsDir = path.join(root, 'assets');
const site = { name: '近心', url: 'https://wangjiaqi-jinxin.github.io' };

const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[char]);
const formatDate = value => {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).replaceAll('/', '.');
};

function math(markdown) {
  return markdown
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false }))
    .replace(/(?<!\\)\$([^$\n]+?)\$/g, (_, formula) => katex.renderToString(formula.trim(), { throwOnError: false }));
}

marked.use({ renderer: { code({ text, lang }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const code = language === 'plaintext' ? esc(text) : hljs.highlight(text, { language }).value;
  return `<pre class="code-block"><code class="hljs language-${language}">${code}</code></pre>`;
}}});

function background() {
  return '<div class="interactive-bg" aria-hidden="true"><div class="wallpaper"></div><canvas class="signal-field" id="signalField"></canvas><div class="grid-bg" id="gridBg"></div><div class="mouse-glow" id="mouseGlow"></div><i class="floating-dot dot-1"></i><i class="floating-dot dot-2"></i><i class="floating-dot dot-3"></i></div>';
}

function nav(relative = '') {
  return `<header class="site-header"><nav class="shell nav" aria-label="主导航"><a class="brand" href="${relative}index.html">JINXIN<span>·</span>NOTES</a><div class="nav-links"><a href="${relative}index.html">首页</a><a class="active" href="${relative}blog.html">文章</a><a href="${relative}projects.html">项目</a><a href="${relative}about.html">关于</a><a href="https://github.com/wangjiaqi-jinxin" target="_blank" rel="noreferrer">GitHub ↗</a><button class="theme-toggle" type="button" aria-label="切换浅色模式">◐</button></div></nav></header>`;
}

const footer = '<footer class="shell footer"><p>© 2026 近心</p><p>Built on GitHub Pages</p></footer>';

function tags(tags) { return `<div class="tags">${tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>`; }

function articlePage(post) {
  const toc = post.headings.map(heading => `<a href="#${heading.id}">${esc(heading.text)}</a>`).join('');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(post.summary)}"><title>${esc(post.title)} · ${site.name}</title><link rel="stylesheet" href="../assets/site.css"><link rel="stylesheet" href="../assets/katex.min.css"><script defer src="../assets/site.js"></script></head><body class="technical-reading">${background()}${nav('../')}<main class="article-shell"><header class="article-head"><a class="back-link" href="../blog.html">← 返回文章</a><div style="margin-top:25px">${tags(post.tags)}</div><h1>${esc(post.title)}</h1><p class="article-intro">${esc(post.summary)}</p><p class="meta">${formatDate(post.date)} · ${post.readingTime} 分钟阅读</p></header><div class="article-layout"><aside class="toc"><p>ON THIS PAGE</p>${toc}</aside><article class="article-content">${post.html}<nav class="article-nav"><a href="../blog.html">← 全部文章</a><a href="${post.nextUrl}">${post.nextTitle} →</a></nav></article></div></main>${footer}</body></html>`;
}

function postCard(post) {
  return `<article class="post-row"><p class="post-date">${formatDate(post.date)}</p><div>${tags(post.tags)}<h3><a href="posts/${post.slug}.html">${esc(post.title)}</a></h3><p>${esc(post.summary)}</p><span class="meta">${post.readingTime} 分钟阅读</span></div></article>`;
}

function blogPage(posts) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="近心的机器人、C++ 与嵌入式技术文章。"><title>文章 · 近心</title><link rel="stylesheet" href="assets/site.css"><script defer src="assets/site.js"></script></head><body class="technical-archive">${background()}${nav('')}<main class="shell"><section class="page-hero"><p class="kicker">ALL WRITING</p><h1>技术文章</h1><p>记录机器人控制、嵌入式开发与软件工程中的理解、推导和实践。</p><div class="filter-nav"><a href="#all">全部</a><a href="#robot">Robot</a><a href="#embedded">Embedded</a><a href="#research">Research Notes</a></div></section><section class="post-list" id="all"><p class="archive-year">${new Date().getFullYear()}</p>${posts.map(postCard).join('')}</section></main>${footer}</body></html>`;
}

const files = (await readdir(postsDir)).filter(file => file.endsWith('.md') && !['README.md', 'post-template.md'].includes(file));
await cp(path.join(root, 'node_modules', 'katex', 'dist', 'katex.min.css'), path.join(assetsDir, 'katex.min.css'));
await cp(path.join(root, 'node_modules', 'katex', 'dist', 'fonts'), path.join(assetsDir, 'fonts'), { recursive: true });
const posts = [];
for (const file of files) {
  const source = await readFile(path.join(postsDir, file), 'utf8');
  const { data, content } = matter(source);
  const slug = data.slug ?? path.basename(file, '.md');
  const headings = [];
  const html = marked.parse(math(content), { headerIds: false }).replace(/<h2>(.*?)<\/h2>/g, (_, text) => {
    const plain = text.replace(/<[^>]+>/g, '');
    const id = plain.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
    headings.push({ id, text: plain });
    return `<h2 id="${id}">${text}</h2>`;
  });
  posts.push({ slug, title: data.title, date: data.date, tags: data.tags ?? [], summary: data.summary, readingTime: data.readingTime ?? 5, html, headings });
}
posts.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title, 'zh-CN'));
for (let i = 0; i < posts.length; i += 1) {
  const next = posts[i + 1] ?? posts[0];
  posts[i].nextUrl = next ? `${next.slug}.html` : '../blog.html';
  posts[i].nextTitle = next ? `下一篇：${next.title}` : '返回文章列表';
  await writeFile(path.join(outDir, `${posts[i].slug}.html`), articlePage(posts[i]));
}
await writeFile(path.join(root, 'blog.html'), blogPage(posts));
console.log(`Built ${posts.length} Markdown posts.`);
