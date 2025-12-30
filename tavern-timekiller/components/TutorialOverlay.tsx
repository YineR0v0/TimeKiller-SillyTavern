import React from 'react';
import { ThemeConfig } from '../types';

interface TutorialOverlayProps {
  theme: ThemeConfig;
  onClose: (dontShowAgain: boolean) => void;
  instructions: { icon: string; text: string }[];
  title: string;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ theme, onClose, instructions, title }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300 rounded-b-xl">
      <div className={`
        w-full max-w-xs p-5 rounded-xl shadow-2xl relative
        ${theme.colors.bgBase} ${theme.colors.border} border
      `}>
        <h3 className={`text-lg font-bold mb-4 text-center ${theme.colors.textMain}`}>
          {title} - 玩法说明
        </h3>
        
        <div className="space-y-4 mb-6">
          {instructions.map((ins, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl">{ins.icon}</span>
              <p className={`text-sm ${theme.colors.textMain} leading-tight pt-1`}>{ins.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onClose(false)}
            className={`w-full py-2.5 rounded-lg font-bold text-white shadow-md active:scale-95 transition-transform ${theme.colors.primary} ${theme.colors.primaryHover}`}
          >
            开始游戏
          </button>
          <button
            onClick={() => onClose(true)}
            className={`text-xs ${theme.colors.textDim} hover:underline mt-1 p-2 text-center`}
          >
            不再提示
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;