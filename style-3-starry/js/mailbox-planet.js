// 时光邮局交互

document.addEventListener('DOMContentLoaded', () => {
    // 设置今天的日期作为默认值
    const dateInput = document.getElementById('letter-date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
        dateInput.min = `${year}-${month}-${day}`;
    }

    // 寄出信件按钮
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', sendLetter);
    }

    // 重新阅读按钮
    const rereadBtns = document.querySelectorAll('.reread-btn');
    rereadBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showLetterContent(btn);
        });
    });

    // 信件卡片点击效果
    const letterCards = document.querySelectorAll('.letter-card');
    letterCards.forEach(card => {
        card.addEventListener('click', function() {
            createLetterParticles(this);
        });
    });
});

// 寄出信件
function sendLetter() {
    const to = document.getElementById('letter-to').value;
    const date = document.getElementById('letter-date').value;
    const title = document.getElementById('letter-title').value;
    const content = document.getElementById('letter-content').value;

    if (!date || !title || !content) {
        showNotification('💌 请填写所有信息哦');
        return;
    }

    // 创建成功动画
    createMailParticles();

    showNotification('✨ 信件已寄出！时光会为你妥善保管 ✨');

    // 清空表单
    document.getElementById('letter-to').value = 'both';
    document.getElementById('letter-date').value = '';
    document.getElementById('letter-title').value = '';
    document.getElementById('letter-content').value = '';

    // 重新设置最小日期
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    document.getElementById('letter-date').value = `${year}-${month}-${day}`;
    document.getElementById('letter-date').min = `${year}-${month}-${day}`;
}

// 显示信件内容
function showLetterContent(button) {
    const card = button.closest('.letter-card');
    const title = card.querySelector('.letter-title').textContent;
    const content = card.querySelector('.letter-content-preview p').textContent;

    const modal = document.createElement('div');
    modal.className = 'letter-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">✕</button>
            <h2 class="modal-title">${title}</h2>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .letter-modal {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .modal-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(5px);
        }

        .modal-content {
            position: relative;
            z-index: 1;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1));
            border: 2px solid rgba(255, 215, 0, 0.5);
            border-radius: 30px;
            padding: 3rem;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);
            animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .modal-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            width: 45px;
            height: 45px;
            background: rgba(255, 215, 0, 0.2);
            border: 2px solid rgba(255, 215, 0, 0.5);
            border-radius: 50%;
            color: var(--gold);
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.3s;
            z-index: 2;
        }

        .modal-close:hover {
            background: var(--gold);
            color: #0A1128;
        }

        .modal-title {
            font-size: 2rem;
            color: var(--gold);
            margin-bottom: 2rem;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .modal-body {
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.9);
            line-height: 2;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // 关闭按钮
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', () => closeModal(modal));
    overlay.addEventListener('click', () => closeModal(modal));

    // ESC键关闭
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
}

function closeModal(modal) {
    modal.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => modal.remove(), 300);
}

// 寄出信件粒子效果
function createMailParticles() {
    const colors = ['#FFD700', '#FF8C00', '#FF69B4', '#00F5FF'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.textContent = i % 2 === 0 ? '💌' : '✨';
        particle.style.position = 'fixed';
        particle.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 200) + 'px';
        particle.style.top = (window.innerHeight / 2 + (Math.random() - 0.5) * 200) + 'px';
        particle.style.fontSize = (Math.random() * 20 + 20) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.userSelect = 'none';
        particle.style.filter = `drop-shadow(0 0 10px ${colors[i % colors.length]})`;

        document.body.appendChild(particle);

        const vx = (Math.random() - 0.5) * 8;
        const vy = (Math.random() - 0.5) * 8 - 4;
        let posX = parseFloat(particle.style.left);
        let posY = parseFloat(particle.style.top);
        let opacity = 1;
        let rotation = 0;

        function animateParticle() {
            posX += vx;
            posY += vy;
            opacity -= 0.02;
            rotation += 15;

            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;
            particle.style.transform = `rotate(${rotation}deg)`;

            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }

        animateParticle();
    }
}

// 信件卡片粒子效果
function createLetterParticles(card) {
    const rect = card.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.textContent = '✨';
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = '1.5rem';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';

        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 4;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let posX = x;
        let posY = y;
        let opacity = 1;

        function animate() {
            posX += vx;
            posY += vy;
            opacity -= 0.03;

            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }

        animate();
    }
}

// 通知提示
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'linear-gradient(135deg, #FFD700, #FF8C00)';
    notification.style.color = '#0A1128';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '50px';
    notification.style.fontSize = '1.1rem';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 10px 40px rgba(255, 215, 0, 0.5)';
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
