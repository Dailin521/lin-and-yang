// 心愿星球交互功能

// 创建星光粒子效果
function createWishParticles(element) {
    const particlesContainer = element.querySelector('.star-particles');
    if (!particlesContainer) return;

    // 清空旧粒子
    particlesContainer.innerHTML = '';

    // 创建6个粒子
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.borderRadius = '50%';
        particle.style.background = i % 2 === 0 ? '#00F5FF' : '#FF69B4';
        particle.style.boxShadow = `0 0 10px currentColor`;
        particle.style.pointerEvents = 'none';

        // 随机位置
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        particle.style.left = randomX + '%';
        particle.style.top = randomY + '%';

        // 动画
        const angle = (Math.PI * 2 * i) / 6;
        const distance = 30;
        const duration = 1.5 + Math.random() * 0.5;

        particle.style.animation = `particle-float-${i} ${duration}s ease-in-out infinite`;

        // 动态创建关键帧
        const keyframes = `
            @keyframes particle-float-${i} {
                0%, 100% {
                    transform: translate(0, 0);
                    opacity: 0.8;
                }
                50% {
                    transform: translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px);
                    opacity: 0.3;
                }
            }
        `;

        // 添加到页面
        if (!document.getElementById(`particle-keyframe-${i}`)) {
            const style = document.createElement('style');
            style.id = `particle-keyframe-${i}`;
            style.textContent = keyframes;
            document.head.appendChild(style);
        }

        particlesContainer.appendChild(particle);
    }
}

// 心愿卡片点击效果
function wishCardClickEffect(card) {
    // 创建点击波纹
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'radial-gradient(circle, rgba(0, 245, 255, 0.6), transparent)';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '10';

    card.appendChild(ripple);

    // 扩散动画
    let scale = 1;
    let opacity = 0.6;
    const animate = () => {
        scale += 0.1;
        opacity -= 0.03;
        ripple.style.transform = `translate(-50%, -50%) scale(${scale})`;
        ripple.style.opacity = opacity;

        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            ripple.remove();
        }
    };

    animate();

    // 发射星星
    for (let i = 0; i < 8; i++) {
        const star = document.createElement('div');
        star.textContent = '✨';
        star.style.position = 'fixed';
        star.style.left = (card.offsetLeft + card.offsetWidth / 2) + 'px';
        star.style.top = (card.offsetTop + card.offsetHeight / 2) + 'px';
        star.style.fontSize = '1.5rem';
        star.style.pointerEvents = 'none';
        star.style.zIndex = '9999';
        document.body.appendChild(star);

        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let posX = card.offsetLeft + card.offsetWidth / 2;
        let posY = card.offsetTop + card.offsetHeight / 2;
        let opacity = 1;

        const starAnimate = () => {
            posX += vx;
            posY += vy;
            opacity -= 0.02;

            star.style.left = posX + 'px';
            star.style.top = posY + 'px';
            star.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(starAnimate);
            } else {
                star.remove();
            }
        };

        starAnimate();
    }
}

// 添加心愿功能
function addNewWish() {
    const wishName = prompt('✨ 新的心愿是什么？');
    if (!wishName || !wishName.trim()) return;

    const wishDetail = prompt('💭 详细描述一下这个心愿吧：');
    const emoji = prompt('🎭 选择一个emoji（比如：🎮、🎸、🚀）') || '⭐';

    // 创建新的心愿卡片
    const wishList = document.querySelector('.wish-list');
    const newWish = document.createElement('div');
    newWish.className = 'wish-star pending';
    newWish.style.opacity = '0';
    newWish.style.transform = 'translateY(30px)';

    newWish.innerHTML = `
        <div class="star-ring"></div>
        <div class="wish-icon">${emoji}</div>
        <div class="wish-content">
            <h3 class="wish-name">${wishName}</h3>
            <p class="wish-detail">${wishDetail || '等待实现中...'}</p>
            <div class="wish-progress">
                <span class="wish-status">✨ 等待实现</span>
            </div>
        </div>
        <div class="star-particles"></div>
    `;

    wishList.appendChild(newWish);

    // 动画显示
    setTimeout(() => {
        newWish.style.transition = 'all 0.6s ease';
        newWish.style.opacity = '1';
        newWish.style.transform = 'translateY(0)';
    }, 100);

    // 绑定事件
    newWish.addEventListener('click', function() {
        wishCardClickEffect(this);
    });

    newWish.addEventListener('mouseenter', function() {
        createWishParticles(this);
    });

    // 更新统计
    updateWishStats();

    // 成功提示
    showNotification('✨ 新心愿已添加到星球！');
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'linear-gradient(135deg, #7B68EE, #FF69B4)';
    notification.style.color = 'white';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '50px';
    notification.style.fontSize = '1.1rem';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 10px 40px rgba(123, 104, 238, 0.5)';
    notification.style.opacity = '0';
    notification.style.transition = 'all 0.4s ease';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.top = '120px';
    }, 100);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.top = '100px';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// 更新统计数据
function updateWishStats() {
    const allWishes = document.querySelectorAll('.wish-star');
    const completedWishes = document.querySelectorAll('.wish-star.completed');
    const pendingWishes = allWishes.length - completedWishes.length;
    const completeRate = Math.round((completedWishes.length / allWishes.length) * 100);

    const stats = document.querySelectorAll('.stat-num');
    if (stats.length >= 4) {
        stats[0].textContent = allWishes.length;
        stats[1].textContent = completedWishes.length;
        stats[2].textContent = pendingWishes;
        stats[3].textContent = completeRate + '%';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 为每个心愿卡片添加悬停粒子效果
    const wishCards = document.querySelectorAll('.wish-star');
    wishCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            createWishParticles(this);
        });

        card.addEventListener('click', function() {
            wishCardClickEffect(this);
        });
    });

    // 添加心愿按钮
    const addBtn = document.querySelector('.add-wish-btn');
    if (addBtn) {
        addBtn.addEventListener('click', addNewWish);
    }

    // 进场动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    wishCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
});
