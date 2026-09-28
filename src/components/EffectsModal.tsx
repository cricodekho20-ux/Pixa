import React, { useState } from 'react';
import { ImageEffects, ImageLayer } from '../types/editor';
import { Sliders, RotateCcw, Check, X } from 'lucide-react';

interface EffectsModalProps {
  layer: ImageLayer;
  onApply: (effects: ImageEffects) => void;
  onClose: () => void;
}

const DEFAULT_EFFECTS: ImageEffects = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  exposure: 0,
  temperature: 0,
  blur: 0,
  sharpen: 0,
  vignette: 0,
  grayscale: 0,
  sepia: 0,
  noise: 0,
  stripes: 0,
};

export const EffectsModal: React.FC<EffectsModalProps> = ({ layer, onApply, onClose }) => {
  const [effects, setEffects] = useState<ImageEffects>({ ...DEFAULT_EFFECTS, ...layer.effects });

  const update = (key: keyof ImageEffects, val: number) => {
    setEffects(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setEffects({ ...DEFAULT_EFFECTS });
  };

  // Generate CSS filter preview
  const cssFilter = [
    effects.brightness !== 0 ? `brightness(${100 + effects.brightness}%)` : '',
    effects.contrast !== 0 ? `contrast(${100 + effects.contrast}%)` : '',
    effects.saturation !== 0 ? `saturate(${100 + effects.saturation}%)` : '',
    effects.hue !== 0 ? `hue-rotate(${effects.hue}deg)` : '',
    effects.grayscale !== 0 ? `grayscale(${effects.grayscale}%)` : '',
    effects.sepia !== 0 ? `sepia(${effects.sepia}%)` : '',
    effects.blur !== 0 ? `blur(${effects.blur}px)` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleApply = () => {
    onApply(effects);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#22C55E]" />
            <div>
              <h2 className="text-sm font-extrabold text-white">Image Effects & Filters</h2>
              <p className="text-[11px] text-emerald-200/70">Color grading, tone, vignette & grain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#052E16] hover:bg-[#15803D] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="relative h-56 bg-[#052E16] flex items-center justify-center overflow-hidden border-b border-[#15803D] p-4">
          <div className="relative max-h-full max-w-full flex items-center justify-center overflow-hidden rounded-lg">
            <img
              src={layer.src}
              alt="Effect Preview"
              className="max-h-48 max-w-full object-contain rounded-lg"
              style={{
                filter: cssFilter,
              }}
            />

            {/* Vignette overlay */}
            {effects.vignette > 0 && (
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  boxShadow: `inset 0 0 ${effects.vignette * 1.5}px rgba(0,0,0,${effects.vignette / 100})`,
                }}
              />
            )}

            {/* Scanlines / Stripes */}
            {effects.stripes > 0 && (
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,${effects.stripes / 100 * 0.4}) 0px, rgba(0,0,0,${effects.stripes / 100 * 0.4}) 2px, transparent 2px, transparent 4px)`,
                }}
              />
            )}
          </div>
        </div>

        {/* Adjustment Sliders */}
        <div className="p-4 overflow-y-auto max-h-[45vh] space-y-4">
          {[
            { key: 'brightness' as const, label: 'Brightness', min: -100, max: 100, step: 1 },
            { key: 'contrast' as const, label: 'Contrast', min: -100, max: 100, step: 1 },
            { key: 'saturation' as const, label: 'Saturation', min: -100, max: 100, step: 1 },
            { key: 'hue' as const, label: 'Hue Rotate', min: 0, max: 360, step: 1 },
            { key: 'exposure' as const, label: 'Exposure', min: -100, max: 100, step: 1 },
            { key: 'temperature' as const, label: 'Warmth / Temperature', min: -100, max: 100, step: 1 },
            { key: 'blur' as const, label: 'Blur', min: 0, max: 40, step: 1 },
            { key: 'vignette' as const, label: 'Vignette', min: 0, max: 100, step: 1 },
            { key: 'grayscale' as const, label: 'Grayscale', min: 0, max: 100, step: 1 },
            { key: 'sepia' as const, label: 'Sepia Vintage', min: 0, max: 100, step: 1 },
            { key: 'stripes' as const, label: 'Retro Scanline Stripes', min: 0, max: 100, step: 1 },
          ].map(item => (
            <div key={item.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-100 font-medium">{item.label}</span>
                <span className="font-mono text-[#22C55E] font-bold">
                  {effects[item.key]}
                  {item.key === 'hue' ? '°' : ''}
                </span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={effects[item.key]}
                onChange={e => update(item.key, Number(e.target.value))}
                className="w-full accent-[#22C55E] h-1.5 bg-[#052E16] rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#15803D] flex items-center justify-between bg-[#052E16]/60">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white rounded-xl bg-[#052E16] border border-[#15803D] hover:bg-[#15803D]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
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
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
