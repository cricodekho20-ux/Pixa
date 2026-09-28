import React, { useState, useRef, useEffect } from 'react';
import { CornerPin, ImageLayer } from '../types/editor';
import { Check, X, RotateCcw } from 'lucide-react';

interface PerspectivePinsProps {
  layer: ImageLayer;
  zoom: number;
  pan: { x: number; y: number };
  onApply: (perspective: ImageLayer['perspective']) => void;
  onCancel: () => void;
}

export const PerspectivePins: React.FC<PerspectivePinsProps> = ({
  layer,
  zoom,
  pan,
  onApply,
  onCancel,
}) => {
  const w = layer.transform.width;
  const h = layer.transform.height;

  const initialPins = layer.perspective?.enabled
    ? { ...layer.perspective }
    : {
        enabled: true,
        topLeft: { x: 0, y: 0 },
        topRight: { x: w, y: 0 },
        bottomRight: { x: w, y: h },
        bottomLeft: { x: 0, y: h },
      };

  const [pins, setPins] = useState(initialPins);
  const [activePin, setActivePin] = useState<'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft' | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; pinOrigin: CornerPin } | null>(null);

  const handlePointerDown = (
    pinKey: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft',
    e: React.PointerEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActivePin(pinKey);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      pinOrigin: { ...pins[pinKey] },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePin || !dragStartRef.current) return;
    const dx = (e.clientX - dragStartRef.current.clientX) / zoom;
    const dy = (e.clientY - dragStartRef.current.clientY) / zoom;

    setPins(prev => ({
      ...prev,
      [activePin]: {
        x: Math.round(dragStartRef.current!.pinOrigin.x + dx),
        y: Math.round(dragStartRef.current!.pinOrigin.y + dy),
      },
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activePin) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setActivePin(null);
      dragStartRef.current = null;
    }
  };

  const handleReset = () => {
    setPins({
      enabled: false,
      topLeft: { x: 0, y: 0 },
      topRight: { x: w, y: 0 },
      bottomRight: { x: w, y: h },
      bottomLeft: { x: 0, y: h },
    });
  };

  // Convert layer coordinate to screen overlay coordinate
  const toScreen = (p: CornerPin) => {
    const lx = layer.transform.x + p.x;
    const ly = layer.transform.y + p.y;
    return {
      x: lx * zoom + pan.x,
      y: ly * zoom + pan.y,
    };
  };

  const pTL = toScreen(pins.topLeft);
  const pTR = toScreen(pins.topRight);
  const pBR = toScreen(pins.bottomRight);
  const pBL = toScreen(pins.bottomLeft);

  return (
    <div className="absolute inset-0 pointer-events-auto z-40">
      {/* SVG connection lines and mesh */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <polygon
          points={`${pTL.x},${pTL.y} ${pTR.x},${pTR.y} ${pBR.x},${pBR.y} ${pBL.x},${pBL.y}`}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Cross guides */}
        <line x1={pTL.x} y1={pTL.y} x2={pBR.x} y2={pBR.y} stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
        <line x1={pTR.x} y1={pTR.y} x2={pBL.x} y2={pBL.y} stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
      </svg>

      {/* 4 Interactive Corner Pins */}
      {[
        { key: 'topLeft' as const, pos: pTL, label: 'Top Left' },
        { key: 'topRight' as const, pos: pTR, label: 'Top Right' },
        { key: 'bottomRight' as const, pos: pBR, label: 'Bottom Right' },
        { key: 'bottomLeft' as const, pos: pBL, label: 'Bottom Left' },
      ].map(pin => (
        <div
          key={pin.key}
          onPointerDown={e => handlePointerDown(pin.key, e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center cursor-move touch-none active:scale-125 transition-transform"
          style={{ left: `${pin.pos.x}px`, top: `${pin.pos.y}px` }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white" />
          <div className="absolute -top-6 whitespace-nowrap bg-neutral-900/90 text-[10px] text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-700 pointer-events-none">
            {pin.label}
          </div>
        </div>
      ))}

      {/* Bottom Floating Control Pill */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-neutral-700/80 shadow-2xl flex items-center gap-3">
        <span className="text-xs font-semibold text-neutral-300">Perspective / Warp</span>
        <div className="h-4 w-px bg-neutral-700" />
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-neutral-800"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          onClick={() => onApply({ ...pins, enabled: true })}
          className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          Apply Warp
        </button>
      </div>
    </div>
  );
};
