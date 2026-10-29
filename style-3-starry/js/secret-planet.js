// 秘密基地交互

// 正确密码 (可以修改为你们的日期，格式：YYYYMMDD)
const CORRECT_PASSWORD = '20241024';
let attempts = 5;

document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已解锁
    if (localStorage.getItem('secretUnlocked') === 'true') {
        unlockContent();
    }

    // 回车键提交
    const passwordField = document.getElementById('passwordField');
    if (passwordField) {
        passwordField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }

    // 宝盒按钮
    const openBoxBtns = document.querySelectorAll('.open-box-btn');
    openBoxBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openSecretBox(index + 1);
        });
    });

    // 彩蛋项目
    const eggItems = document.querySelectorAll('.egg-item.unlocked');
    eggItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            triggerEasterEgg(index + 1);
        });
    });
});

// 检查密码
function checkPassword() {
    const input = document.getElementById('passwordField');
    const password = input.value;

    if (password === CORRECT_PASSWORD) {
        // 密码正确
        createUnlockEffect();
        setTimeout(() => {
            localStorage.setItem('secretUnlocked', 'true');
            unlockContent();
        }, 1500);
    } else {
        // 密码错误
        attempts--;

        if (attempts > 0) {
            showNotification(`❌ 密码错误！还剩 ${attempts} 次机会`);
            document.getElementById('attempts').textContent = `剩余尝试次数：${attempts}`;
            input.value = '';
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        } else {
            showNotification('🔒 尝试次数用尽！请稍后再试');
            input.disabled = true;
            document.querySelector('.unlock-btn').disabled = true;
        }
    }
}

// 解锁内容
function unlockContent() {
    const lockScreen = document.getElementById('lockScreen');
    const secretContent = document.getElementById('secretContent');

    lockScreen.style.opacity = '0';
    lockScreen.style.transform = 'scale(1.2)';
    lockScreen.style.transition = 'all 0.8s ease';

    setTimeout(() => {
        lockScreen.style.display = 'none';
        secretContent.style.display = 'block';
    }, 800);
}

// 解锁特效
function createUnlockEffect() {
    const colors = ['#7B68EE', '#FF1493', '#00F5FF', '#FFD700'];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.textContent = ['✨', '🔓', '💫', '⭐'][i % 4];
        particle.style.position = 'fixed';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.fontSize = (Math.random() * 30 + 20) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '10001';
        particle.style.filter = `drop-shadow(0 0 10px ${colors[i % colors.length]})`;

        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = Math.random() * 5 + 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let posX = window.innerWidth / 2;
        let posY = window.innerHeight / 2;
        let opacity = 1;
        let rotation = 0;

        function animate() {
            posX += vx;
            posY += vy;
            opacity -= 0.015;
            rotation += 10;

            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;
            particle.style.transform = `rotate(${rotation}deg)`;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }

        animate();
    }

    showNotification('🎉 解锁成功！欢迎来到秘密基地 🎉');
}

// 打开秘密宝盒
function openSecretBox(boxNum) {
    const boxNames = [
        '情话收藏',
        '私密相册',
        '纪念日历',
        '私密留言',
        '时光密码',
        '角色扮演',
        '愿望清单+',
        '涂鸦板'
    ];

    const boxMessages = [
        '💝 这里收藏着我想对你说的所有甜蜜话语...',
        '📷 这些照片记录了我们最真实的瞬间...',
        '🎂 每一个日子都值得被铭记...',
        '💌 你有一条新的私密留言...',
        '🗝️ 我们的专属暗号：只有彼此才懂...',
        '🎭 今天想玩什么角色呢？',
        '🌟 那些更私密的小心愿...',
        '🎨 来给对方画幅画吧！'
    ];

    showNotification(`${boxMessages[boxNum - 1]}`);
    createBoxParticles();
}

// 宝盒粒子效果
function createBoxParticles() {
    const emojis = ['💝', '✨', '💫', '🌟', '💕', '💖'];

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.textContent = emojis[i % emojis.length];
        particle.style.position = 'fixed';
        particle.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 100) + 'px';
        particle.style.top = (window.innerHeight / 2 + (Math.random() - 0.5) * 100) + 'px';
        particle.style.fontSize = (Math.random() * 20 + 25) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';

        document.body.appendChild(particle);

        const vx = (Math.random() - 0.5) * 8;
        const vy = (Math.random() - 0.5) * 8;
        let posX = parseFloat(particle.style.left);
        let posY = parseFloat(particle.style.top);
        let opacity = 1;
        let scale = 1;

        function animate() {
            posX += vx;
            posY += vy;
            opacity -= 0.02;
            scale += 0.02;

            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;
            particle.style.transform = `scale(${scale})`;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }

        animate();
    }
}

// 触发彩蛋
function triggerEasterEgg(eggNum) {
    const eggActions = {
        1: () => {
            showNotification('🍇 啊～张嘴～ 递葡萄ing...');
            createGrapeEffect();
        },
        2: () => {
            showNotification('📚 暗号确认！「读书」行动开始！');
            createBookEffect();
        }
    };

    if (eggActions[eggNum]) {
        eggActions[eggNum]();
    }
}

// 葡萄特效
function createGrapeEffect() {
    for (let i = 0; i < 10; i++) {
        const grape = document.createElement('div');
        grape.textContent = '🍇';
        grape.style.position = 'fixed';
        grape.style.left = Math.random() * window.innerWidth + 'px';
        grape.style.top = '-50px';
        grape.style.fontSize = '2rem';
        grape.style.pointerEvents = 'none';
        grape.style.zIndex = '9999';

        document.body.appendChild(grape);

        let posY = -50;
        const speed = Math.random() * 3 + 2;

        function fall() {
            posY += speed;
            grape.style.top = posY + 'px';

            if (posY < window.innerHeight) {
                requestAnimationFrame(fall);
            } else {
                grape.remove();
            }
        }

        setTimeout(() => fall(), i * 200);
    }
}

// 书本特效
function createBookEffect() {
    const books = ['📕', '📗', '📘', '📙'];

    for (let i = 0; i < 8; i++) {
        const book = document.createElement('div');
        book.textContent = books[i % books.length];
        book.style.position = 'fixed';
        book.style.left = '50%';
        book.style.top = '50%';
        book.style.fontSize = '2.5rem';
        book.style.pointerEvents = 'none';
        book.style.zIndex = '9999';

        document.body.appendChild(book);

        const angle = (Math.PI * 2 * i) / 8;
        const radius = 150;
        let time = 0;

        function orbit() {
            time += 0.05;
            const x = window.innerWidth / 2 + Math.cos(angle + time) * radius;
            const y = window.innerHeight / 2 + Math.sin(angle + time) * radius;

            book.style.left = x + 'px';
            book.style.top = y + 'px';
            book.style.transform = `rotate(${time * 50}deg)`;

            if (time < Math.PI * 2) {
                requestAnimationFrame(orbit);
            } else {
                book.remove();
            }
        }

        orbit();
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
    notification.style.background = 'linear-gradient(135deg, #7B68EE, #FF1493)';
    notification.style.color = 'white';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '50px';
    notification.style.fontSize = '1.1rem';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 10px 40px rgba(123, 104, 238, 0.5)';
    notification.style.opacity = '0';
    notification.style.transition = 'all 0.4s ease';
    notification.style.maxWidth = '90%';
    notification.style.textAlign = 'center';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.top = '120px';
    }, 100);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.top = '100px';
        setTimeout(() => notification.remove(), 400);
    }, 3500);
}

// 添加震动动画
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    .shake {
        animation: shake 0.5s;
    }
`;
document.head.appendChild(style);
