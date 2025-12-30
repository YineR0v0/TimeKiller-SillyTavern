
import React, { useState, useRef, useEffect } from 'react';
import { Coordinates, ThemeMode, ThemeColors, ParticleConfig } from '../types.ts';
import { themes } from '../utils/themes.ts';
import ParticleBackground from './ParticleBackground.tsx';

interface FloatingWindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: Coordinates;
  currentTheme: ThemeMode;
  customColors?: Partial<ThemeColors>;
  particleConfig: ParticleConfig;
}

const FloatingWindow: React.FC<FloatingWindowProps> = ({ 
  title, 
  children, 
  initialPosition = { x: 20, y: 20 },
  currentTheme,
  customColors,
  particleConfig
}) => {
  const [position, setPosition] = useState<Coordinates>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Coordinates>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const theme = themes[currentTheme];

  const getStyle = () => {
    if (currentTheme !== 'custom' || !customColors) return {};
    return {
      '--bg-base': customColors.bgBase || '#1e293b',
      '--bg-header': customColors.bgHeader || '#0f172a',
      '--text-main': customColors.textMain || '#e2e8f0',
      '--text-dim': customColors.textDim || '#94a3b8',
      '--border-color': customColors.border || '#334155',
      '--primary-color': customColors.primary || '#6366f1',
      '--accent-color': customColors.accent || '#818cf8',
      '--panel-color': customColors.panel || '#1e293b',
      '--success-color': customColors.success || '#4ade80',
      '--danger-color': customColors.danger || '#f87171',
    } as React.CSSProperties;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.no-drag')) return;
    
    if (windowRef.current) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.no-drag')) return;

    if (windowRef.current && e.touches.length === 1) {
      setIsDragging(true);
      setDragOffset({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        moveWindow(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        e.preventDefault(); 
        moveWindow(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const moveWindow = (clientX: number, clientY: number) => {
        if (!windowRef.current) return;
        const rect = windowRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const newX = clientX - dragOffset.x;
        const newY = clientY - dragOffset.y;
        
        const boundedX = Math.max(0, Math.min(window.innerWidth - width, newX));
        const boundedY = Math.max(0, Math.min(window.innerHeight - height, newY));
        
        setPosition({ x: boundedX, y: boundedY });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset]);

  const transitionClass = isDragging ? 'transition-none' : 'transition-all duration-300 ease-in-out';

  return (
    <div
      ref={windowRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        // CRITICAL: pointer-events-auto is required here because the iframe has pointer-events: none
        pointerEvents: 'auto', 
        ...getStyle()
      }}
      className={`
        shadow-2xl flex flex-col select-none overflow-hidden border
        ${transitionClass}
        ${isMinimized 
          ? 'w-[160px] h-[36px] rounded-lg' 
          : 'w-[90vw] max-w-sm md:w-96 h-[600px] max-h-[85vh] rounded-xl'
        }
        ${theme.effect || ''}
        ${theme.colors.bgHeader} ${theme.colors.border}
      `}
    >
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`
          flex items-center justify-between cursor-move shrink-0 relative z-20
          transition-all duration-300
          ${isMinimized ? 'h-full px-3' : 'h-12 px-4 border-b'}
          ${theme.colors.textMain}
          ${!isMinimized && theme.colors.bgHeader}
        `}
      >
        <div className="flex items-center gap-2 font-bold text-sm md:text-base whitespace-nowrap overflow-hidden">
          <span className={`w-2 h-2 rounded-full shrink-0 ${theme.colors.primary.replace('bg-', 'bg-')}`}></span>
          <span className={`transition-opacity duration-300 ${isMinimized ? 'opacity-100 text-xs' : 'opacity-100'}`}>
            {isMinimized ? '点击展开' : title}
          </span>
        </div>
        
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${theme.colors.textDim} shrink-0`}
          title={isMinimized ? "展开" : "最小化"}
        >
          {isMinimized ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          )}
        </button>
      </div>

      <div className={`
        relative flex flex-col w-full h-full
        transition-opacity duration-300
        ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-75'}
        ${theme.colors.bgBase} ${theme.colors.textMain}
      `}>
          <div className="absolute inset-0 z-0">
             <ParticleBackground theme={theme} config={particleConfig} />
          </div>
          
          <div className="relative z-10 p-4 overflow-y-auto custom-scrollbar flex-1 h-full w-full">
            {children}
          </div>
      </div>
    </div>
  );
};

export default FloatingWindow;
