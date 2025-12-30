
(function() {
    const EXTENSION_ID = 'tavern-timekiller-host';
    const SCRIPT_NAME = 'index.js';
    
    // --- 1. 路径检测逻辑升级 ---
    let extensionRoot = '';
    
    // 尝试获取当前脚本的绝对路径
    if (document.currentScript && document.currentScript.src) {
        extensionRoot = document.currentScript.src;
        // 去掉文件名 index.js
        extensionRoot = extensionRoot.substring(0, extensionRoot.lastIndexOf('/'));
    } else {
        // 遍历查找
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
             if (script.src && script.src.includes(SCRIPT_NAME)) {
                 if (script.src.includes('tavern-timekiller')) {
                    extensionRoot = script.src.substring(0, script.src.lastIndexOf('/'));
                    break;
                 }
             }
        }
    }

    // 强制兜底：如果没找到，或者路径看起来不对（比如是个空字符串），强制使用标准路径
    // 注意：SillyTavern 的标准扩展路径通常是 /scripts/extensions/文件夹名
    if (!extensionRoot || extensionRoot.length < 5) {
        console.warn('Tavern Timekiller: Path detection failed, using default path.');
        extensionRoot = '/scripts/extensions/tavern-timekiller';
    }

    console.log(`Tavern Timekiller: Root set to [${extensionRoot}]`);

    // --- 2. 清理旧实例 ---
    const oldHost = document.getElementById(EXTENSION_ID);
    if (oldHost) oldHost.remove();

    // --- 3. 创建宿主容器 ---
    const host = document.createElement('div');
    host.id = EXTENSION_ID;
    // 降低层级到 20000，确保不遮挡 Toast 和 Modal，但高于普通内容
    Object.assign(host.style, {
        position: 'fixed', top: '0', left: '0', width: '0', height: '0', 
        zIndex: '20000' 
    });
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // --- 4. 创建启动按钮 (可拖动) ---
    const launcherBtn = document.createElement('div');
    // 使用 SVG 游戏手柄图标，避免 Emoji 显示问题
    launcherBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="6" y1="12" x2="10" y2="12"></line>
        <line x1="8" y1="10" x2="8" y2="14"></line>
        <line x1="15" y1="13" x2="15.01" y2="13"></line>
        <line x1="18" y1="11" x2="18.01" y2="11"></line>
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    </svg>`;
    
    // 默认位置上移一点，避免遮挡酒馆底部的输入框或滚动按钮
    Object.assign(launcherBtn.style, {
        position: 'fixed', bottom: '100px', right: '20px', 
        width: '48px', height: '48px',
        backgroundColor: '#1a1b26', border: '2px solid #4ade80', borderRadius: '50%',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: '20001',
        userSelect: 'none', transition: 'transform 0.1s', touchAction: 'none' // 关键：防止触摸滚动
    });

    // 悬停效果
    launcherBtn.onmouseenter = () => launcherBtn.style.transform = 'scale(1.1)';
    launcherBtn.onmouseleave = () => launcherBtn.style.transform = 'scale(1)';

    // --- 5. 创建 iframe ---
    const iframe = document.createElement('iframe');
    iframe.src = `${extensionRoot}/index.html`;
    
    Object.assign(iframe.style, {
        border: 'none', width: '100vw', height: '100vh',
        position: 'fixed', top: '0', left: '0',
        pointerEvents: 'none', // 默认穿透
        background: 'transparent'
    });

    // 消息监听
    window.addEventListener('message', (event) => {
        // 安全检查：只接受来自我们 iframe 的消息
        if (!iframe.contentWindow || event.source !== iframe.contentWindow) return;

        if (event.data && event.data.type === 'ST_MAKE_INTERACTIVE') {
            iframe.style.pointerEvents = 'auto'; // 开启点击拦截
        }
        if (event.data && event.data.type === 'ST_MAKE_INACTIVE') {
            iframe.style.pointerEvents = 'none'; // 关闭点击拦截
        }
    });

    // --- 6. 拖动逻辑 ---
    let isDragging = false;
    let dragStartTime = 0;
    let startX, startY, initialLeft, initialTop;

    const handleDragStart = (e) => {
        isDragging = false;
        dragStartTime = Date.now();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        
        const rect = launcherBtn.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // 转换为 fixed 定位的 left/top 模式，取消 bottom/right
        launcherBtn.style.bottom = 'auto';
        launcherBtn.style.right = 'auto';
        launcherBtn.style.left = `${initialLeft}px`;
        launcherBtn.style.top = `${initialTop}px`;
        launcherBtn.style.transition = 'none'; // 拖动时关闭动画
        
        document.addEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', handleDragMove, { passive: false });
        document.addEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', handleDragEnd);
    };

    const handleDragMove = (e) => {
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const dx = clientX - startX;
        const dy = clientY - startY;

        // 如果移动超过 5px，视为拖动
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
            e.preventDefault(); // 防止页面滚动
        }

        if (isDragging) {
            launcherBtn.style.left = `${initialLeft + dx}px`;
            launcherBtn.style.top = `${initialTop + dy}px`;
        }
    };

    const handleDragEnd = (e) => {
        document.removeEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', handleDragMove);
        document.removeEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', handleDragEnd);
        launcherBtn.style.transition = 'transform 0.1s';
        
        // 如果不是拖动，且时间很短，视为点击
        if (!isDragging && (Date.now() - dragStartTime < 300)) {
            handleClick();
        }
    };

    const handleClick = () => {
        if (iframe.contentWindow) {
            console.log('Tavern Timekiller: Sending toggle command...');
            iframe.contentWindow.postMessage('TOGGLE_WINDOW', '*');
        } else {
            console.error('Tavern Timekiller: Iframe contentWindow is null.');
        }
    };

    // 绑定拖动事件
    launcherBtn.addEventListener('mousedown', handleDragStart);
    launcherBtn.addEventListener('touchstart', handleDragStart, { passive: false });

    // --- 7. 右键修复功能 ---
    launcherBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const confirmReload = confirm('Tavern Timekiller: 是否强制重载插件？\n(如果点不开，请尝试此操作)');
        if (confirmReload) {
            iframe.src = iframe.src; // 刷新 iframe
        }
    });

    shadow.appendChild(iframe);
    shadow.appendChild(launcherBtn);
})();
