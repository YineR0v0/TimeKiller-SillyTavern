
(function() {
    // ----------------------------------------------------------------------
    // TAVERN TIMEKILLER - SILLY TAVERN EXTENSION
    // ----------------------------------------------------------------------
    
    const EXTENSION_ID = 'tavern-timekiller-host';
    
    // 1. Cleanup existing instance
    const oldHost = document.getElementById(EXTENSION_ID);
    if (oldHost) oldHost.remove();

    console.log("Tavern Timekiller: Loading Full Suite...");

    // 2. Create Host
    const host = document.createElement('div');
    host.id = EXTENSION_ID;
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '0'; // Minimal footprint
    host.style.height = '0';
    host.style.zIndex = '2147483647'; // Max Z-Index
    document.body.appendChild(host);

    // 3. Shadow DOM for isolation
    const shadow = host.attachShadow({ mode: 'open' });

    // 4. Launcher Button (Vanilla JS, outside React iframe to be always accessible)
    const launcherBtn = document.createElement('div');
    launcherBtn.innerHTML = `
        <div style="font-size: 24px; line-height: 1;">🌱</div>
    `;
    Object.assign(launcherBtn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        backgroundColor: '#1a1b26',
        border: '2px solid #4ade80',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(74, 222, 128, 0.4)',
        zIndex: '2147483647',
        transition: 'transform 0.2s, box-shadow 0.2s',
        userSelect: 'none'
    });
    
    launcherBtn.onmouseenter = () => {
        launcherBtn.style.transform = 'scale(1.1)';
        launcherBtn.style.boxShadow = '0 0 20px rgba(74, 222, 128, 0.6)';
    };
    launcherBtn.onmouseleave = () => {
        launcherBtn.style.transform = 'scale(1)';
        launcherBtn.style.boxShadow = '0 0 15px rgba(74, 222, 128, 0.4)';
    };
    launcherBtn.onclick = () => {
        const iframe = shadow.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage('TOGGLE_WINDOW', '*');
        } else {
            alert('Game not loaded. Check console for CSP errors.');
        }
    };
    shadow.appendChild(launcherBtn);

    // 5. Iframe Container
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
        border: 'none',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: '0',
        left: '0',
        pointerEvents: 'none', // Allow clicking through empty space
        background: 'transparent'
    });
    shadow.appendChild(iframe);

    // 6. The React Application Bundle
    const appHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <!-- External Dependencies -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet">
    
    <style>
        body { 
            background: transparent !important; 
            margin: 0; 
            overflow: hidden; 
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        #root { 
            width: 100%; 
            height: 100%; 
            pointer-events: none; 
        }
        .window-container { pointer-events: auto; }
        
        /* Scrollbars */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.25); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        
        .no-drag { -webkit-app-region: no-drag; }
        .touch-none { touch-action: none; }
    </style>
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "@google/genai": "https://esm.sh/@google/genai@0.1.1"
      }
    }
    </script>
</head>
<body>
    <div id="root"></div>
    <script>
        window.addEventListener('message', (e) => {
            if (e.data === 'TOGGLE_WINDOW' && window.toggleApp) window.toggleApp();
        });
    </script>
    <script type="text/babel" data-type="module">
        import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
        import { createRoot } from 'react-dom/client';
        import { GoogleGenAI } from '@google/genai';

        // ==========================================
        // 1. TYPES & CONSTANTS
        // ==========================================
        const GameType = {
            MENU: 'MENU', SETTINGS: 'SETTINGS', GAME_2048: 'GAME_2048', MINESWEEPER: 'MINESWEEPER',
            FARMING: 'FARMING', MEMORY: 'MEMORY', TILE_MATCH: 'TILE_MATCH', SNAKE: 'SNAKE',
            TIC_TAC_TOE: 'TIC_TAC_TOE', TETRIS: 'TETRIS', SUDOKU: 'SUDOKU',
            WHACK_A_MOLE: 'WHACK_A_MOLE', TEXT_ADVENTURE: 'TEXT_ADVENTURE'
        };

        // ==========================================
        // 2. UTILS
        // ==========================================
        
        // --- sound.ts ---
        let audioCtx = null;
        const getCtx = () => {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            return audioCtx;
        };
        const playSound = (type, enabled) => {
            if (!enabled) return;
            try {
                const ctx = getCtx();
                if (ctx.state === 'suspended') ctx.resume();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                const now = ctx.currentTime;

                switch (type) {
                    case 'click':
                        osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                        gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.05);
                        osc.start(now); osc.stop(now + 0.05); break;
                    case 'pop':
                        osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                        gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
                        osc.start(now); osc.stop(now + 0.1); break;
                    case 'success':
                        osc.type = 'sine'; osc.frequency.setValueAtTime(500, now); osc.frequency.setValueAtTime(1000, now + 0.1);
                        gain.gain.setValueAtTime(0.1, now); gain.gain.setValueAtTime(0.1, now + 0.1); gain.gain.linearRampToValueAtTime(0, now + 0.3);
                        osc.start(now); osc.stop(now + 0.3); break;
                    case 'fail':
                        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                        gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
                        osc.start(now); osc.stop(now + 0.3); break;
                    case 'water':
                        osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
                        osc.start(now); osc.stop(now + 0.3); break;
                }
            } catch(e) {}
        };

        // --- themes.ts ---
        const themes = {
            dark: { name: '深色模式', colors: { bgBase: 'bg-slate-900/95', bgHeader: 'bg-slate-800/95', textMain: 'text-slate-200', textDim: 'text-slate-400', border: 'border-slate-700/50', primary: 'bg-indigo-600', primaryHover: 'hover:bg-indigo-500', accent: 'text-indigo-400', panel: 'bg-slate-800', success: 'text-green-400', danger: 'text-red-400' } },
            light: { name: '清爽明亮', colors: { bgBase: 'bg-white/95', bgHeader: 'bg-gray-100/95', textMain: 'text-gray-800', textDim: 'text-gray-500', border: 'border-gray-200', primary: 'bg-blue-500', primaryHover: 'hover:bg-blue-400', accent: 'text-blue-600', panel: 'bg-gray-100', success: 'text-green-600', danger: 'text-red-600' } },
            retro: { name: '复古羊皮', colors: { bgBase: 'bg-[#fdf6e3]/95', bgHeader: 'bg-[#eee8d5]/95', textMain: 'text-[#586e75]', textDim: 'text-[#93a1a1]', border: 'border-[#d3cbb7]', primary: 'bg-[#b58900]', primaryHover: 'hover:bg-[#cb4b16]', accent: 'text-[#b58900]', panel: 'bg-[#eee8d5]', success: 'text-[#859900]', danger: 'text-[#dc322f]' } },
            cyberpunk: { name: '赛博朋克', effect: 'shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-cyan-500/30', colors: { bgBase: 'bg-[#09090b]/95', bgHeader: 'bg-[#18181b]/95', textMain: 'text-cyan-400', textDim: 'text-cyan-800', border: 'border-cyan-900', primary: 'bg-pink-600', primaryHover: 'hover:bg-pink-500', accent: 'text-yellow-400', panel: 'bg-[#18181b]', success: 'text-green-400', danger: 'text-red-500' } },
            sakura: { name: '樱花烂漫', colors: { bgBase: 'bg-[#fff0f5]/95', bgHeader: 'bg-[#ffe4e1]/95', textMain: 'text-[#db7093]', textDim: 'text-[#ffb6c1]', border: 'border-[#ffc0cb]', primary: 'bg-[#ff69b4]', primaryHover: 'hover:bg-[#ff1493]', accent: 'text-[#db7093]', panel: 'bg-[#fff5ee]', success: 'text-[#32cd32]', danger: 'text-[#ff4500]' } },
            custom: { name: '自定义', isCustom: true, colors: { bgBase: 'bg-[var(--bg-base)]', bgHeader: 'bg-[var(--bg-header)]', textMain: 'text-[var(--text-main)]', textDim: 'text-[var(--text-dim)]', border: 'border-[var(--border-color)] border', primary: 'bg-[var(--primary-color)]', primaryHover: 'hover:opacity-90', accent: 'text-[var(--accent-color)]', panel: 'bg-[var(--panel-color)]', success: 'text-[var(--success-color)]', danger: 'text-[var(--danger-color)]' } }
        };

        // ==========================================
        // 3. COMPONENTS
        // ==========================================

        // --- ParticleBackground.tsx ---
        const ParticleBackground = ({ theme, config }) => {
            const canvasRef = useRef(null);
            const containerRef = useRef(null);
            useEffect(() => {
                if (!config.enabled || !canvasRef.current || !containerRef.current) return;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                let particles = [], animationFrameId;
                
                const getParticleColor = () => {
                    if (config.color && config.color !== 'auto') return config.color;
                    const map = { 'bg-indigo-600': '#4f46e5', 'bg-blue-500': '#3b82f6', 'bg-[#b58900]': '#b58900', 'bg-pink-600': '#db2777', 'bg-[#ff69b4]': '#ff69b4' };
                    if (theme.isCustom && theme.colors.primary.startsWith('#')) return theme.colors.primary;
                    return map[theme.colors.primary] || '#ffffff';
                };
                
                const resize = () => { if (containerRef.current) { canvas.width = containerRef.current.clientWidth; canvas.height = containerRef.current.clientHeight; } };
                const createParticle = () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5, size: Math.random()*2+1, alpha: Math.random()*0.5+0.1, life: Math.random()*100+100 });
                const init = () => { resize(); particles = Array(Math.min(200, Math.max(10, config.density))).fill(0).map(createParticle); };
                
                const draw = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const color = getParticleColor();
                    particles.forEach((p, i) => {
                        p.x += p.vx; p.y += p.vy; p.life--;
                        if(p.x < 0) p.x = canvas.width; if(p.x > canvas.width) p.x = 0;
                        if(p.y < 0) p.y = canvas.height; if(p.y > canvas.height) p.y = 0;
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fillStyle = color; ctx.globalAlpha = p.alpha * (p.life > 20 ? 1 : p.life/20); ctx.fill();
                        if(p.life <= 0) particles[i] = createParticle();
                    });
                    
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 0.5;
                    const connectionDistance = 60;
                    for (let i = 0; i < particles.length; i++) {
                        for (let j = i + 1; j < particles.length; j++) {
                            const dx = particles[i].x - particles[j].x;
                            const dy = particles[i].y - particles[j].y;
                            if (Math.abs(dx) < connectionDistance && Math.abs(dy) < connectionDistance) {
                                const dist = Math.sqrt(dx*dx + dy*dy);
                                if (dist < connectionDistance) {
                                    ctx.globalAlpha = (1 - dist/connectionDistance) * 0.2;
                                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                                }
                            }
                        }
                    }
                    animationFrameId = requestAnimationFrame(draw);
                };
                init(); draw();
                window.addEventListener('resize', resize);
                return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
            }, [config.enabled, config.density, config.color, theme]);
            if (!config.enabled) return null;
            return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden"><canvas ref={canvasRef} className="block"/></div>;
        };

        // --- FloatingWindow.tsx ---
        const FloatingWindow = ({ title, children, initialPosition = { x: 20, y: 20 }, currentTheme, customColors, particleConfig }) => {
            const [position, setPosition] = useState(initialPosition);
            const [isDragging, setIsDragging] = useState(false);
            const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
            const [isMinimized, setIsMinimized] = useState(false);
            const windowRef = useRef(null);
            const theme = themes[currentTheme];

            const getStyle = () => {
                if (currentTheme !== 'custom' || !customColors) return {};
                return {
                    '--bg-base': customColors.bgBase, '--bg-header': customColors.bgHeader, '--text-main': customColors.textMain, '--text-dim': customColors.textDim,
                    '--border-color': customColors.border, '--primary-color': customColors.primary, '--accent-color': customColors.accent, '--panel-color': customColors.panel,
                    '--success-color': customColors.success, '--danger-color': customColors.danger,
                };
            };

            const startDrag = (e) => {
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                if(e.target.closest('button') || e.target.closest('input') || e.target.closest('.no-drag')) return;
                setIsDragging(true);
                setDragOffset({ x: clientX - position.x, y: clientY - position.y });
            };

            useEffect(() => {
                const move = (e) => {
                    if(isDragging && windowRef.current) {
                        const cx = e.touches ? e.touches[0].clientX : e.clientX;
                        const cy = e.touches ? e.touches[0].clientY : e.clientY;
                        if(e.preventDefault) e.preventDefault();
                        const w = windowRef.current.offsetWidth, h = windowRef.current.offsetHeight;
                        setPosition({ x: Math.max(0, Math.min(window.innerWidth - w, cx - dragOffset.x)), y: Math.max(0, Math.min(window.innerHeight - h, cy - dragOffset.y)) });
                    }
                };
                const end = () => setIsDragging(false);
                if(isDragging) { window.addEventListener('mousemove', move); window.addEventListener('touchmove', move, {passive: false}); window.addEventListener('mouseup', end); window.addEventListener('touchend', end); }
                return () => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); window.removeEventListener('mouseup', end); window.removeEventListener('touchend', end); };
            }, [isDragging, dragOffset]);

            return (
                <div ref={windowRef} style={{ transform: \`translate(\${position.x}px, \${position.y}px)\`, ...getStyle() }} className={\`window-container fixed top-0 left-0 shadow-2xl flex flex-col overflow-hidden border \${isDragging ? '' : 'transition-all duration-300'} \${isMinimized ? 'w-[160px] h-[36px] rounded-lg' : 'w-[90vw] max-w-sm md:w-96 h-[600px] max-h-[85vh] rounded-xl'} \${theme.effect || ''} \${theme.colors.bgHeader} \${theme.colors.border}\`}>
                    <div onMouseDown={startDrag} onTouchStart={startDrag} className={\`flex items-center justify-between cursor-move shrink-0 \${isMinimized ? 'h-full px-3' : 'h-12 px-4 border-b'} \${theme.colors.textMain}\`}>
                        <div className="flex items-center gap-2 font-bold text-sm overflow-hidden whitespace-nowrap"><span className={\`w-2 h-2 rounded-full shrink-0 \${theme.colors.primary.replace('bg-', 'bg-')}\`}></span>{isMinimized ? '点击展开' : title}</div>
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 opacity-70 hover:opacity-100 no-drag">{isMinimized ? '+' : '-'}</button>
                    </div>
                    <div className={\`relative flex flex-col w-full h-full transition-opacity \${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'} \${theme.colors.bgBase} \${theme.colors.textMain}\`}>
                        <ParticleBackground theme={theme} config={particleConfig} />
                        <div className="relative z-10 p-4 overflow-y-auto custom-scrollbar flex-1">{children}</div>
                    </div>
                </div>
            );
        };

        // --- Game Components ---

        // 2048
        const Game2048 = ({ onBack, currentTheme, soundEnabled, onSave, onLoad, gameState, setGameState }) => {
            const theme = themes[currentTheme];
            const touchStart = useRef(null);
            const createEmptyGrid = () => Array(4).fill(null).map(() => Array(4).fill(0));
            const addRandomTile = (g) => {
                const avail = []; for(let r=0;r<4;r++) for(let c=0;c<4;c++) if(g[r][c]===0) avail.push({r,c});
                if(avail.length) { const s = avail[Math.floor(Math.random()*avail.length)]; g[s.r][s.c] = Math.random()>0.9?4:2; }
                return g;
            };
            useEffect(() => { if(!gameState) resetGame(); }, []);
            const resetGame = () => { let g = createEmptyGrid(); addRandomTile(g); addRandomTile(g); setGameState({grid:g, score:0, gameOver:false}); playSound('click', soundEnabled); };
            
            const move = (dir) => {
                if(!gameState || gameState.gameOver) return;
                let grid = gameState.grid.map(r=>[...r]), score = gameState.score, moved = false;
                const rotate = (m) => m[0].map((_,i) => m.map(r=>r[i]).reverse());
                if(dir==='UP') grid=rotate(grid); if(dir==='RIGHT') grid=rotate(rotate(grid)); if(dir==='DOWN') grid=rotate(rotate(rotate(grid)));
                for(let r=0;r<4;r++) {
                    let row = grid[r].filter(v=>v!==0), newRow = [];
                    for(let c=0;c<row.length;c++) {
                        if(c+1<row.length && row[c]===row[c+1]) { newRow.push(row[c]*2); score+=row[c]*2; c++; moved=true; playSound('pop', soundEnabled); } else newRow.push(row[c]);
                    }
                    while(newRow.length<4) newRow.push(0);
                    if(newRow.join(',')!==grid[r].join(',')) moved=true;
                    grid[r] = newRow;
                }
                if(dir==='UP') grid=rotate(rotate(rotate(grid))); if(dir==='RIGHT') grid=rotate(rotate(grid)); if(dir==='DOWN') grid=rotate(grid);
                if(moved) {
                    addRandomTile(grid);
                    let over = true;
                    for(let r=0;r<4;r++) for(let c=0;c<4;c++) if(grid[r][c]===0 || (c<3 && grid[r][c]===grid[r][c+1]) || (r<3 && grid[r][c]===grid[r+1][c])) over = false;
                    setGameState({grid, score, gameOver: over});
                    if(over) playSound('fail', soundEnabled); else playSound('click', soundEnabled);
                }
            };
            
            const getCellColor = (v) => {
                const isRetro = currentTheme==='retro', isLight = currentTheme==='light';
                const map = {
                    2: isRetro?'bg-[#eee8d5] text-[#657b83]':isLight?'bg-gray-200 text-gray-700':'bg-slate-700 text-white',
                    4: isRetro?'bg-[#fdf6e3] text-[#657b83]':isLight?'bg-gray-300 text-gray-800':'bg-slate-600 text-white',
                    8: isRetro?'bg-[#b58900] text-white':'bg-indigo-400 text-white',
                    2048: 'bg-green-500 text-white shadow-[0_0_10px_#22c55e]'
                };
                return map[v] || (v>8 ? (isRetro?'bg-[#cb4b16] text-white':'bg-indigo-600 text-white') : 'bg-black/10');
            };

            return (
                <div className="flex flex-col items-center gap-4 h-full select-none" onTouchStart={e=>touchStart.current={x:e.touches[0].clientX,y:e.touches[0].clientY}} onTouchEnd={e=>{if(!touchStart.current)return; const dx=e.changedTouches[0].clientX-touchStart.current.x, dy=e.changedTouches[0].clientY-touchStart.current.y; if(Math.abs(dx)>Math.abs(dy)){if(Math.abs(dx)>30) move(dx>0?'RIGHT':'LEFT')}else{if(Math.abs(dy)>30) move(dy>0?'DOWN':'UP')}}}>
                    <div className="w-full flex justify-between items-center gap-2"><button onClick={onBack} className={\`p-2 rounded-lg border \${theme.colors.border} \${theme.colors.panel}\`}>←</button><div className="flex gap-2"><button onClick={onSave} className={\`p-2 rounded border \${theme.colors.border} \${theme.colors.panel}\`}>💾</button><button onClick={onLoad} className={\`p-2 rounded border \${theme.colors.border} \${theme.colors.panel}\`}>📂</button></div><div className={\`px-4 py-1 rounded border \${theme.colors.panel}\`}>Score: {gameState?.score}</div></div>
                    <div className="flex-1 flex flex-col justify-center"><div className={\`grid grid-cols-4 gap-2 p-3 rounded-lg border \${theme.colors.panel} \${theme.colors.border}\`}>{gameState?.grid.map((r,ri)=>r.map((v,ci)=><div key={\`\${ri}-\${ci}\`} className={\`w-14 h-14 rounded flex items-center justify-center font-bold text-xl \${getCellColor(v)}\`}>{v||''}</div>))}</div></div>
                    <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] mb-4"><div/><button onClick={()=>move('UP')} className="p-4 bg-white/10 rounded">↑</button><div/><button onClick={()=>move('LEFT')} className="p-4 bg-white/10 rounded">←</button><button onClick={()=>move('DOWN')} className="p-4 bg-white/10 rounded">↓</button><button onClick={()=>move('RIGHT')} className="p-4 bg-white/10 rounded">→</button></div>
                </div>
            );
        };

        // Minesweeper
        const Minesweeper = ({ onBack, currentTheme, soundEnabled, gameState, setGameState }) => {
            const theme = themes[currentTheme], ROWS=8, COLS=8, MINES=8;
            useEffect(() => { if(!gameState) init(); }, []);
            const init = () => {
                let b = Array(ROWS*COLS).fill(0).map(()=>({isMine:false, isRevealed:false, isFlagged:false, count:0}));
                let m=0; while(m<MINES) { const i=Math.floor(Math.random()*64); if(!b[i].isMine){b[i].isMine=true;m++;} }
                for(let i=0;i<64;i++) { if(!b[i].isMine) { let c=0; const r=Math.floor(i/8), col=i%8; for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++) { const nr=r+dr, nc=col+dc; if(nr>=0&&nr<8&&nc>=0&&nc<8&&b[nr*8+nc].isMine) c++; } b[i].count=c; } }
                setGameState({board:b, gameOver:false, win:false, isGenerated:true}); playSound('click', soundEnabled);
            };
            const click = (i) => {
                if(!gameState || gameState.gameOver || gameState.win || gameState.board[i].isFlagged) return;
                let b = [...gameState.board];
                if(b[i].isMine) { b.forEach(c=>{if(c.isMine)c.isRevealed=true}); setGameState({...gameState, board:b, gameOver:true}); playSound('fail', soundEnabled); return; }
                const rev = (idx) => {
                    if(idx<0||idx>=64||b[idx].isRevealed||b[idx].isFlagged) return;
                    b[idx].isRevealed=true;
                    if(b[idx].count===0) { const r=Math.floor(idx/8), c=idx%8; for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){ const nr=r+dr, nc=c+dc; if(nr>=0&&nr<8&&nc>=0&&nc<8) rev(nr*8+nc); } }
                };
                rev(i);
                const win = b.filter(c=>c.isRevealed).length === 64-MINES;
                setGameState({...gameState, board:b, win});
                if(win) playSound('success', soundEnabled); else playSound('click', soundEnabled);
            };
            const flag = (e, i) => { e.preventDefault(); if(gameState.gameOver) return; const b=[...gameState.board]; b[i].isFlagged=!b[i].isFlagged; setGameState({...gameState, board:b}); playSound('pop', soundEnabled); };
            
            if(!gameState) return null;
            return (
                <div className="flex flex-col items-center gap-4 h-full"><div className="w-full flex justify-between border-b pb-2"><button onClick={onBack}>←</button><span>{gameState.win?'🎉':gameState.gameOver?'💥':'💣 '+MINES}</span><button onClick={init}>↺</button></div>
                <div className="grid grid-cols-8 gap-1 p-2 bg-black/20 rounded">{gameState.board.map((c,i)=>(<button key={i} onClick={()=>click(i)} onContextMenu={(e)=>flag(e,i)} className={\`w-8 h-8 flex items-center justify-center text-sm font-bold rounded \${c.isRevealed?(c.isMine?'bg-red-500':'bg-white/10'):'bg-blue-500/50 hover:bg-blue-500/70'} \${c.isFlagged?'text-red-300':''}\`}>{c.isRevealed ? (c.isMine?'💣':(c.count||'')) : (c.isFlagged?'🚩':'')}</button>))}</div></div>
            );
        };

        // Farming
        const FarmingGame = ({ onBack, currentTheme, gameState, setGameState, soundEnabled, onSave, onLoad }) => {
            const theme = themes[currentTheme];
            const [tool, setTool] = useState('wheat');
            const [tab, setTab] = useState('farm');
            const [floats, setFloats] = useState([]);
            const scrollRef = useRef(null);
            const isDown = useRef(false); const startX = useRef(0); const scrollLeft = useRef(0);

            const CROPS = { wheat: {id:'wheat',icon:'🌾',cost:10,sell:20,xp:20,time:3,lvl:1}, corn: {id:'corn',icon:'🌽',cost:25,sell:60,xp:45,time:8,lvl:2}, carrot: {id:'carrot',icon:'🥕',cost:50,sell:130,xp:90,time:15,lvl:3}, pumpkin: {id:'pumpkin',icon:'🎃',cost:120,sell:320,xp:180,time:30,lvl:5}, rose: {id:'rose',icon:'🌹',cost:300,sell:850,xp:500,time:60,lvl:8} };
            const DECOR = { scarecrow: {id:'scarecrow',icon:'⛄',cost:200,xp:10}, fountain: {id:'fountain',icon:'⛲',cost:500,xp:25}, barn: {id:'barn',icon:'🏠',cost:1000,xp:50} };

            useEffect(() => {
                const t = setInterval(() => {
                    setGameState(s => ({...s, plots: s.plots.map(p => {
                        if(p.cropId && p.plantTime && p.isWatered && !p.isReady && (Date.now()-p.plantTime)/1000 >= CROPS[p.cropId].time) return {...p, isReady:true};
                        return p;
                    })}));
                }, 1000);
                return () => clearInterval(t);
            }, []);
            useEffect(() => { if(floats.length) setTimeout(() => setFloats(p => p.slice(1)), 1000); }, [floats]);

            const float = (txt, x, y) => setFloats(p => [...p, {id:Date.now(), text:txt, x, y}]);
            const clickPlot = (id, e) => {
                const idx = gameState.plots.findIndex(p=>p.id===id), p = gameState.plots[idx];
                if(!p.isUnlocked) return playSound('fail', soundEnabled);
                let ns = {...gameState}, s = false;
                if(tool==='harvest' && p.isReady) {
                    ns.money+=CROPS[p.cropId].sell; ns.xp+=CROPS[p.cropId].xp;
                    ns.plots[idx] = {...p, cropId:null, isReady:false, isWatered:false};
                    s=true; playSound('success', soundEnabled); float(\`+\${CROPS[p.cropId].sell}\`, e.clientX, e.clientY);
                } else if(tool==='water' && p.cropId && !p.isWatered && !p.isReady) {
                    ns.plots[idx].isWatered=true; s=true; playSound('water', soundEnabled);
                } else if(tool==='fertilizer' && p.cropId && !p.isReady && ns.money>=50) {
                    ns.money-=50; ns.plots[idx].isReady=true; ns.plots[idx].isWatered=true; s=true; playSound('pop', soundEnabled);
                } else if(CROPS[tool] && !p.cropId && ns.money>=CROPS[tool].cost) {
                    ns.money-=CROPS[tool].cost; ns.plots[idx] = {...p, cropId:tool, plantTime:Date.now(), isReady:false, isWatered:false}; s=true; playSound('pop', soundEnabled); float(\`-\${CROPS[tool].cost}\`, e.clientX, e.clientY);
                }
                if(s) {
                    if(ns.xp >= ns.level*150) { ns.xp-=ns.level*150; ns.level++; playSound('success', soundEnabled); float('LEVEL UP', e.clientX, e.clientY-40); ns.plots=ns.plots.map((pp,i)=>({...pp, isUnlocked: i < (ns.level>=5?9:ns.level>=3?6:3)})); }
                    setGameState(ns);
                } else playSound('fail', soundEnabled);
            };

            const dragStart = (e) => { isDown.current=true; startX.current=e.pageX - scrollRef.current.offsetLeft; scrollLeft.current=scrollRef.current.scrollLeft; };
            const dragMove = (e) => { if(!isDown.current)return; e.preventDefault(); const x=e.pageX-scrollRef.current.offsetLeft; scrollRef.current.scrollLeft = scrollLeft.current - (x-startX.current)*1.5; };

            return (
                <div className="flex flex-col h-full gap-2 relative">
                    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">{floats.map(f=><div key={f.id} className="absolute text-yellow-400 font-bold animate-bounce text-xl shadow-black drop-shadow-md" style={{left:100, top:100}}>{f.text}</div>)}</div>
                    <div className="flex justify-between items-center pb-2 border-b border-white/20 shrink-0">
                        <div className="flex gap-2"><button onClick={onBack}>←</button><button onClick={onSave}>💾</button><button onClick={onLoad}>📂</button></div>
                        <div className="flex gap-2"><button onClick={()=>setTab('farm')} className={\`px-2 py-1 rounded \${tab==='farm'?theme.colors.primary:'bg-white/10'}\`}>农场</button><button onClick={()=>setTab('shop')} className={\`px-2 py-1 rounded \${tab==='shop'?theme.colors.primary:'bg-white/10'}\`}>装饰</button></div>
                        <div className="font-bold text-xs">Lv.{gameState.level} 💰{gameState.money}</div>
                    </div>
                    {tab==='farm' ? (
                        <>
                        <div className="grid grid-cols-3 gap-2 flex-1 content-start overflow-y-auto" style={{touchAction:'pan-y'}}>
                            {gameState.plots.map(p => (
                                <button key={p.id} onClick={(e)=>clickPlot(p.id,e)} className={\`aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative active:scale-95 transition-all \${!p.isUnlocked?'bg-black/40 border-dashed opacity-60':p.isWatered?'bg-blue-900/30 border-blue-500/50':theme.colors.panel+' '+theme.colors.border}\`}>
                                    {!p.isUnlocked?'🔒':p.cropId?<><span className="text-3xl">{CROPS[p.cropId].icon}</span>{p.isReady&&<span className="absolute animate-ping">✨</span>}</>:'🌱'}
                                    {p.isWatered && !p.isReady && <div className="absolute top-1 right-1 text-xs">💧</div>}
                                </button>
                            ))}
                            <div className="col-span-3 h-16"/>
                        </div>
                        <div className="border-t border-white/10 pt-2 shrink-0">
                            <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide cursor-grab" onMouseDown={dragStart} onMouseLeave={()=>isDown.current=false} onMouseUp={()=>isDown.current=false} onMouseMove={dragMove}>
                                <ToolBtn active={tool==='water'} onClick={()=>setTool('water')} icon="💧" label="浇水" theme={theme}/>
                                <ToolBtn active={tool==='harvest'} onClick={()=>setTool('harvest')} icon="✂️" label="收割" theme={theme}/>
                                <ToolBtn active={tool==='fertilizer'} onClick={()=>setTool('fertilizer')} icon="⚡" label="50" theme={theme}/>
                                <div className="w-px bg-white/20 mx-1 shrink-0"/>
                                {Object.values(CROPS).map(c => <ToolBtn key={c.id} active={tool===c.id} onClick={()=>setTool(c.id)} icon={c.icon} label={c.cost} theme={theme} disabled={gameState.level < c.lvl}/>)}
                            </div>
                        </div>
                        </>
                    ) : (
                        <div className="flex-1 space-y-2 overflow-y-auto">
                            {Object.values(DECOR).map(d => (
                                <div key={d.id} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                                    <span>{d.icon} +{d.xp}% XP</span>
                                    <button onClick={(e)=>{ if(!gameState.ownedDecorations.includes(d.id) && gameState.money>=d.cost){ setGameState({...gameState, money:gameState.money-d.cost, ownedDecorations:[...gameState.ownedDecorations, d.id]}); playSound('success', soundEnabled); } else playSound('fail', soundEnabled); }} disabled={gameState.ownedDecorations.includes(d.id)} className={\`px-2 py-1 rounded text-xs \${gameState.ownedDecorations.includes(d.id)?'bg-green-600':theme.colors.primary}\`}>{gameState.ownedDecorations.includes(d.id)?'已拥有':d.cost}</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        };
        const ToolBtn = ({active, onClick, icon, label, theme, disabled}) => (
            <button onClick={onClick} disabled={disabled} className={\`flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-lg border transition-all shrink-0 \${active?theme.colors.primary:'bg-white/5 border-white/10'} \${disabled?'opacity-40 grayscale':''}\`}>
                <span className="text-2xl">{icon}</span><span className="text-xs">{label}</span>
            </button>
        );

        // Snake
        const SnakeGame = ({ onBack, currentTheme, soundEnabled, gameState, setGameState }) => {
            const theme = themes[currentTheme];
            const dirRef = useRef('RIGHT');
            useEffect(() => { if(!gameState) init(); }, []);
            useEffect(() => {
                if(gameState?.isPlaying) {
                    const t = setInterval(tick, 150);
                    return () => clearInterval(t);
                }
            }, [gameState]);
            
            const init = () => { setGameState({snake:[{x:10,y:10}], food:{x:5,y:5}, dir:'RIGHT', score:0, playing:true, gameOver:false}); dirRef.current='RIGHT'; };
            const tick = () => {
                setGameState(prev => {
                    if(!prev.playing || prev.gameOver) return prev;
                    const h = {...prev.snake[0]};
                    if(dirRef.current==='UP') h.y--; else if(dirRef.current==='DOWN') h.y++; else if(dirRef.current==='LEFT') h.x--; else h.x++;
                    if(h.x<0||h.x>=20||h.y<0||h.y>=20||prev.snake.some(s=>s.x===h.x&&s.y===h.y)) { playSound('fail', soundEnabled); return {...prev, gameOver:true}; }
                    const newS = [h, ...prev.snake];
                    let newF = prev.food, sc = prev.score;
                    if(h.x===prev.food.x && h.y===prev.food.y) { sc+=10; newF={x:Math.floor(Math.random()*20), y:Math.floor(Math.random()*20)}; playSound('pop', soundEnabled); } else newS.pop();
                    return {...prev, snake:newS, food:newF, score:sc};
                });
            };

            return (
                <div className="flex flex-col h-full gap-2 relative outline-none" tabIndex={0} onKeyDown={(e)=>{if(e.key.startsWith('Arrow')){e.preventDefault(); const d=e.key.slice(5).toUpperCase(); if((d==='UP'&&dirRef.current!=='DOWN')||(d==='DOWN'&&dirRef.current!=='UP')||(d==='LEFT'&&dirRef.current!=='RIGHT')||(d==='RIGHT'&&dirRef.current!=='LEFT')) dirRef.current=d;}}}>
                    <div className="flex justify-between border-b pb-2"><button onClick={onBack}>←</button><span>Score: {gameState?.score}</span><button onClick={init}>↺</button></div>
                    <div className="flex-1 bg-black/40 rounded relative border border-white/10 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)]">
                        {gameState?.snake.map((s,i)=><div key={i} style={{gridColumn:s.x+1, gridRow:s.y+1}} className="bg-green-500 rounded-sm"/>)}
                        {gameState && <div style={{gridColumn:gameState.food.x+1, gridRow:gameState.food.y+1}} className="bg-red-500 rounded-full animate-pulse"/>}
                        {gameState?.gameOver && <div className="absolute inset-0 bg-black/70 flex items-center justify-center font-bold text-xl">GAME OVER</div>}
                    </div>
                    <div className="h-24 grid grid-cols-3 gap-1 px-4 md:hidden">
                        <div/><button className="bg-white/10 rounded" onClick={()=>dirRef.current='UP'}>↑</button><div/>
                        <button className="bg-white/10 rounded" onClick={()=>dirRef.current='LEFT'}>←</button><button className="bg-white/10 rounded" onClick={()=>dirRef.current='DOWN'}>↓</button><button className="bg-white/10 rounded" onClick={()=>dirRef.current='RIGHT'}>→</button>
                    </div>
                </div>
            );
        };

        // Text Adventure
        const TextAdventure = ({ onBack, currentTheme, soundEnabled, gameState, setGameState }) => {
            const theme = themes[currentTheme];
            const [input, setInput] = useState('');
            const scrollRef = useRef(null);
            
            useEffect(() => { if(!gameState) setGameState({messages:[{role:'system',text:'欢迎来到文字冒险！你在一个神秘的森林入口醒来。'}], isLoading:false}); }, []);
            useEffect(() => { if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [gameState?.messages]);

            const handleSend = async () => {
                if(!input.trim() || gameState.isLoading) return;
                const newMsgs = [...gameState.messages, {role:'user', text:input}];
                setGameState({...gameState, messages:newMsgs, isLoading:true});
                setInput(''); playSound('click', soundEnabled);
                
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
                    const chat = ai.chats.create({ model: 'gemini-3-flash-preview', config: { systemInstruction: "你是DND地下城主。简短回复(50字内)。" } });
                    // Only send last user message for simplicity in this bundle, or reconstruct history
                    const response = await chat.sendMessage({ message: input });
                    setGameState({ ...gameState, messages: [...newMsgs, {role:'model', text: response.text}], isLoading: false });
                    playSound('pop', soundEnabled);
                } catch(e) {
                    setGameState({ ...gameState, messages: [...newMsgs, {role:'model', text: "魔法干扰(API Error: Check Key)"}], isLoading: false });
                }
            };

            if(!gameState) return null;
            return (
                <div className="flex flex-col h-full gap-2">
                    <div className="flex justify-between border-b pb-2"><button onClick={onBack}>←</button><span>冒险</span></div>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 bg-black/20 rounded space-y-2">
                        {gameState.messages.map((m,i)=><div key={i} className={\`p-2 rounded text-sm \${m.role==='user'?theme.colors.primary:'bg-white/10'}\`}>{m.text}</div>)}
                        {gameState.isLoading && <div className="text-xs opacity-50">Thinking...</div>}
                    </div>
                    <div className="flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 bg-white/10 rounded px-2" /><button onClick={handleSend}>➤</button></div>
                </div>
            );
        };

        // Whack A Mole
        const WhackAMole = ({ onBack, currentTheme, soundEnabled, gameState, setGameState }) => {
            const theme = themes[currentTheme];
            useEffect(() => { if(!gameState) reset(); return ()=>stop(); }, []);
            const timerRef = useRef(null); const moleRef = useRef(null);
            
            const stop = () => { clearInterval(timerRef.current); clearTimeout(moleRef.current); };
            const reset = () => { stop(); setGameState({score:0, time:30, active:null, playing:false}); };
            const start = () => {
                if(gameState?.playing) return;
                setGameState({...gameState, playing:true, score:0, time:30});
                timerRef.current = setInterval(()=>{
                    setGameState(p=>{
                        if(p.time<=1) { stop(); return {...p, time:0, playing:false, active:null}; }
                        return {...p, time:p.time-1};
                    });
                },1000);
                loop();
            };
            const loop = () => {
                moleRef.current = setTimeout(()=>{
                    setGameState(p=>({...p, active:Math.floor(Math.random()*9)}));
                    setTimeout(()=>{
                        setGameState(p=>({...p, active:null}));
                        if(gameState?.playing || true) loop();
                    }, 800);
                }, Math.random()*1000+500);
            };
            const hit = (i) => {
                if(gameState.active===i && gameState.playing) {
                    playSound('pop', soundEnabled);
                    setGameState(p=>({...p, score:p.score+10, active:null}));
                }
            };

            if(!gameState) return null;
            return (
                <div className="flex flex-col h-full gap-4">
                    <div className="flex justify-between border-b pb-2"><button onClick={onBack}>←</button><span>Time: {gameState.time} Score: {gameState.score}</span><button onClick={start}>{gameState.playing?'...':'Start'}</button></div>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                        {Array(9).fill(0).map((_,i)=>(
                            <button key={i} onClick={()=>hit(i)} className="bg-white/10 rounded-full relative overflow-hidden">
                                {gameState.active===i && <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">🐹</div>}
                            </button>
                        ))}
                    </div>
                </div>
            );
        };

        // --- Main App ---
        const App = () => {
            const [visible, setVisible] = useState(true);
            const [game, setGame] = useState('MENU');
            const [themeMode, setThemeMode] = useState('dark');
            const [soundEnabled, setSoundEnabled] = useState(true);
            const [particleConfig, setParticleConfig] = useState({enabled:true, density:40, color:'auto'});
            
            // Global States
            const [farming, setFarming] = useState({ money: 50, xp: 0, level: 1, ownedDecorations: [], plots: Array(9).fill(null).map((_,i)=>({id:i, cropId:null, plantTime:null, isWatered:false, isReady:false, isUnlocked:i<3})) });
            const [g2048, setG2048] = useState(undefined);
            const [mines, setMines] = useState(undefined);
            const [snake, setSnake] = useState(undefined);
            const [tetris, setTetris] = useState(undefined);
            const [sudoku, setSudoku] = useState(undefined);
            const [whack, setWhack] = useState(undefined);
            const [adventure, setAdventure] = useState(undefined);

            // Expose toggle
            useEffect(() => { window.toggleApp = () => setVisible(v => !v); }, []);

            // Auto-load/save
            useEffect(() => {
                const saved = localStorage.getItem('tavern_timekiller_bundle_v3');
                if(saved) {
                    try { 
                        const d = JSON.parse(saved); 
                        if(d.farming) setFarming(d.farming);
                        if(d.theme) setThemeMode(d.theme);
                    } catch(e){}
                }
            }, []);
            
            useEffect(() => {
                const data = { farming, theme: themeMode };
                localStorage.setItem('tavern_timekiller_bundle_v3', JSON.stringify(data));
            }, [farming, themeMode]);

            const changeGame = (g) => { playSound('click', soundEnabled); setGame(g); };
            const theme = themes[themeMode];

            if(!visible) return null;

            const renderContent = () => {
                switch(game) {
                    case 'FARMING': return <FarmingGame onBack={()=>changeGame('MENU')} currentTheme={themeMode} gameState={farming} setGameState={setFarming} soundEnabled={soundEnabled} onSave={()=>{}} onLoad={()=>{}} />;
                    case 'GAME_2048': return <Game2048 onBack={()=>changeGame('MENU')} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={g2048} setGameState={setG2048} onSave={()=>{}} onLoad={()=>{}} />;
                    case 'MINESWEEPER': return <Minesweeper onBack={()=>changeGame('MENU')} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={mines} setGameState={setMines} />;
                    case 'SNAKE': return <SnakeGame onBack={()=>changeGame('MENU')} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={snake} setGameState={setSnake} />;
                    case 'WHACK_A_MOLE': return <WhackAMole onBack={()=>changeGame('MENU')} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={whack} setGameState={setWhack} />;
                    case 'TEXT_ADVENTURE': return <TextAdventure onBack={()=>changeGame('MENU')} currentTheme={themeMode} soundEnabled={soundEnabled} gameState={adventure} setGameState={setAdventure} />;
                    case 'SETTINGS': return (
                        <div className="p-4">
                            <h2 className="border-b pb-2 mb-4 flex gap-2"><button onClick={()=>changeGame('MENU')}>←</button>设置</h2>
                            <div className="flex justify-between mb-4"><span>音效</span><button onClick={()=>setSoundEnabled(!soundEnabled)}>{soundEnabled?'ON':'OFF'}</button></div>
                            <div className="grid grid-cols-3 gap-2">{Object.keys(themes).map(t=><button key={t} onClick={()=>setThemeMode(t)} className={\`p-2 border rounded \${themeMode===t?'bg-white/20':''}\`}>{themes[t].name}</button>)}</div>
                        </div>
                    );
                    default: return (
                        <div className="flex flex-col h-full animate-in fade-in">
                            <h1 className="text-lg font-bold text-center border-b border-white/10 pb-2 mb-2">游戏中心</h1>
                            <div className="grid grid-cols-3 gap-2 overflow-y-auto pb-4 content-start">
                                <MenuBtn icon="🌾" title="像素农场" onClick={()=>changeGame('FARMING')} theme={theme} />
                                <MenuBtn icon="🔢" title="2048" onClick={()=>changeGame('GAME_2048')} theme={theme} />
                                <MenuBtn icon="💣" title="扫雷" onClick={()=>changeGame('MINESWEEPER')} theme={theme} />
                                <MenuBtn icon="🐍" title="贪吃蛇" onClick={()=>changeGame('SNAKE')} theme={theme} />
                                <MenuBtn icon="🐹" title="打地鼠" onClick={()=>changeGame('WHACK_A_MOLE')} theme={theme} />
                                <MenuBtn icon="🏰" title="AI冒险" onClick={()=>changeGame('TEXT_ADVENTURE')} theme={theme} />
                                <MenuBtn icon="⚙️" title="设置" onClick={()=>changeGame('SETTINGS')} theme={theme} />
                            </div>
                        </div>
                    );
                }
            };

            return (
                <FloatingWindow title="酒馆休闲角" currentTheme={themeMode} customColors={{}} particleConfig={particleConfig}>
                    {renderContent()}
                </FloatingWindow>
            );
        };

        const MenuBtn = ({icon, title, onClick, theme}) => (
            <button onClick={onClick} className={\`aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:bg-white/5 active:scale-95 border \${theme.colors.border} \${theme.colors.panel}\`}>
                <span className="text-3xl mb-1">{icon}</span><span className="text-[10px] font-bold opacity-80">{title}</span>
            </button>
        );

        const root = createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
    `;

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(appHtml);
    iframe.contentWindow.document.close();

})();
