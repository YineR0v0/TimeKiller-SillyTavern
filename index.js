
(function() {
    const EXTENSION_NAME = "tavern-timekiller"; 
    const EXTENSION_ID = 'tavern-timekiller-host';
    
    const oldHost = document.getElementById(EXTENSION_ID);
    if (oldHost) oldHost.remove();

    console.log(`${EXTENSION_NAME}: Loading Modular React Version...`);

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
    iframe.src = `scripts/extensions/${EXTENSION_NAME}/index.html`;
    Object.assign(iframe.style, {
        border: 'none', width: '100vw', height: '100vh',
        position: 'fixed', top: '0', left: '0',
        pointerEvents: 'none',
        background: 'transparent'
    });

    launcherBtn.onclick = () => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage('TOGGLE_WINDOW', '*');
        }
    };

    shadow.appendChild(iframe);
    shadow.appendChild(launcherBtn);
})();
