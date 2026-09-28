import React, { useState } from 'react';
import { TextLayer, ThreeDTextEffect } from '../types/editor';
import { THREE_D_PRESETS } from '../utils/text3d';
import { Box, Sparkles, Check, X, RotateCcw } from 'lucide-react';

interface ThreeDTextModalProps {
  layer: TextLayer;
  onApply: (threeD: ThreeDTextEffect, textLayerMod?: Partial<TextLayer>) => void;
  onClose: () => void;
}

export const ThreeDTextModal: React.FC<ThreeDTextModalProps> = ({ layer, onApply, onClose }) => {
  const [enabled, setEnabled] = useState<boolean>(layer.threeD?.enabled ?? true);
  const [depth, setDepth] = useState<number>(layer.threeD?.depth ?? 16);
  const [angle, setAngle] = useState<number>(layer.threeD?.angle ?? 60);
  const [color, setColor] = useState<string>(layer.threeD?.color ?? '#052E16');
  const [darken, setDarken] = useState<number>(layer.threeD?.darken ?? 50);
  const [lightAngle, setLightAngle] = useState<number>(layer.threeD?.lightAngle ?? 45);
  const [lighting, setLighting] = useState<number>(layer.threeD?.lighting ?? 80);
  const [selectedPreset, setSelectedPreset] = useState<string>(layer.threeD?.preset ?? 'gold');

  // Preview layer modifications if a preset was selected
  const [textMod, setTextMod] = useState<Partial<TextLayer>>({});

  const applyPreset = (key: string) => {
    const p = THREE_D_PRESETS[key];
    if (!p) return;
    setSelectedPreset(key);
    setEnabled(true);
    setDepth(p.depth);
    setAngle(p.angle);
    setColor(p.color);
    setDarken(p.darken);
    setLightAngle(p.lightAngle);
    setLighting(p.lighting);

    const mod: Partial<TextLayer> = {};
    if (p.gradient) {
      mod.fillType = 'linear-gradient';
      mod.gradient = p.gradient;
    }
    if (p.stroke) {
      mod.stroke = p.stroke;
    }
    setTextMod(mod);
  };

  const handleApply = () => {
    onApply(
      {
        enabled,
        depth,
        angle,
        color,
        darken,
        lightAngle,
        lighting,
        preset: selectedPreset as any,
      },
      textMod
    );
  };

  // Preview text shadow calculation
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const previewShadows: string[] = [];
  if (enabled) {
    for (let i = 1; i <= depth; i++) {
      previewShadows.push(`${(i * cos).toFixed(1)}px ${(i * sin).toFixed(1)}px 0px ${color}`);
    }
    previewShadows.push(`${((depth + 4) * cos).toFixed(1)}px ${((depth + 6) * sin).toFixed(1)}px 12px rgba(0,0,0,0.7)`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-[#22C55E]" />
            <div>
              <h2 className="text-sm font-extrabold text-white">3D Text Studio</h2>
              <p className="text-[11px] text-emerald-200/70">Extrusion, directional lighting & metal/gold presets</p>
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
        <div className="relative h-44 bg-[#052E16] flex items-center justify-center overflow-hidden border-b border-[#15803D] p-4">
          <div
            className="text-4xl sm:text-5xl font-extrabold select-none transition-all text-center"
            style={{
              fontFamily: layer.fontFamily,
              color: textMod.fillType ? 'inherit' : layer.color,
              backgroundImage: textMod.gradient
                ? `linear-gradient(${textMod.gradient.angle}deg, ${textMod.gradient.stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`
                : undefined,
              WebkitBackgroundClip: textMod.gradient ? 'text' : undefined,
              WebkitTextFillColor: textMod.gradient ? 'transparent' : undefined,
              textShadow: previewShadows.join(', '),
            }}
          >
            {layer.text || '3D DESIGN'}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 overflow-y-auto max-h-[46vh] space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between bg-[#052E16] p-2.5 rounded-xl border border-[#15803D]">
            <span className="text-xs font-bold text-white">Enable 3D Extrusion</span>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                enabled ? 'bg-[#16A34A]' : 'bg-[#0B3D20] border border-[#15803D]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Presets List */}
          <div>
            <span className="text-xs font-bold text-emerald-200 block mb-2">3D Style Presets</span>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(THREE_D_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    selectedPreset === key && enabled
                      ? 'bg-[#16A34A] border-[#22C55E] text-white font-bold'
                      : 'bg-[#052E16] border-[#15803D] text-neutral-200 hover:border-[#22C55E]'
                  }`}
                >
                  <div className="text-[11px] truncate font-medium">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Depth Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-300 font-medium">Extrusion Depth</span>
              <span className="font-mono text-[#22C55E] font-bold">{depth}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="45"
              value={depth}
              onChange={e => setDepth(Number(e.target.value))}
              className="w-full h-1.5 bg-[#052E16] rounded-lg accent-[#22C55E] cursor-pointer"
            />
          </div>

          {/* Direction Angle Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-300 font-medium">Extrusion Direction Angle</span>
              <span className="font-mono text-[#22C55E] font-bold">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={e => setAngle(Number(e.target.value))}
              className="w-full h-1.5 bg-[#052E16] rounded-lg accent-[#22C55E] cursor-pointer"
            />
          </div>

          {/* Extrusion Color */}
          <div className="flex items-center justify-between bg-[#052E16] p-2.5 rounded-xl border border-[#15803D]">
            <span className="text-xs text-neutral-200 font-bold">Extrusion Shadow Color</span>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg border border-[#15803D] cursor-pointer relative overflow-hidden"
                style={{ backgroundColor: color }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs font-mono text-emerald-200 uppercase">{color}</span>
            </div>
          </div>

          {/* Darken Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-300 font-medium">Darken Depth Layers</span>
              <span className="font-mono text-[#22C55E] font-bold">{darken}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={darken}
              onChange={e => setDarken(Number(e.target.value))}
              className="w-full h-1.5 bg-[#052E16] rounded-lg accent-[#22C55E] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
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
            <span>Apply 3D Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};
