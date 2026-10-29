// 星座连线游戏
class ConstellationGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.connections = [];
        this.hoveredStar = null;
        this.selectedStar = null;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        // 创建随机星星
        const starCount = 15;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height - 100) + 50,
                radius: 4,
                glow: Math.random() * 0.5 + 0.5
            });
        }
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.hoveredStar = null;
            this.stars.forEach(star => {
                const dist = Math.sqrt((x - star.x) ** 2 + (y - star.y) ** 2);
                if (dist < 15) {
                    this.hoveredStar = star;
                }
            });
        });

        this.canvas.addEventListener('click', (e) => {
            if (!this.hoveredStar) return;

            if (!this.selectedStar) {
                this.selectedStar = this.hoveredStar;
            } else {
                if (this.selectedStar !== this.hoveredStar) {
                    this.connections.push({
                        from: this.selectedStar,
                        to: this.hoveredStar
                    });
                }
                this.selectedStar = null;
            }
        });

        document.getElementById('clearBtn')?.addEventListener('click', () => {
            this.connections = [];
            this.selectedStar = null;
        });

        document.getElementById('saveBtn')?.addEventListener('click', () => {
            if (this.connections.length > 0) {
                alert('✨ 星座已保存！这是你们的专属图案');
            } else {
                alert('💡 请先连接一些星星吧');
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制连线
        this.connections.forEach(conn => {
            this.ctx.strokeStyle = 'rgba(0, 245, 255, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.stroke();
        });

        // 绘制临时连线（从选中星到鼠标）
        if (this.selectedStar && this.hoveredStar && this.selectedStar !== this.hoveredStar) {
            this.ctx.strokeStyle = 'rgba(255, 105, 180, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.selectedStar.x, this.selectedStar.y);
            this.ctx.lineTo(this.hoveredStar.x, this.hoveredStar.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // 绘制星星
        this.stars.forEach(star => {
            const isHovered = star === this.hoveredStar;
            const isSelected = star === this.selectedStar;

            // 外发光
            const gradient = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, isHovered ? 20 : 12
            );

            if (isSelected) {
                gradient.addColorStop(0, 'rgba(255, 105, 180, 1)');
                gradient.addColorStop(1, 'rgba(255, 105, 180, 0)');
            } else if (isHovered) {
                gradient.addColorStop(0, 'rgba(0, 245, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(0, 245, 255, 0)');
            } else {
                gradient.addColorStop(0, `rgba(255, 255, 255, ${star.glow})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, isHovered ? 8 : star.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // 星核
            this.ctx.fillStyle = isSelected ? '#FF69B4' : (isHovered ? '#00F5FF' : '#FFFFFF');
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, isHovered ? 4 : 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 爱心树浇水功能
document.addEventListener('DOMContentLoaded', () => {
    const treeBtn = document.querySelector('.tree-btn');
    if (treeBtn) {
        treeBtn.addEventListener('click', function() {
            // 创建水滴动画
            for (let i = 0; i < 10; i++) {
                const drop = document.createElement('div');
                drop.textContent = '💧';
                drop.style.position = 'fixed';
                drop.style.left = (this.offsetLeft + Math.random() * 100) + 'px';
                drop.style.top = (this.offsetTop - 50) + 'px';
                drop.style.fontSize = '1.5rem';
                drop.style.pointerEvents = 'none';
                drop.style.zIndex = '9999';
                document.body.appendChild(drop);

                let posY = parseInt(drop.style.top);
                const fallInterval = setInterval(() => {
                    posY += 5;
                    drop.style.top = posY + 'px';
                    drop.style.opacity = 1 - (posY / 300);

                    if (posY > 300) {
                        clearInterval(fallInterval);
                        drop.remove();
                    }
                }, 30);
            }

            this.textContent = '✅ 今日已浇水';
            this.disabled = true;
            this.style.opacity = '0.6';
            this.style.cursor = 'not-allowed';
        });
    }

    // 心情留言发送
    const moodSubmit = document.querySelector('.mood-submit');
    const moodTextarea = document.querySelector('.mood-input textarea');
    const moodMessages = document.querySelector('.mood-messages');

    if (moodSubmit && moodTextarea) {
        moodSubmit.addEventListener('click', function() {
            const text = moodTextarea.value.trim();
            if (!text) {
                alert('💡 请输入一些文字吧');
                return;
            }

            const newMsg = document.createElement('div');
            newMsg.className = 'mood-msg';
            newMsg.innerHTML = `
                <span class="msg-emotion">💕</span>
                <p class="msg-text">${text}</p>
                <span class="msg-time">刚刚</span>
            `;
            newMsg.style.opacity = '0';
            newMsg.style.transform = 'translateY(20px)';

            moodMessages.insertBefore(newMsg, moodMessages.firstChild);

            setTimeout(() => {
                newMsg.style.transition = 'all 0.5s ease';
                newMsg.style.opacity = '1';
                newMsg.style.transform = 'translateY(0)';
            }, 100);

            moodTextarea.value = '';

            // 创建发送特效
            for (let i = 0; i < 5; i++) {
                const sparkle = document.createElement('div');
                sparkle.textContent = '✨';
                sparkle.style.position = 'fixed';
                sparkle.style.left = (window.innerWidth / 2 + Math.random() * 100 - 50) + 'px';
                sparkle.style.top = (window.innerHeight / 2) + 'px';
                sparkle.style.fontSize = '2rem';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.zIndex = '9999';
                document.body.appendChild(sparkle);

                const angle = (Math.PI * 2 * i) / 5;
                const vx = Math.cos(angle) * 3;
                const vy = Math.sin(angle) * 3 - 2;

                let posX = parseInt(sparkle.style.left);
                let posY = parseInt(sparkle.style.top);
                let opacity = 1;

                const sparkleInterval = setInterval(() => {
                    posX += vx;
                    posY += vy;
                    opacity -= 0.02;

                    sparkle.style.left = posX + 'px';
                    sparkle.style.top = posY + 'px';
                    sparkle.style.opacity = opacity;

                    if (opacity <= 0) {
                        clearInterval(sparkleInterval);
                        sparkle.remove();
                    }
                }, 30);
            }
        });
    }

    // 表情选择
    const emotions = document.querySelectorAll('.emotion');
    emotions.forEach(emotion => {
        emotion.addEventListener('click', function() {
            if (moodTextarea) {
                moodTextarea.value += this.textContent;
                moodTextarea.focus();
            }
        });
    });

    // 初始化星座游戏
    new ConstellationGame('constellation');

    // 倒计时更新
    function updateCountdown() {
        // 这里只是示例，实际需要根据真实目标日期计算
        // 为了演示，这里只显示静态数字
    }

    updateCountdown();
    setInterval(updateCountdown, 60000); // 每分钟更新
});
