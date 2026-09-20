# JINXIN · NOTES

基于 GitHub Pages 的静态 Markdown 博客。公开站点：<https://wangjiaqi-jinxin.github.io>。

## 写一篇新文章

1. 复制 [content/posts/post-template.md](content/posts/post-template.md)，用英文短横线命名，例如 `my-new-post.md`。
2. 填写标题、日期、标签、摘要与正文；代码块、图片链接和 KaTeX 公式均可使用。
3. 在项目根目录运行：

   ```powershell
   npm run build
   ```

4. 检查生成的 `posts/my-new-post.html` 与 `blog.html`，然后提交并推送：

   ```powershell
   git add .
   git commit -m "Add my new post"
   git push
   ```

首次在新电脑使用时先运行一次 `npm install`。生成的 HTML、公式样式与字体都需要一并提交，GitHub Pages 不需要额外服务器或构建配置。
