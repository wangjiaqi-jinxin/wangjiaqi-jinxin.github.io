(() => {
  const background = '<div class="interactive-bg" aria-hidden="true"><div class="wallpaper"></div><div class="grid-bg" id="gridBg"></div><div class="mouse-glow" id="mouseGlow"></div><i class="floating-dot dot-1"></i><i class="floating-dot dot-2"></i><i class="floating-dot dot-3"></i></div>';
  if (!document.querySelector('.interactive-bg')) document.body.insertAdjacentHTML('afterbegin', background);

  document.title = document.title.replaceAll('王家琪', '近心');
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = description.content.replaceAll('王家琪', '近心');
  document.querySelectorAll('.brand').forEach(brand => { brand.innerHTML = 'JINXIN<span>·</span>NOTES'; });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) node.nodeValue = node.nodeValue.replaceAll('王家琪', '近心').replaceAll('Wang Jiaqi', '近心');

  const blogList = document.querySelector('.post-list');
  if (location.pathname.endsWith('/blog.html') && blogList && !document.getElementById('engineering-notes')) {
    const archive = blogList.querySelector('.archive-year');
    archive.insertAdjacentHTML('afterend', `
      <div id="engineering-notes">
        <article class="post-row"><p class="post-date">2026.09.20</p><div><div class="tags"><span>Robot</span><span>Servo</span><span>Motion Planning</span></div><h3><a href="posts/continuous-motion.html">连续机器人运动为什么仍会卡顿：从离散 Servo 到在线接管</a></h3><p>从离散导数、S 曲线、SwitchPoint 和 C² 融合，解释连续工艺的真实边界。</p><span class="meta">10 分钟阅读 · 工程笔记</span></div></article>
        <article class="post-row"><p class="post-date">2026.09.20</p><div><div class="tags"><span>Robot</span><span>Multi-axis</span><span>Control</span></div><h3><a href="posts/multiaxis-sync.html">多轴连续工艺如何共享同一时间轴</a></h3><p>机器人、外部轴与输送线的几何关系、时间重锚和可观测性方法。</p><span class="meta">9 分钟阅读 · 工程笔记</span></div></article>
      </div>`);
  }

  const stored = localStorage.getItem('wjq-theme');
  if (stored === 'light') document.body.classList.add('light');
  const button = document.querySelector('.theme-toggle');
  if (button) button.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('wjq-theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });

  const glow = document.getElementById('mouseGlow');
  const grid = document.getElementById('gridBg');
  if (!glow || !grid || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
  addEventListener('mousemove', event => {
    tx = event.clientX; ty = event.clientY;
    const dx = tx / innerWidth - .5, dy = ty / innerHeight - .5;
    grid.style.transform = `translate(${dx * 9}px,${dy * 9}px)`;
  }, { passive: true });
  const tick = () => {
    x += (tx - x) * .075; y += (ty - y) * .075;
    glow.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  };
  tick();
})();
