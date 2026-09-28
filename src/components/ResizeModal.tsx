import React, { useState } from 'react';
import { Layer } from '../types/editor';
import { Maximize2, Lock, Unlock, Check, X, RotateCcw } from 'lucide-react';

interface ResizeModalProps {
  layer: Layer;
  onApplyResize: (width: number, height: number, scaleX: number, scaleY: number) => void;
  onClose: () => void;
}

export const ResizeModal: React.FC<ResizeModalProps> = ({ layer, onApplyResize, onClose }) => {
  const [width, setWidth] = useState<number>(layer.transform.width);
  const [height, setHeight] = useState<number>(layer.transform.height);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(Math.round(layer.transform.scaleX * 100));

  const aspectRatio = layer.transform.width / layer.transform.height;

  const handleWidthChange = (val: number) => {
    const w = Math.max(10, val);
    setWidth(w);
    if (lockAspect && aspectRatio > 0) {
      setHeight(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(10, val);
    setHeight(h);
    if (lockAspect && aspectRatio > 0) {
      setWidth(Math.round(h * aspectRatio));
    }
  };

  const handleScaleChange = (val: number) => {
    setScale(val);
  };

  const handleApply = () => {
    const s = scale / 100;
    onApplyResize(width, height, s, s);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-[#22C55E]" />
            <h3 className="text-sm font-extrabold text-white">Resize Object</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#052E16] text-neutral-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-4 space-y-4 text-xs">
          {/* Lock Aspect Ratio Toggle */}
          <div className="flex items-center justify-between bg-[#052E16] p-2.5 rounded-xl border border-[#15803D]">
            <div className="flex items-center gap-2">
              {lockAspect ? (
                <Lock className="w-4 h-4 text-[#22C55E]" />
              ) : (
                <Unlock className="w-4 h-4 text-neutral-400" />
              )}
              <span className="font-bold text-white">Lock Aspect Ratio</span>
            </div>
            <button
              onClick={() => setLockAspect(!lockAspect)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                lockAspect ? 'bg-[#16A34A]' : 'bg-[#0B3D20] border border-[#15803D]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  lockAspect ? 'left-5' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Width & Height Input Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-emerald-200 block mb-1">
                Width (px)
              </label>
              <input
                type="number"
                min="10"
                max="4000"
                value={width}
                onChange={e => handleWidthChange(Number(e.target.value))}
                className="w-full bg-[#052E16] text-sm font-mono text-white px-3 py-2 rounded-xl border border-[#15803D] focus:outline-none focus:border-[#22C55E] text-center"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-emerald-200 block mb-1">
                Height (px)
              </label>
              <input
                type="number"
                min="10"
                max="4000"
                value={height}
                onChange={e => handleHeightChange(Number(e.target.value))}
                className="w-full bg-[#052E16] text-sm font-mono text-white px-3 py-2 rounded-xl border border-[#15803D] focus:outline-none focus:border-[#22C55E] text-center"
              />
            </div>
          </div>

          {/* Scale Percentage Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-emerald-200">
              <span className="font-bold">Scale Factor</span>
              <span className="font-mono text-[#22C55E] font-bold">{scale}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="400"
              value={scale}
              onChange={e => handleScaleChange(Number(e.target.value))}
              className="w-full accent-[#22C55E] h-1.5 bg-[#052E16] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#15803D] flex items-center justify-end gap-2 bg-[#052E16]/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white rounded-xl hover:bg-[#15803D]"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 bg-[#16A34A] hover:bg-[#22C55E] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#16A34A]/30 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Apply Resize</span>
          </button>
        </div>
      </div>
    </div>
  );
};
