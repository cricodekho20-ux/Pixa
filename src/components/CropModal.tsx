import React, { useState, useRef, useEffect } from 'react';
import { ImageLayer } from '../types/editor';
import { Crop, Check, X, RotateCcw } from 'lucide-react';

interface CropModalProps {
  layer: ImageLayer;
  onApplyCrop: (newSrc: string, croppedWidth: number, croppedHeight: number) => void;
  onClose: () => void;
}

type AspectRatioOption = 'free' | '1:1' | '4:5' | '9:16' | '16:9' | 'custom';

export const CropModal: React.FC<CropModalProps> = ({ layer, onApplyCrop, onClose }) => {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioOption>('free');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Normalized crop rectangle: percentages (0 to 100)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 10,
    y: 10,
    w: 80,
    h: 80,
  });

  const [activeDrag, setActiveDrag] = useState<
    'move' | 'tl' | 'tr' | 'br' | 'bl' | null
  >(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialBox: typeof cropBox } | null>(
    null
  );

  // Adjust crop box when aspect ratio button is clicked
  const handleSelectRatio = (ratio: AspectRatioOption) => {
    setSelectedRatio(ratio);
    if (ratio === 'free' || ratio === 'custom') return;

    let targetAspect = 1;
    if (ratio === '1:1') targetAspect = 1;
    if (ratio === '4:5') targetAspect = 4 / 5;
    if (ratio === '9:16') targetAspect = 9 / 16;
    if (ratio === '16:9') targetAspect = 16 / 9;

    const img = imageRef.current;
    if (!img) return;

    const naturalAspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
    // Calculate new width & height percentages
    if (targetAspect <= naturalAspect) {
      const newH = 80;
      const newW = Math.min(95, Math.round((newH * targetAspect) / naturalAspect));
      setCropBox({
        x: Math.round((100 - newW) / 2),
        y: 10,
        w: newW,
        h: newH,
      });
    } else {
      const newW = 80;
      const newH = Math.min(95, Math.round((newW / targetAspect) * naturalAspect));
      setCropBox({
        x: 10,
        y: Math.round((100 - newH) / 2),
        w: newW,
        h: newH,
      });
    }
  };

  const handlePointerDown = (
    mode: 'move' | 'tl' | 'tr' | 'br' | 'bl',
    e: React.PointerEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveDrag(mode);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialBox: { ...cropBox },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag || !dragStartRef.current || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dx = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
    const init = dragStartRef.current.initialBox;

    if (activeDrag === 'move') {
      const newX = Math.max(0, Math.min(100 - init.w, Math.round(init.x + dx)));
      const newY = Math.max(0, Math.min(100 - init.h, Math.round(init.y + dy)));
      setCropBox(prev => ({ ...prev, x: newX, y: newY }));
    } else if (activeDrag === 'br') {
      const newW = Math.max(10, Math.min(100 - init.x, Math.round(init.w + dx)));
      const newH = Math.max(10, Math.min(100 - init.y, Math.round(init.h + dy)));
      setCropBox(prev => ({ ...prev, w: newW, h: newH }));
    } else if (activeDrag === 'tr') {
      const newW = Math.max(10, Math.min(100 - init.x, Math.round(init.w + dx)));
      const newY = Math.max(0, Math.min(init.y + init.h - 10, Math.round(init.y + dy)));
      const newH = init.h + (init.y - newY);
      setCropBox(prev => ({ ...prev, w: newW, y: newY, h: newH }));
    } else if (activeDrag === 'tl') {
      const newX = Math.max(0, Math.min(init.x + init.w - 10, Math.round(init.x + dx)));
      const newY = Math.max(0, Math.min(init.y + init.h - 10, Math.round(init.y + dy)));
      const newW = init.w + (init.x - newX);
      const newH = init.h + (init.y - newY);
      setCropBox(prev => ({ ...prev, x: newX, y: newY, w: newW, h: newH }));
    } else if (activeDrag === 'bl') {
      const newX = Math.max(0, Math.min(init.x + init.w - 10, Math.round(init.x + dx)));
      const newW = init.w + (init.x - newX);
      const newH = Math.max(10, Math.min(100 - init.y, Math.round(init.h + dy)));
      setCropBox(prev => ({ ...prev, x: newX, w: newW, h: newH }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setActiveDrag(null);
      dragStartRef.current = null;
    }
  };

  const handleApply = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const sx = Math.round((cropBox.x / 100) * img.naturalWidth);
      const sy = Math.round((cropBox.y / 100) * img.naturalHeight);
      const sw = Math.round((cropBox.w / 100) * img.naturalWidth);
      const sh = Math.round((cropBox.h / 100) * img.naturalHeight);

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, sw);
      canvas.height = Math.max(1, sh);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const croppedDataUrl = canvas.toDataURL('image/png');
      onApplyCrop(croppedDataUrl, sw, sh);
      onClose();
    };
    img.src = layer.src;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between text-white select-none animate-in fade-in duration-150">
      {/* Header */}
      <header className="h-14 border-b border-[#15803D] px-4 flex items-center justify-between bg-[#0B3D20] shrink-0">
        <div className="flex items-center gap-2">
          <Crop className="w-5 h-5 text-[#22C55E]" />
          <h2 className="text-sm font-extrabold text-white">Crop Photo</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 text-neutral-300 hover:text-white rounded-xl bg-[#052E16] hover:bg-[#15803D]"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-[#22C55E] text-white font-black text-xs rounded-xl shadow-lg shadow-[#16A34A]/30 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply Crop</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex-1 relative flex items-center justify-center p-6 overflow-hidden touch-none bg-[#052E16]/80"
      >
        <div className="relative inline-block max-h-[60vh] max-w-[90vw]">
          <img
            ref={imageRef}
            src={layer.src}
            alt="To crop"
            className="max-h-[60vh] max-w-[90vw] object-contain block select-none pointer-events-none"
          />

          {/* Dark Scrim Mask outside crop box */}
          <div
            className="absolute inset-0 pointer-events-none bg-black/60"
            style={{
              clipPath: `polygon(
                0% 0%, 100% 0%, 100% 100%, 0% 100%,
                0% ${cropBox.y}%,
                ${cropBox.x}% ${cropBox.y}%,
                ${cropBox.x}% ${cropBox.y + cropBox.h}%,
                ${cropBox.x + cropBox.w}% ${cropBox.y + cropBox.h}%,
                ${cropBox.x + cropBox.w}% ${cropBox.y}%,
                0% ${cropBox.y}%
              )`,
            }}
          />

          {/* Interactive Crop Boundary Box (GREEN) */}
          <div
            onPointerDown={e => handlePointerDown('move', e)}
            className="absolute border-2 border-[#22C55E] cursor-move shadow-[0_0_10px_rgba(34,197,94,0.6)]"
            style={{
              left: `${cropBox.x}%`,
              top: `${cropBox.y}%`,
              width: `${cropBox.w}%`,
              height: `${cropBox.h}%`,
            }}
          >
            {/* Rule of Thirds Grid Lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div />
            </div>

            {/* Corner Resizing Knobs in GREEN */}
            <div
              onPointerDown={e => handlePointerDown('tl', e)}
              className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-[#22C55E] border-2 border-[#052E16] rounded-full cursor-nwse-resize shadow"
            />
            <div
              onPointerDown={e => handlePointerDown('tr', e)}
              className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#22C55E] border-2 border-[#052E16] rounded-full cursor-nesw-resize shadow"
            />
            <div
              onPointerDown={e => handlePointerDown('br', e)}
              className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-[#22C55E] border-2 border-[#052E16] rounded-full cursor-nwse-resize shadow"
            />
            <div
              onPointerDown={e => handlePointerDown('bl', e)}
              className="absolute -bottom-2.5 -left-2.5 w-6 h-6 bg-[#22C55E] border-2 border-[#052E16] rounded-full cursor-nesw-resize shadow"
            />
          </div>
        </div>
      </div>

      {/* Bottom Aspect Ratio Selector: Free, 1:1, 4:5, 9:16, 16:9, Custom */}
      <footer className="h-20 bg-[#0B3D20] border-t border-[#15803D] px-4 flex items-center justify-center shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-lg">
          {[
            { id: 'free' as const, label: 'Free Crop' },
            { id: '1:1' as const, label: '1:1 Square' },
            { id: '4:5' as const, label: '4:5 Portrait' },
            { id: '9:16' as const, label: '9:16 Story' },
            { id: '16:9' as const, label: '16:9 Wide' },
            { id: 'custom' as const, label: 'Custom' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => handleSelectRatio(r.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedRatio === r.id
                  ? 'bg-[#16A34A] text-white shadow-md border border-[#22C55E]'
                  : 'bg-[#052E16] text-neutral-300 hover:text-white border border-[#15803D]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
