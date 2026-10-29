// 音乐星球交互

let isPlaying = false;

document.addEventListener('DOMContentLoaded', () => {
    // 播放按钮
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', togglePlay);
    }

    // 歌曲播放按钮
    const playSongBtns = document.querySelectorAll('.play-song-btn');
    playSongBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSong(index + 1);
        });
    });

    // 歌单卡片点击
    const playlistCards = document.querySelectorAll('.playlist-card');
    playlistCards.forEach(card => {
        card.addEventListener('click', function() {
            showPlaylistDetail(this);
        });
    });

    // 歌曲项目进场动画
    animateSongItems();
});

// 播放/暂停
function togglePlay() {
    const playBtn = document.querySelector('.play-btn');
    const progressBar = document.querySelector('.progress-bar');

    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸' : '▶';

    if (isPlaying) {
        animateProgress();
        showNotification('🎵 现在播放：Memories in the Starlight');
    } else {
        showNotification('⏸ 已暂停');
    }
}

// 进度条动画
function animateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const duration = 1000; // 模拟的完整时长（毫秒）
    const startTime = Date.now();

    function animate() {
        if (!isPlaying) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        progressFill.style.width = progress + '%';

        if (progress < 100) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// 播放指定歌曲
function playSong(index) {
    const songs = [
        '星空下的对话',
        '因为有你',
        '那些年',
        '陪你看风景',
        '永不落幕',
        '未来的我们',
        '越过山丘',
        '你在我心里',
        '一辈子的承诺',
        '星辰闪烁'
    ];

    const songTitle = songs[index - 1];
    showNotification(`🎵 现在播放：${songTitle}`);

    isPlaying = true;
    const playBtn = document.querySelector('.play-btn');
    playBtn.textContent = '⏸';

    createMusicParticles();
}

// 显示歌单详情
function showPlaylistDetail(card) {
    const name = card.querySelector('.playlist-name').textContent;
    const desc = card.querySelector('.playlist-desc').textContent;
    const songCount = card.querySelector('.song-count').textContent;

    showNotification(`🎧 已打开歌单：${name}`);
}

// 歌曲项目进场动画
function animateSongItems() {
    const songItems = document.querySelectorAll('.song-item');

    songItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'all 0.5s ease';

        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// 音乐粒子效果
function createMusicParticles() {
    const colors = ['#FF1493', '#9D4EDD', '#00F5FF', '#FFD700'];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.textContent = '🎵';
        particle.style.position = 'fixed';
        particle.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 200) + 'px';
        particle.style.top = (window.innerHeight / 2 + (Math.random() - 0.5) * 200) + 'px';
        particle.style.fontSize = (Math.random() * 20 + 20) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.userSelect = 'none';
        particle.style.filter = `drop-shadow(0 0 10px ${colors[i % colors.length]})`;

        document.body.appendChild(particle);

        const vx = (Math.random() - 0.5) * 6;
        const vy = (Math.random() - 0.5) * 6 - 3;
        let posX = parseFloat(particle.style.left);
        let posY = parseFloat(particle.style.top);
        let opacity = 1;
        let rotation = 0;

        function animate() {
            posX += vx;
            posY += vy;
            opacity -= 0.02;
            rotation += 15;

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
}

// 通知提示
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'linear-gradient(135deg, #FF1493, #9D4EDD)';
    notification.style.color = 'white';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '50px';
    notification.style.fontSize = '1.1rem';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 10px 40px rgba(255, 20, 147, 0.5)';
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
