import { ThemeConfig, ThemeMode } from '../types';

// We use specific tailwind classes for presets, but for custom, we use arbitrary values mapped to CSS variables
// defined in App.tsx or FloatingWindow.tsx
export const themes: Record<ThemeMode, ThemeConfig> = {
  dark: {
    name: '深色模式',
    colors: {
      bgBase: 'bg-slate-900/95',
      bgHeader: 'bg-slate-800/95',
      textMain: 'text-slate-200',
      textDim: 'text-slate-400',
      border: 'border-slate-700/50',
      primary: 'bg-indigo-600',
      primaryHover: 'hover:bg-indigo-500',
      accent: 'text-indigo-400',
      panel: 'bg-slate-800',
      success: 'text-green-400',
      danger: 'text-red-400',
    }
  },
  light: {
    name: '清爽明亮',
    colors: {
      bgBase: 'bg-white/95',
      bgHeader: 'bg-gray-100/95',
      textMain: 'text-gray-800',
      textDim: 'text-gray-500',
      border: 'border-gray-200',
      primary: 'bg-blue-500',
      primaryHover: 'hover:bg-blue-400',
      accent: 'text-blue-600',
      panel: 'bg-gray-100',
      success: 'text-green-600',
      danger: 'text-red-600',
    }
  },
  retro: {
    name: '复古羊皮',
    colors: {
      bgBase: 'bg-[#fdf6e3]/95',
      bgHeader: 'bg-[#eee8d5]/95',
      textMain: 'text-[#586e75]',
      textDim: 'text-[#93a1a1]',
      border: 'border-[#d3cbb7]',
      primary: 'bg-[#b58900]',
      primaryHover: 'hover:bg-[#cb4b16]',
      accent: 'text-[#b58900]',
      panel: 'bg-[#eee8d5]',
      success: 'text-[#859900]',
      danger: 'text-[#dc322f]',
    }
  },
  cyberpunk: {
    name: '赛博朋克',
    effect: 'shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-cyan-500/30',
    colors: {
      bgBase: 'bg-[#09090b]/95',
      bgHeader: 'bg-[#18181b]/95',
      textMain: 'text-cyan-400',
      textDim: 'text-cyan-800',
      border: 'border-cyan-900',
      primary: 'bg-pink-600',
      primaryHover: 'hover:bg-pink-500',
      accent: 'text-yellow-400',
      panel: 'bg-[#18181b]',
      success: 'text-green-400',
      danger: 'text-red-500',
    }
  },
  sakura: {
    name: '樱花烂漫',
    colors: {
      bgBase: 'bg-[#fff0f5]/95',
      bgHeader: 'bg-[#ffe4e1]/95',
      textMain: 'text-[#db7093]',
      textDim: 'text-[#ffb6c1]',
      border: 'border-[#ffc0cb]',
      primary: 'bg-[#ff69b4]',
      primaryHover: 'hover:bg-[#ff1493]',
      accent: 'text-[#db7093]',
      panel: 'bg-[#fff5ee]',
      success: 'text-[#32cd32]',
      danger: 'text-[#ff4500]',
    }
  },
  custom: {
    name: '自定义',
    isCustom: true,
    colors: {
      // These map to CSS variables set in the FloatingWindow component
      bgBase: 'bg-[var(--bg-base)]',
      bgHeader: 'bg-[var(--bg-header)]',
      textMain: 'text-[var(--text-main)]',
      textDim: 'text-[var(--text-dim)]',
      border: 'border-[var(--border-color)] border',
      primary: 'bg-[var(--primary-color)]',
      primaryHover: 'hover:opacity-90',
      accent: 'text-[var(--accent-color)]',
      panel: 'bg-[var(--panel-color)]',
      success: 'text-[var(--success-color)]',
      danger: 'text-[var(--danger-color)]',
    }
  }
};