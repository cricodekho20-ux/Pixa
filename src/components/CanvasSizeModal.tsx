import React, { useState } from 'react';
import { Check, X, Sliders } from 'lucide-react';

interface CanvasSizeModalProps {
  currentWidth: number;
  currentHeight: number;
  onApplySize: (width: number, height: number) => void;
  onClose: () => void;
}

interface SizePreset {
  id: string;
  name: string;
  ratio: string;
  width: number;
  height: number;
  category: string;
}

const SIZE_PRESETS: SizePreset[] = [
  { id: '9:16', name: '9:16 Story / Reel', ratio: '9:16', width: 1080, height: 1920, category: 'Social' },
  { id: '4:5', name: '4:5 Portrait', ratio: '4:5', width: 1080, height: 1350, category: 'Social' },
  { id: '1:1', name: '1:1 Square', ratio: '1:1', width: 1080, height: 1080, category: 'Social' },
  { id: '16:9', name: '16:9 Landscape', ratio: '16:9', width: 1920, height: 1080, category: 'Video' },
  { id: 'yt_thumb', name: 'YouTube Thumbnail', ratio: '16:9', width: 1280, height: 720, category: 'YouTube' },
  { id: 'ig_post', name: 'Instagram Post', ratio: '1:1', width: 1080, height: 1080, category: 'Instagram' },
  { id: 'ig_story', name: 'Instagram Story', ratio: '9:16', width: 1080, height: 1920, category: 'Instagram' },
  { id: 'fb_post', name: 'Facebook Post', ratio: '1.91:1', width: 1200, height: 630, category: 'Facebook' },
  { id: 'wa_status', name: 'WhatsApp Status', ratio: '9:16', width: 1080, height: 1920, category: 'WhatsApp' },
];

export const CanvasSizeModal: React.FC<CanvasSizeModalProps> = ({
  currentWidth,
  currentHeight,
  onApplySize,
  onClose,
}) => {
  const [width, setWidth] = useState<number>(currentWidth);
  const [height, setHeight] = useState<number>(currentHeight);
  const [selectedId, setSelectedId] = useState<string>('custom');

  const handleSelectPreset = (p: SizePreset) => {
    setSelectedId(p.id);
    setWidth(p.width);
    setHeight(p.height);
  };

  const handleApply = () => {
    onApplySize(Math.max(100, width), Math.max(100, height));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white">Design Size</h3>
            <p className="text-[11px] text-emerald-200/70">Social media aspect ratios & custom dimensions</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#052E16] text-neutral-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {SIZE_PRESETS.map(preset => {
              const isSelected = width === preset.width && height === preset.height;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#16A34A] border-[#22C55E] text-white shadow-sm'
                      : 'bg-[#052E16] border-[#15803D] hover:border-[#22C55E] text-neutral-200'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{preset.name}</div>
                  <div className="text-[10px] font-mono text-emerald-200/80 mt-1">
                    {preset.width} × {preset.height} ({preset.ratio})
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Dimension Inputs */}
          <div className="pt-3 border-t border-[#15803D] mt-3">
            <span className="text-xs font-bold text-emerald-200 block mb-2">Custom Dimensions</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-emerald-300 uppercase font-semibold block mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={width}
                  onChange={e => {
                    setWidth(Number(e.target.value));
                    setSelectedId('custom');
                  }}
                  className="w-full bg-[#052E16] text-sm font-mono text-white px-3 py-2 rounded-xl border border-[#15803D] focus:outline-none focus:border-[#22C55E] text-center"
                />
              </div>

              <div>
                <label className="text-[10px] text-emerald-300 uppercase font-semibold block mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={height}
                  onChange={e => {
                    setHeight(Number(e.target.value));
                    setSelectedId('custom');
                  }}
                  className="w-full bg-[#052E16] text-sm font-mono text-white px-3 py-2 rounded-xl border border-[#15803D] focus:outline-none focus:border-[#22C55E] text-center"
                />
              </div>
            </div>
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
            <span>Apply Size</span>
          </button>
        </div>
      </div>
    </div>
  );
};
