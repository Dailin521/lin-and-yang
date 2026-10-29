// 星空背景生成器
class Starfield {
    constructor() {
        this.canvas = document.getElementById('starfield');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.shootingStars = [];
        this.mouse = { x: 0, y: 0 };

        this.resize();
        this.createStars();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // 每3秒创建一颗流星
        setInterval(() => this.createShootingStar(), 3000);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = document.body.scrollHeight;
    }

    createStars() {
        const starCount = Math.floor((this.canvas.width * this.canvas.height) / 8000);
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    createShootingStar() {
        if (Math.random() < 0.5) { // 50% 概率
            this.shootingStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height / 2,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 10 + 5,
                opacity: 1
            });
        }
    }

    drawStars() {
        this.stars.forEach(star => {
            // 闪烁效果
            star.opacity += star.twinkleSpeed;
            if (star.opacity > 1 || star.opacity < 0.3) {
                star.twinkleSpeed *= -1;
            }

            // 鼠标交互
            const dx = this.mouse.x - star.x;
            const dy = this.mouse.y - star.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const force = (150 - distance) / 150;
                star.x -= dx * force * 0.03;
                star.y -= dy * force * 0.03;
            }

            // 绘制星星
            const gradient = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.size * 2
            );

            const colors = ['#00F5FF', '#7B68EE', '#FF69B4', '#FFD700'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = star.opacity;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawShootingStars() {
        this.shootingStars.forEach((star, index) => {
            star.x += star.speed;
            star.y += star.speed * 0.5;
            star.opacity -= 0.015;

            if (star.opacity <= 0) {
                this.shootingStars.splice(index, 1);
                return;
            }

            const gradient = this.ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.length, star.y - star.length * 0.5
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - star.length, star.y - star.length * 0.5);
            this.ctx.stroke();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;

        this.drawStars();
        this.drawShootingStars();

        requestAnimationFrame(() => this.animate());
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new Starfield();
});
