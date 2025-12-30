
(function() {
    const EXTENSION_ID = 'tavern-timekiller-host';
    
    // 动态获取当前脚本路径，解决文件夹重命名导致的 404 问题
    let extensionRoot = '';
    const scriptName = 'index.js';
    
    if (document.currentScript) {
        extensionRoot = document.currentScript.src.replace('/' + scriptName, '');
    } else {
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
             if (script.src && script.src.includes(scriptName)) {
                 // 简单的启发式搜索
                 if (script.src.includes('tavern-timekiller') || script.src.includes('extensions')) {
                    extensionRoot = script.src.replace('/' + scriptName, '');
                    break;
                 }
             }
        }
    }

    // 如果仍然找不到，回退到默认值
    if (!extensionRoot) {
        extensionRoot = 'scripts/extensions/tavern-timekiller';
    }

    console.log(`Tavern Timekiller: Root detected at ${extensionRoot}`);

    const oldHost = document.getElementById(EXTENSION_ID);
    if (oldHost) oldHost.remove();

    const host = document.createElement('div');
    host.id = EXTENSION_ID;
    Object.assign(host.style, {
        position: 'fixed', top: '0', left: '0', width: '0', height: '0', zIndex: '2147483647'
    });
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Launcher Button
    const launcherBtn = document.createElement('div');
    launcherBtn.innerHTML = '🌱';
    Object.assign(launcherBtn.style, {
        position: 'fixed', bottom: '20px', right: '20px', width: '50px', height: '50px',
        backgroundColor: '#1a1b26', border: '2px solid #4ade80', borderRadius: '50%',
        color: 'white', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 0 15px rgba(74, 222, 128, 0.4)', zIndex: '2147483647',
        userSelect: 'none', transition: 'transform 0.2s', fontFamily: 'Segoe UI Emoji, sans-serif'
    });
    
    launcherBtn.onmouseenter = () => launcherBtn.style.transform = 'scale(1.1)';
    launcherBtn.onmouseleave = () => launcherBtn.style.transform = 'scale(1)';
    
    const iframe = document.createElement('iframe');
    iframe.src = `${extensionRoot}/index.html`; // 使用动态路径
    Object.assign(iframe.style, {
        border: 'none', width: '100vw', height: '100vh',
        position: 'fixed', top: '0', left: '0',
        pointerEvents: 'none',
        background: 'transparent'
    });

    window.addEventListener('message', (event) => {
        if (!iframe.contentWindow || event.source !== iframe.contentWindow) return;

        if (event.data && event.data.type === 'ST_MAKE_INTERACTIVE') {
            iframe.style.pointerEvents = 'auto';
        }
        if (event.data && event.data.type === 'ST_MAKE_INACTIVE') {
            iframe.style.pointerEvents = 'none';
        }
    });

    launcherBtn.onclick = () => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage('TOGGLE_WINDOW', '*');
        }
    };

    shadow.appendChild(iframe);
    shadow.appendChild(launcherBtn);
})();
