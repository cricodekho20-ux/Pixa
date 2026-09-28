import React, { useState, useEffect, useRef } from 'react';
import { ImageLayer } from '../types/editor';
import { processChromaKey, smartAutoRemoveBackground } from '../utils/chromaKey';
import { Sparkles, Check, X, Pipette, RefreshCw } from 'lucide-react';

interface ChromaKeyModalProps {
  layer: ImageLayer;
  onApply: (newSrc: string, chromaKeyConfig: ImageLayer['chromaKey']) => void;
  onClose: () => void;
}

export const ChromaKeyModal: React.FC<ChromaKeyModalProps> = ({ layer, onApply, onClose }) => {
  const [color, setColor] = useState(layer.chromaKey?.color || '#00FF00');
  const [tolerance, setTolerance] = useState(layer.chromaKey?.tolerance ?? 35);
  const [feather, setFeather] = useState(layer.chromaKey?.feather ?? 15);
  const [edgeSmoothing, setEdgeSmoothing] = useState(layer.chromaKey?.edgeSmoothing ?? 8);
  const [previewSrc, setPreviewSrc] = useState<string>(layer.src);
  const [processing, setProcessing] = useState(false);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update preview whenever options change
  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      try {
        setProcessing(true);
        const result = await processChromaKey(layer.originalSrc || layer.src, {
          color,
          tolerance,
          feather,
          edgeSmoothing,
        });
        if (active) {
          setPreviewSrc(result);
          setProcessing(false);
        }
      } catch (e) {
        console.error('Chroma key error', e);
        if (active) setProcessing(false);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [color, tolerance, feather, edgeSmoothing, layer]);

  // Click on preview image to sample color
  const handleEyedropperSample = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEyedropperActive) return;

    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const naturalX = Math.round((x / rect.width) * img.naturalWidth);
    const naturalY = Math.round((y / rect.height) * img.naturalHeight);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const pixel = ctx.getImageData(naturalX, naturalY, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    setColor(hex);
    setIsEyedropperActive(false);
  };

  const handleAutoAI = async () => {
    try {
      setProcessing(true);
      const res = await smartAutoRemoveBackground(layer.originalSrc || layer.src);
      setPreviewSrc(res);
      setProcessing(false);
    } catch (e) {
      console.error(e);
      setProcessing(false);
    }
  };

  const handleApply = () => {
    onApply(previewSrc, {
      enabled: true,
      color,
      tolerance,
      feather,
      edgeSmoothing,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#22C55E]" />
            <div>
              <h2 className="text-sm font-extrabold text-white">Background Removal & Chroma Key</h2>
              <p className="text-[11px] text-emerald-200/70">Remove solid backgrounds or color ranges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#052E16] hover:bg-[#15803D] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Box with Checkerboard Background */}
        <div className="relative h-60 bg-checkerboard flex items-center justify-center overflow-hidden border-b border-[#15803D] p-4">
          <img
            src={previewSrc}
            alt="Chroma Key Preview"
            onClick={handleEyedropperSample}
            className={`max-h-full max-w-full object-contain rounded-lg shadow-lg select-none transition-opacity ${
              isEyedropperActive ? 'cursor-crosshair ring-2 ring-[#22C55E]' : ''
            }`}
          />

          {processing && (
            <div className="absolute inset-0 bg-[#052E16]/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex items-center gap-2 bg-[#0B3D20] text-white text-xs px-3.5 py-1.5 rounded-full border border-[#15803D] shadow-lg">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#22C55E]" />
                Processing alpha...
              </div>
            </div>
          )}

          {isEyedropperActive && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#052E16] text-[#22C55E] border border-[#22C55E] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Click anywhere on the image to sample background color
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[45vh]">
          {/* Quick AI Auto Remove button */}
          <div className="flex items-center justify-between bg-[#052E16] p-2.5 rounded-xl border border-[#15803D]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
              <div>
                <div className="text-xs font-bold text-white">Smart Auto Remove</div>
                <div className="text-[10px] text-emerald-200/70">Detects background edge automatically</div>
              </div>
            </div>
            <button
              onClick={handleAutoAI}
              className="text-xs font-bold bg-[#16A34A] hover:bg-[#22C55E] text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm"
            >
              Auto Detect
            </button>
          </div>

          {/* Color Picker & Eyedropper */}
          <div className="flex items-center justify-between bg-[#052E16] p-2.5 rounded-xl border border-[#15803D]">
            <span className="text-xs font-bold text-white">Key Color to Remove</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  isEyedropperActive
                    ? 'bg-[#16A34A] text-white font-bold border-[#22C55E]'
                    : 'bg-[#0B3D20] text-neutral-200 border-[#15803D] hover:bg-[#15803D]'
                }`}
              >
                <Pipette className="w-3.5 h-3.5" />
                <span>Eyedropper</span>
              </button>
              <div
                className="w-7 h-7 rounded-lg border border-[#15803D] shadow-inner cursor-pointer relative overflow-hidden"
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <span className="font-mono text-xs text-emerald-200 uppercase">{color}</span>
            </div>
          </div>

          {/* Sliders: Tolerance, Feather, Edge Smoothing */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-100 font-medium">Color Tolerance</span>
                <span className="font-mono text-[#22C55E] font-bold">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={tolerance}
                onChange={e => setTolerance(Number(e.target.value))}
                className="w-full h-1.5 bg-[#052E16] rounded-lg accent-[#22C55E] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-100 font-medium">Feather / Soft Edge</span>
                <span className="font-mono text-[#22C55E] font-bold">{feather}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={feather}
                onChange={e => setFeather(Number(e.target.value))}
                className="w-full h-1.5 bg-[#052E16] rounded-lg accent-[#22C55E] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-100 font-medium">Edge Anti-Aliasing</span>
                <span className="font-mono text-[#22C55E] font-bold">{edgeSmoothing}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={edgeSmoothing}
                onChange={e => setEdgeSmoothing(Number(e.target.value))}
                className="w-full h-1.5 bg-[#052E16] rounded-lg accent-[#22C55E] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#15803D] flex items-center justify-end gap-2 bg-[#052E16]/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-xl bg-[#052E16] hover:bg-[#15803D]"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-black text-white bg-[#16A34A] hover:bg-[#22C55E] rounded-xl shadow-lg shadow-[#16A34A]/30 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply Cutout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
