
import React, { useEffect, useRef } from 'react';
import { ThemeConfig } from '../types.ts';

interface ParticleBackgroundProps {
  theme: ThemeConfig;
  config: {
    enabled: boolean;
    density: number;
    color: string;
  };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ theme, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config.enabled || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const getThemeColorValue = () => {
        const colorMap: Record<string, string> = {
            'bg-indigo-600': '#4f46e5',
            'bg-blue-500': '#3b82f6',
            'bg-[#b58900]': '#b58900',
            'bg-pink-600': '#db2777',
            'bg-[#ff69b4]': '#ff69b4',
            'bg-[var(--primary-color)]': getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#ffffff'
        };
        
        if (theme.isCustom) {
            if (theme.colors.primary.startsWith('#')) return theme.colors.primary;
            return '#ffffff'; 
        }

        return colorMap[theme.colors.primary] || '#ffffff';
    };

    const getParticleColor = () => {
        if (config.color && config.color !== 'auto') {
            return config.color;
        }
        return getThemeColorValue();
    };

    const resize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.1,
      life: Math.random() * 100 + 100
    });

    const init = () => {
      resize();
      particles = [];
      const count = Math.max(10, Math.min(200, config.density));
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = getParticleColor();

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha * (p.life > 20 ? 1 : p.life / 20); 
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.life <= 0) {
           particles[index] = createParticle();
        }
      });

      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      
      const connectionDistance = 60;
      
      for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              if (Math.abs(dx) > connectionDistance) continue; 
              
              const dy = particles[i].y - particles[j].y;
              if (Math.abs(dy) > connectionDistance) continue;

              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < connectionDistance) {
                  ctx.globalAlpha = (1 - dist / connectionDistance) * 0.2;
                  ctx.beginPath();
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(particles[j].x, particles[j].y);
                  ctx.stroke();
              }
          }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.enabled, config.density, config.color, theme]);

  if (!config.enabled) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-b-xl">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export default ParticleBackground;
