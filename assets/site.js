(() => {
  const background = '<div class="interactive-bg" aria-hidden="true"><div class="wallpaper"></div><canvas class="signal-field" id="signalField"></canvas><div class="grid-bg" id="gridBg"></div><div class="mouse-glow" id="mouseGlow"></div><i class="floating-dot dot-1"></i><i class="floating-dot dot-2"></i><i class="floating-dot dot-3"></i></div>';
  if (!document.querySelector('.interactive-bg')) document.body.insertAdjacentHTML('afterbegin', background);
  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main-content';
  if (main && !document.querySelector('.skip-link')) document.body.insertAdjacentHTML('afterbegin', '<a class="skip-link" href="#main-content">跳到主要内容</a>');
  const isHome = /\/(?:index\.html)?$/.test(location.pathname);
  const homeHref = location.pathname.includes('/posts/') ? '../index.html' : 'index.html';
  if (!isHome && !document.querySelector('.return-home')) document.body.insertAdjacentHTML('afterbegin', `<a class="return-home" href="${homeHref}" aria-label="返回博客首页"><span aria-hidden="true">←</span> 返回首页</a>`);

  document.title = document.title.replaceAll('王家琪', '近心');
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = description.content.replaceAll('王家琪', '近心');
  document.querySelectorAll('.brand').forEach(brand => { brand.innerHTML = 'JINXIN<span>·</span>NOTES'; });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) node.nodeValue = node.nodeValue.replaceAll('王家琪', '近心').replaceAll('Wang Jiaqi', '近心');

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

  const field = document.getElementById('signalField');
  if (field) {
    const context = field.getContext('2d');
    const pointer = { x: innerWidth * .58, y: innerHeight * .42, active: false };
    const pulses = [];
    let points = [];
    let width = 0, height = 0, frame = 0;
    const makePoints = () => {
      const amount = Math.min(56, Math.max(26, Math.floor(width / 34)));
      points = Array.from({ length: amount }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        dx: (Math.random() - .5) * .22, dy: (Math.random() - .5) * .22,
        size: Math.random() * 1.4 + .45, phase: Math.random() * Math.PI * 2
      }));
    };
    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight;
      field.width = width * ratio; field.height = height * ratio;
      field.style.width = `${width}px`; field.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0); makePoints();
    };
    const draw = now => {
      context.clearRect(0, 0, width, height);
      points.forEach(point => {
        point.x += point.dx; point.y += point.dy;
        if (point.x < -20 || point.x > width + 20) point.dx *= -1;
        if (point.y < -20 || point.y > height + 20) point.dy *= -1;
        if (pointer.active) {
          const vx = point.x - pointer.x, vy = point.y - pointer.y;
          const distance = Math.hypot(vx, vy);
          if (distance < 180 && distance > 0) { point.x += vx / distance * .18; point.y += vy / distance * .18; }
        }
      });
      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        for (let j = i + 1; j < points.length; j += 1) {
          const other = points[j], distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 115) { context.strokeStyle = `rgba(114, 213, 255, ${.12 * (1 - distance / 115)})`; context.lineWidth = .6; context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(other.x, other.y); context.stroke(); }
        }
        const glowSize = point.size + Math.sin(now * .0015 + point.phase) * .35;
        context.fillStyle = 'rgba(154, 225, 255, .7)'; context.beginPath(); context.arc(point.x, point.y, glowSize, 0, Math.PI * 2); context.fill();
      }
      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        const pulse = pulses[i]; pulse.radius += 2.4; pulse.alpha -= .012;
        if (pulse.alpha <= 0) { pulses.splice(i, 1); continue; }
        context.strokeStyle = `rgba(119, 225, 255, ${pulse.alpha})`; context.lineWidth = 1.2; context.beginPath(); context.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2); context.stroke();
      }
      frame = requestAnimationFrame(draw);
    };
    addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true; }, { passive: true });
    addEventListener('pointerleave', () => { pointer.active = false; });
    addEventListener('click', event => { pulses.push({ x: event.clientX, y: event.clientY, radius: 8, alpha: .64 }); }, { passive: true });
    addEventListener('resize', resize, { passive: true }); resize(); draw(0);
    addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
  }

  if (matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(element => {
      element.addEventListener('pointermove', event => { const box = element.getBoundingClientRect(); element.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * .12}px, ${(event.clientY - box.top - box.height / 2) * .16}px)`; });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
    document.querySelectorAll('.tilt-card').forEach(element => {
      element.addEventListener('pointermove', event => { const box = element.getBoundingClientRect(), x = (event.clientX - box.left) / box.width - .5, y = (event.clientY - box.top) / box.height - .5; element.style.transform = `perspective(900px) rotateX(${y * -2.4}deg) rotateY(${x * 2.4}deg) translateZ(4px)`; });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  }
})();
