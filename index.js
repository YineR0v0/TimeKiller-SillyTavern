
(function() {
    const EXTENSION_ID = 'tavern-timekiller-host';
    const SCRIPT_NAME = 'index.js';
    
    // --- 1. 路径检测逻辑 ---
    let extensionRoot = '';
    if (document.currentScript && document.currentScript.src) {
        extensionRoot = document.currentScript.src;
        extensionRoot = extensionRoot.substring(0, extensionRoot.lastIndexOf('/'));
    } else {
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

    if (!extensionRoot || extensionRoot.length < 5) {
        console.warn('Tavern Timekiller: Path detection failed, using default path.');
        extensionRoot = '/scripts/extensions/tavern-timekiller';
    }

    // --- 2. 清理旧实例 ---
    const oldHost = document.getElementById(EXTENSION_ID);
    if (oldHost) oldHost.remove();

    // --- 3. 创建宿主容器 ---
    const host = document.createElement('div');
    host.id = EXTENSION_ID;
    Object.assign(host.style, {
        position: 'fixed', top: '0', left: '0', width: '0', height: '0', 
        zIndex: '20000' 
    });
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // --- 4. 创建启动按钮 ---
    const launcherBtn = document.createElement('div');
    launcherBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="6" y1="12" x2="10" y2="12"></line>
        <line x1="8" y1="10" x2="8" y2="14"></line>
        <line x1="15" y1="13" x2="15.01" y2="13"></line>
        <line x1="18" y1="11" x2="18.01" y2="11"></line>
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    </svg>`;
    
    Object.assign(launcherBtn.style, {
        position: 'fixed', bottom: '100px', right: '20px', 
        width: '48px', height: '48px',
        backgroundColor: '#1a1b26', border: '2px solid #4ade80', borderRadius: '50%',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: '20001',
        userSelect: 'none', transition: 'transform 0.1s', touchAction: 'none'
    });

    launcherBtn.onmouseenter = () => launcherBtn.style.transform = 'scale(1.1)';
    launcherBtn.onmouseleave = () => launcherBtn.style.transform = 'scale(1)';

    // --- 5. 创建 iframe ---
    const iframe = document.createElement('iframe');
    iframe.src = `${extensionRoot}/index.html`;
    
    Object.assign(iframe.style, {
        border: 'none', width: '100vw', height: '100vh',
        position: 'fixed', top: '0', left: '0',
        pointerEvents: 'none',
        background: 'transparent'
    });

    // --- SillyTavern 数据同步与交互逻辑 ---
    const syncTavernData = () => {
        if (!iframe.contentWindow) return;

        // 获取 SillyTavern CSS 变量
        const style = getComputedStyle(document.body);
        const tavernColors = {
            bgBase: style.getPropertyValue('--bg_color') || '#0b0f19',
            bgHeader: style.getPropertyValue('--drawer_bg') || style.getPropertyValue('--bg_color') || '#111b27',
            textMain: style.getPropertyValue('--main_text_color') || '#e2e8f0',
            textDim: style.getPropertyValue('--italics_text_color') || '#94a3b8',
            border: style.getPropertyValue('--border_color') || '#1e293b',
            primary: style.getPropertyValue('--smart-theme-accent') || '#4ade80', 
            panel: style.getPropertyValue('--block_bg') || style.getPropertyValue('--element_bg') || '#1e293b'
        };

        // 获取用户名 ({{user}}) 和 角色名 ({{char}})
        // SillyTavern 的全局变量通常是 name1 (User) 和 name2 (Character)
        const userName = window.name1 || '旅行者';
        const charName = window.name2 || '伙伴';

        iframe.contentWindow.postMessage({
            type: 'TK_SYNC_DATA',
            payload: {
                colors: tavernColors,
                userName: userName,
                charName: charName
            }
        }, '*');
    };

    // 执行 SillyTavern Slash Command
    const executeSlashCommand = (command) => {
        // 尝试调用酒馆的全局命令处理器
        if (window.slash_commands && typeof window.slash_commands.processSlashCommand === 'function') {
            window.slash_commands.processSlashCommand(command);
        } else {
            console.warn('Tavern Timekiller: Slash commands API not found.');
        }
    };

    // 监听来自 iframe 的消息
    window.addEventListener('message', (event) => {
        if (!iframe.contentWindow || event.source !== iframe.contentWindow) return;

        // 窗口交互状态
        if (event.data && event.data.type === 'ST_MAKE_INTERACTIVE') {
            iframe.style.pointerEvents = 'auto';
            syncTavernData();
        }
        if (event.data && event.data.type === 'ST_MAKE_INACTIVE') {
            iframe.style.pointerEvents = 'none';
        }
        // 数据同步请求
        if (event.data && event.data.type === 'TK_REQUEST_SYNC') {
            syncTavernData();
        }
        // 执行酒馆命令 (新增)
        if (event.data && event.data.type === 'TK_EXECUTE_COMMAND') {
            executeSlashCommand(event.data.payload);
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

        launcherBtn.style.bottom = 'auto';
        launcherBtn.style.right = 'auto';
        launcherBtn.style.left = `${initialLeft}px`;
        launcherBtn.style.top = `${initialTop}px`;
        launcherBtn.style.transition = 'none';
        
        document.addEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', handleDragMove, { passive: false });
        document.addEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', handleDragEnd);
    };

    const handleDragMove = (e) => {
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
            e.preventDefault();
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
        if (!isDragging && (Date.now() - dragStartTime < 300)) {
            handleClick();
        }
    };

    const handleClick = () => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage('TOGGLE_WINDOW', '*');
        } else {
            iframe.src = iframe.src;
        }
    };

    launcherBtn.addEventListener('mousedown', handleDragStart);
    launcherBtn.addEventListener('touchstart', handleDragStart, { passive: false });
    launcherBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (confirm('Tavern Timekiller: 重载插件？')) iframe.src = iframe.src;
    });

    shadow.appendChild(iframe);
    shadow.appendChild(launcherBtn);
})();
