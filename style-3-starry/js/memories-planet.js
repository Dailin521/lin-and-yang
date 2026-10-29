// 回忆星球交互

// 照片过滤
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const memoryGroups = document.querySelectorAll('.memory-group');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            memoryGroups.forEach(group => {
                if (filter === 'all') {
                    group.style.display = 'block';
                    group.style.opacity = '1';
                } else {
                    // 可根据需要添加具体的过滤逻辑
                    group.style.display = 'block';
                    group.style.opacity = '1';
                }
            });
        });
    });
});

// 照片卡片点击效果
document.addEventListener('DOMContentLoaded', () => {
    const photoCards = document.querySelectorAll('.photo-card');

    photoCards.forEach(card => {
        card.addEventListener('click', function() {
            // 创建点击涟漪
            const rect = this.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // 创建照片查看器或放大效果
            createPhotoViewer(this);
        });
    });
});

// 创建照片查看器
function createPhotoViewer(card) {
    const img = card.querySelector('img');
    const caption = card.querySelector('.photo-caption')?.textContent || '';
    const credit = card.querySelector('.photo-credit')?.textContent || '';

    const viewer = document.createElement('div');
    viewer.className = 'photo-viewer';
    viewer.innerHTML = `
        <div class="viewer-overlay"></div>
        <div class="viewer-content">
            <button class="viewer-close">✕</button>
            <img src="${img.src}" alt="放大照片">
            <div class="viewer-info">
                <p class="viewer-caption">${caption}</p>
                <p class="viewer-credit">${credit}</p>
            </div>
        </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .photo-viewer {
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

        .viewer-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(5px);
        }

        .viewer-content {
            position: relative;
            z-index: 1;
            max-width: 90vh;
            max-height: 90vh;
            background: rgba(27, 38, 59, 0.95);
            border-radius: 30px;
            border: 2px solid rgba(0, 245, 255, 0.5);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: zoomIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes zoomIn {
            from {
                transform: scale(0.8);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }

        .viewer-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            width: 50px;
            height: 50px;
            background: rgba(123, 104, 238, 0.3);
            border: 2px solid var(--cyan);
            border-radius: 50%;
            color: var(--cyan);
            font-size: 2rem;
            cursor: pointer;
            z-index: 2;
            transition: all 0.3s;
        }

        .viewer-close:hover {
            background: var(--cyan);
            color: #0A1128;
            transform: scale(1.1);
        }

        .viewer-content img {
            width: 100%;
            height: auto;
            max-height: 70vh;
            object-fit: contain;
        }

        .viewer-info {
            padding: 2rem;
            text-align: center;
            background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5));
        }

        .viewer-caption {
            font-size: 1.3rem;
            color: var(--cyan);
            margin-bottom: 0.8rem;
        }

        .viewer-credit {
            font-size: 1rem;
            color: var(--pink);
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(viewer);

    // 关闭按钮
    const closeBtn = viewer.querySelector('.viewer-close');
    const overlay = viewer.querySelector('.viewer-overlay');

    closeBtn.addEventListener('click', () => {
        viewer.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => viewer.remove(), 300);
    });

    overlay.addEventListener('click', () => {
        viewer.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => viewer.remove(), 300);
    });

    // 键盘关闭
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            viewer.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => viewer.remove(), 300);
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
}

// 上传按钮交互
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.querySelector('.hint-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            alert('💭 照片上传功能即将推出！\n敬请期待 ✨');
        });
    }
});
