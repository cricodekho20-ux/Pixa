import React, { useRef, useState, useEffect } from 'react';
import { DrawingLayer } from '../types/editor';
import { Pen, Paintbrush, Eraser, Check, X, RotateCcw } from 'lucide-react';

interface FreehandDrawCanvasProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  pan: { x: number; y: number };
  onFinish: (layer: DrawingLayer) => void;
  onCancel: () => void;
}

export const FreehandDrawCanvas: React.FC<FreehandDrawCanvasProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  pan,
  onFinish,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'brush' | 'eraser'>('pen');
  const [color, setColor] = useState('#22C55E');
  const [size, setSize] = useState(10);
  const [opacity, setOpacity] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const strokesRef = useRef<ImageData[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getCanvasCoords = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    return {
      x: (clientX / rect.width) * canvasWidth,
      y: (clientY / rect.height) * canvasHeight,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state for undo
    strokesRef.current.push(ctx.getImageData(0, 0, canvasWidth, canvasHeight));
    if (strokesRef.current.length > 20) strokesRef.current.shift();

    const pt = getCanvasCoords(e);
    lastPointRef.current = pt;
    setIsDrawing(true);
    setHasDrawn(true);

    // Initial dot
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, (size * (tool === 'brush' ? 1.5 : 1)) / 2, 0, Math.PI * 2);
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = color;
      ctx.globalAlpha = (opacity / 100) * (tool === 'brush' ? 0.7 : 1);
    }
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pt.x, pt.y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.globalAlpha = (opacity / 100) * (tool === 'brush' ? 0.6 : 1);
      ctx.lineWidth = size * (tool === 'brush' ? 1.5 : 1);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    lastPointRef.current = pt;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const last = strokesRef.current.pop();
    if (last) {
      ctx.putImageData(last, 0, 0);
    }
  };

  const handleFinish = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const newLayer: DrawingLayer = {
      id: `ly_drw_${Date.now()}`,
      name: 'DRAWING',
      type: 'drawing',
      visible: true,
      locked: false,
      opacity: 100,
      transform: {
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      dataUrl,
      paths: [],
    };

    onFinish(newLayer);
  };

  const screenLeft = pan.x;
  const screenTop = pan.y;
  const screenWidth = canvasWidth * zoom;
  const screenHeight = canvasHeight * zoom;

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] flex flex-col justify-between select-none touch-none text-white">
      {/* Top action header */}
      <header className="h-14 bg-[#0B3D20] border-b border-[#15803D] px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-[#22C55E]" />
          <div>
            <h2 className="text-sm font-extrabold text-white">Freehand Draw Mode</h2>
            <p className="text-[10px] text-emerald-200/70">Draw lines, brush strokes, and shapes directly</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={strokesRef.current.length === 0}
            className="p-2 text-neutral-300 hover:text-white rounded-xl bg-[#052E16] border border-[#15803D] disabled:opacity-40"
            title="Undo Stroke"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-neutral-300 hover:text-white rounded-xl bg-[#052E16] border border-[#15803D]"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleFinish}
            disabled={!hasDrawn}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-[#22C55E] disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-md shadow-[#16A34A]/30 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Finish Drawing</span>
          </button>
        </div>
      </header>

      {/* Drawing Canvas mapped over the design workspace */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute cursor-crosshair touch-none shadow-2xl"
        style={{
          left: `${screenLeft}px`,
          top: `${screenTop}px`,
          width: `${screenWidth}px`,
          height: `${screenHeight}px`,
        }}
      />

      {/* Floating Drawing Tool Bar in Dark Green */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#0B3D20]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#15803D] shadow-2xl flex flex-wrap items-center justify-center gap-3 max-w-[94vw] z-50">
        {/* Tool selector */}
        <div className="flex items-center gap-1 bg-[#052E16] p-1 rounded-xl border border-[#15803D]">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pen' ? 'bg-[#16A34A] text-white font-bold' : 'text-neutral-300 hover:text-white'
            }`}
            title="Pen"
          >
            <Pen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'brush' ? 'bg-[#16A34A] text-white font-bold' : 'text-neutral-300 hover:text-white'
            }`}
            title="Brush"
          >
            <Paintbrush className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser' ? 'bg-[#16A34A] text-white font-bold' : 'text-neutral-300 hover:text-white'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Size Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-emerald-200">Size</span>
          <input
            type="range"
            min="2"
            max="60"
            value={size}
            onChange={e => setSize(Number(e.target.value))}
            className="w-20 accent-[#22C55E] h-1.5 bg-[#052E16] rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-white w-5">{size}</span>
        </div>

        {/* Color Palette */}
        {tool !== 'eraser' && (
          <div className="flex items-center gap-1.5">
            {['#22C55E', '#16A34A', '#FFFFFF', '#FACC15', '#EF4444', '#3B82F6', '#000000'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border ${
                  color === c ? 'border-white scale-110 shadow-md ring-2 ring-[#22C55E]' : 'border-[#15803D]'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
