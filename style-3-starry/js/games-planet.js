// 游戏星球交互

function playGame(gameName) {
    const messages = {
        'match': '🎯 配对消消乐游戏将推出！\n敬请期待 ✨',
        'number': '🔢 数字猜猜游戏将推出！\n敬请期待 ✨',
        'reaction': '⚡ 快速反应游戏将推出！\n敬请期待 ✨',
        'quiz': '❓ 问答挑战游戏将推出！\n敬请期待 ✨',
        'wheel': '🎡 幸运转盘游戏将推出！\n敬请期待 ✨'
    };

    showGameAlert(messages[gameName] || '游戏即将推出！');
}

function showGameAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'game-alert';
    alert.textContent = message;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .game-alert {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #7B68EE, #FF69B4);
            color: white;
            padding: 2.5rem 3rem;
            border-radius: 30px;
            font-size: 1.3rem;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(123, 104, 238, 0.5);
            white-space: pre-line;
            line-height: 1.8;
            animation: popup 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            max-width: 400px;
        }

        @keyframes popup {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            60% {
                transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }

        .game-alert.close {
            animation: popdown 0.4s ease forwards;
        }

        @keyframes popdown {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(alert);

    // 3秒后关闭
    setTimeout(() => {
        alert.classList.add('close');
        setTimeout(() => alert.remove(), 400);
    }, 3000);

    // 点击关闭
    alert.addEventListener('click', () => {
        alert.classList.add('close');
        setTimeout(() => alert.remove(), 400);
    });
}

// 页面加载动画
document.addEventListener('DOMContentLoaded', () => {
    // 排行榜项目进场动画已在CSS中实现

    // 游戏卡片点击波纹
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            createRipple(this);
        });
    });
});

function createRipple(element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.5), transparent)';
    ripple.style.borderRadius = '50%';
    ripple.style.top = (event.clientY - rect.top) + 'px';
    ripple.style.left = (event.clientX - rect.left) + 'px';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple-spread 0.8s ease-out';

    // 添加动画
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple-spread {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 800);
}
