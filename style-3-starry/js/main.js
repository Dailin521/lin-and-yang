// 数字计数动画
function animateNumbers() {
    const stats = document.querySelectorAll('.stat-num[data-count]');

    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2500;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// 星球悬停粒子效果
function createParticles(x, y) {
    const colors = ['#00F5FF', '#7B68EE', '#FF69B4', '#FFD700'];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.boxShadow = `0 0 10px currentColor`;

        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let posX = x;
        let posY = y;
        let opacity = 1;

        function animateParticle() {
            posX += vx;
            posY += vy;
            opacity -= 0.02;

            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }

        animateParticle();
    }
}

// 星球点击效果
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(animateNumbers, 500);

    const planets = document.querySelectorAll('.memory-planet');
    planets.forEach(planet => {
        planet.addEventListener('click', (e) => {
            const rect = planet.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            createParticles(x, y);
        });
    });

    // 鼠标移动光晕效果
    let cursorGlow = null;
    document.addEventListener('mousemove', (e) => {
        if (!cursorGlow) {
            cursorGlow = document.createElement('div');
            cursorGlow.style.position = 'fixed';
            cursorGlow.style.width = '200px';
            cursorGlow.style.height = '200px';
            cursorGlow.style.borderRadius = '50%';
            cursorGlow.style.background = 'radial-gradient(circle, rgba(123,104,238,0.1) 0%, transparent 70%)';
            cursorGlow.style.pointerEvents = 'none';
            cursorGlow.style.zIndex = '0';
            cursorGlow.style.transform = 'translate(-50%, -50%)';
            cursorGlow.style.transition = 'left 0.3s, top 0.3s';
            document.body.appendChild(cursorGlow);
        }

        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
