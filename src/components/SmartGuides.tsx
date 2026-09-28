import React from 'react';

export interface GuideLine {
  type: 'x' | 'y';
  position: number;
}

interface SmartGuidesProps {
  guides: GuideLine[];
  zoom: number;
  pan: { x: number; y: number };
}

export const SmartGuides: React.FC<SmartGuidesProps> = ({ guides, zoom, pan }) => {
  if (guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {guides.map((g, idx) => {
        if (g.type === 'x') {
          const screenX = g.position * zoom + pan.x;
          return (
            <div
              key={`g-x-${idx}`}
              className="absolute top-0 bottom-0 w-[1.5px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
              style={{ left: `${screenX}px` }}
            >
              <div className="absolute top-2 left-1 bg-emerald-600 text-white font-mono text-[9px] px-1 rounded font-bold shadow">
                {Math.round(g.position)}px
              </div>
            </div>
          );
        } else {
          const screenY = g.position * zoom + pan.y;
          return (
            <div
              key={`g-y-${idx}`}
              className="absolute left-0 right-0 h-[1.5px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
              style={{ top: `${screenY}px` }}
            >
              <div className="absolute left-2 top-1 bg-emerald-600 text-white font-mono text-[9px] px-1 rounded font-bold shadow">
                {Math.round(g.position)}px
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};
