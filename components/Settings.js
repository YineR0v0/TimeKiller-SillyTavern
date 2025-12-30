
const PRESET_FONTS = [
    { name: '默认字体 (Default)', family: 'Inter, system-ui, sans-serif', url: '' },
    { name: '像素风格 (Pixel)', family: "'Press Start 2P', cursive", url: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap' },
    { name: '中文字体 - 快乐体', family: "'ZCOOL KuaiLe', cursive", url: 'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap' },
];

window.TK.Settings = ({ 
  onBack, currentTheme, setTheme, customColors, setCustomColors, 
  soundEnabled, setSoundEnabled, particleConfig, setParticleConfig,
  presets, setPresets, fontSettings, setFontSettings
}) => {
  const { themes, playSound } = window.TK;
  const theme = themes[currentTheme];
  const [importString, setImportString] = React.useState('');
  const [showImport, setShowImport] = React.useState(false);
  const [newPresetName, setNewPresetName] = React.useState('');
  const [showSavePreset, setShowSavePreset] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('theme');
  const fileInputRef = React.useRef(null);

  const handleThemeChange = (t) => {
    playSound('click', soundEnabled);
    setTheme(t);
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) playSound('success', true);
  };
  
  const updateParticleConfig = (key, value) => {
    setParticleConfig({ ...particleConfig, [key]: value });
  };

  const updateColor = (key, value) => {
    setCustomColors({ ...customColors, [key]: value });
  };

  const handleExport = () => {
      const data = {
          colors: customColors,
          font: fontSettings,
          presets: presets 
      };
      const str = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      navigator.clipboard.writeText(str);
      playSound('success', soundEnabled);
      alert('已复制到剪贴板!');
  };

  const handleImport = () => {
      try {
          const raw = decodeURIComponent(escape(atob(importString)));
          const data = JSON.parse(raw);
          
          if (data.colors) setCustomColors({ ...customColors, ...data.colors });
          if (data.font) setFontSettings(data.font);
          if (data.presets && Array.isArray(data.presets)) {
              const existingIds = new Set(presets.map(p => p.id));
              const newPresets = data.presets.filter((p) => !existingIds.has(p.id));
              setPresets([...presets, ...newPresets]);
          }
          
          setTheme('custom');
          playSound('success', soundEnabled);
          setShowImport(false);
          setImportString('');
          alert('导入成功！');
      } catch (e) {
          playSound('fail', soundEnabled);
          alert('无效的配置代码');
      }
  };

  const savePreset = () => {
      if (!newPresetName.trim()) return;
      const newPreset = {
          id: Date.now().toString(),
          name: newPresetName.trim(),
          colors: { ...customColors }
      };
      setPresets([...presets, newPreset]);
      setNewPresetName('');
      setShowSavePreset(false);
      playSound('success', soundEnabled);
  };

  const loadPreset = (preset) => {
      setCustomColors(preset.colors);
      setTheme('custom');
      playSound('click', soundEnabled);
  };

  const deletePreset = (id, e) => {
      e.stopPropagation();
      setPresets(presets.filter(p => p.id !== id));
      playSound('pop', soundEnabled);
  };

  const handleFontFile = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          const fontData = evt.target?.result;
          const fontName = 'CustomFileFont';
          const fontFace = new FontFace(fontName, `url(${fontData})`);
          fontFace.load().then((loadedFace) => {
              document.fonts.add(loadedFace);
              setFontSettings({ family: fontName, url: '' });
              playSound('success', soundEnabled);
              alert('字体加载成功！');
          }).catch(err => {
              alert('字体加载失败');
          });
      };
      reader.readAsDataURL(file);
  };

  const ColorInput = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1 bg-black/10 p-1.5 rounded border border-white/5">
      <div className="flex justify-between items-center">
          <label className="text-[10px] opacity-70 truncate flex-1">{label}</label>
          <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: value || '#000' }}></div>
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-[10px] bg-black/20 rounded px-1 py-0.5 min-w-0 font-mono text-center opacity-80 focus:opacity-100 outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="relative w-6 h-5 overflow-hidden rounded shrink-0">
            <input 
              type="color" 
              value={value && value.startsWith('#') ? value : '#000000'} 
              onChange={(e) => onChange(e.target.value)}
              className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-none p-0"
            />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col gap-2 pb-2 border-b border-opacity-20 border-gray-500 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => { playSound('click', soundEnabled); onBack(); }} className={`text-sm ${theme.colors.textDim} hover:${theme.colors.textMain}`}>← 返回</button>
            <span className="font-bold">系统设置</span>
          </div>
          <div className="flex bg-black/20 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('theme')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all ${activeTab === 'theme' ? theme.colors.primary + ' text-white font-bold' : 'text-gray-400 hover:text-white'}`}
             >
                 主题
             </button>
             <button 
                onClick={() => setActiveTab('font')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all ${activeTab === 'font' ? theme.colors.primary + ' text-white font-bold' : 'text-gray-400 hover:text-white'}`}
             >
                 字体
             </button>
          </div>
      </div>

      <div className="space-y-6 overflow-y-auto pr-1 pb-4 flex-1">
        {activeTab === 'theme' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
                <div>
                <h3 className={`text-sm font-bold mb-3 ${theme.colors.textDim}`}>预设风格</h3>
                <div className="grid grid-cols-3 gap-2">
                    {Object.keys(themes).map((t) => (
                    <button
                        key={t}
                        onClick={() => handleThemeChange(t)}
                        className={`
                        p-2 rounded-lg text-xs font-medium border transition-all relative overflow-hidden
                        ${currentTheme === t ? `ring-2 ring-offset-1 ring-opacity-50 ${themes[t].colors.border}` : `${themes[t].colors.bgHeader} border-transparent opacity-70`}
                        `}
                        style={t === 'custom' ? { background: '#333' } : undefined}
                    >
                        {themes[t].name}
                    </button>
                    ))}
                </div>
                </div>

                {currentTheme === 'custom' && (
                <div className={`p-3 rounded-lg border ${theme.colors.border} ${theme.colors.panel} space-y-4`}>
                    <div className="flex flex-wrap gap-2 justify-between items-center pb-2 border-b border-gray-700/50">
                        <h4 className="text-xs font-bold opacity-70">自定义配色</h4>
                        <div className="flex gap-2">
                            <button onClick={() => setShowSavePreset(!showSavePreset)} className="text-[10px] bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded text-white transition-colors">存预设</button>
                            <button onClick={handleExport} className="text-[10px] bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-white transition-colors">导出</button>
                            <button onClick={() => setShowImport(!showImport)} className="text-[10px] bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-white transition-colors">导入</button>
                        </div>
                    </div>

                    {showSavePreset && (
                        <div className="flex gap-2 bg-black/20 p-2 rounded">
                            <input 
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                placeholder="输入预设名称..."
                                className="flex-1 text-[10px] bg-black/40 rounded px-2 py-1 border border-transparent focus:border-purple-500 outline-none text-white"
                            />
                            <button onClick={savePreset} className="text-[10px] bg-green-600 px-2 rounded text-white shrink-0">保存</button>
                        </div>
                    )}
                    {showImport && (
                        <div className="flex gap-2 bg-black/20 p-2 rounded">
                            <input 
                                value={importString}
                                onChange={(e) => setImportString(e.target.value)}
                                placeholder="粘贴配置代码..."
                                className="flex-1 text-[10px] bg-black/40 rounded px-2 py-1 border border-transparent focus:border-blue-500 outline-none text-white"
                            />
                            <button onClick={handleImport} className="text-[10px] bg-green-600 px-2 rounded text-white shrink-0">确定</button>
                        </div>
                    )}

                    {presets.length > 0 && (
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                            {presets.map(p => (
                                <div key={p.id} onClick={() => loadPreset(p)} className="flex items-center bg-black/30 hover:bg-black/50 cursor-pointer rounded-lg pl-2 pr-1 py-1 gap-2 border border-white/5 group">
                                    <span className="text-[10px] text-gray-300 group-hover:text-white">{p.name}</span>
                                    <button onClick={(e) => deletePreset(p.id, e)} className="text-[10px] text-gray-500 hover:text-red-400 px-1">×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <div className="text-[10px] font-bold opacity-50 uppercase tracking-wider mb-2">界面外观</div>
                            <div className="grid grid-cols-2 gap-2">
                                <ColorInput label="基础背景" value={customColors.bgBase} onChange={(v) => updateColor('bgBase', v)} />
                                <ColorInput label="头部背景" value={customColors.bgHeader} onChange={(v) => updateColor('bgHeader', v)} />
                                <ColorInput label="面板背景" value={customColors.panel} onChange={(v) => updateColor('panel', v)} />
                                <ColorInput label="边框颜色" value={customColors.border} onChange={(v) => updateColor('border', v)} />
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold opacity-50 uppercase tracking-wider mb-2">文字内容</div>
                            <div className="grid grid-cols-2 gap-2">
                                <ColorInput label="主要文字" value={customColors.textMain} onChange={(v) => updateColor('textMain', v)} />
                                <ColorInput label="次要文字" value={customColors.textDim} onChange={(v) => updateColor('textDim', v)} />
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold opacity-50 uppercase tracking-wider mb-2">状态指示</div>
                            <div className="grid grid-cols-2 gap-2">
                                <ColorInput label="主色调" value={customColors.primary} onChange={(v) => updateColor('primary', v)} />
                                <ColorInput label="强调色" value={customColors.accent} onChange={(v) => updateColor('accent', v)} />
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
        )}

        {activeTab === 'font' && (
             <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className={`p-4 rounded-lg bg-black/10 border ${theme.colors.border}`}>
                    <h3 className="text-xs font-bold opacity-70 mb-3">字体配置</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] opacity-60">选择预设字体</label>
                            <select 
                                onChange={(e) => {
                                    const selected = PRESET_FONTS.find(f => f.name === e.target.value);
                                    if (selected) {
                                        setFontSettings({ family: selected.family, url: selected.url });
                                        playSound('click', soundEnabled);
                                    }
                                }}
                                className="w-full text-xs bg-black/20 rounded px-2 py-2 border border-transparent focus:border-blue-500 outline-none appearance-none"
                            >
                                <option value="">-- 请选择 --</option>
                                {PRESET_FONTS.map(f => (
                                    <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] opacity-60">本地文件 (.ttf/.woff)</label>
                            <input 
                                type="file"
                                ref={fileInputRef}
                                accept=".ttf,.otf,.woff,.woff2"
                                onChange={handleFontFile}
                                className="hidden"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full py-2 rounded text-xs border border-dashed hover:bg-white/5 transition-colors ${theme.colors.border}`}
                            >
                                📂 选择字体文件...
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        )}

        <div className="space-y-4 pt-4 border-t border-white/10">
             <div className={`p-3 rounded-lg bg-black/10 border ${theme.colors.border} space-y-3`}>
                <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${theme.colors.textMain}`}>背景粒子</span>
                    <button 
                        onClick={() => updateParticleConfig('enabled', !particleConfig.enabled)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${particleConfig.enabled ? theme.colors.primary : 'bg-gray-600'}`}
                    >
                        <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${particleConfig.enabled ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
             </div>
        </div>
      </div>
      
      <div className="mt-auto text-center text-xs opacity-30 pt-2 border-t border-opacity-10 border-white">
        v2.1.0 • Tavern Timekiller
      </div>
    </div>
  );
};
