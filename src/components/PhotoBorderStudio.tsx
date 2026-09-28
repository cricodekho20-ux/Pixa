import React, { useState } from 'react';
import { ImageLayer, PhotoBorderConfig } from '../types/editor';
import {
  Frame,
  Check,
  X,
  Palette,
  RotateCcw,
  Sparkles,
  Layers,
  Square,
  Circle,
} from 'lucide-react';

interface PhotoBorderStudioProps {
  layer: ImageLayer;
  onApplyBorder: (borderConfig: PhotoBorderConfig) => void;
  onClose: () => void;
}

export const DEFAULT_PHOTO_BORDER: PhotoBorderConfig = {
  enabled: true,
  color: '#22C55E',
  width: 14,
  opacity: 100,
  style: 'solid',
  radius: 20,
  padding: 0,
  shadow: {
    enabled: true,
    color: '#000000',
    blur: 24,
    offsetX: 0,
    offsetY: 8,
    opacity: 65,
  },
};

const BORDER_PRESET_COLORS = [
  '#22C55E',
  '#16A34A',
  '#FFFFFF',
  '#000000',
  '#FACC15',
  '#EF4444',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#E2E8F0',
  '#B45309',
];

const BORDER_STYLES = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' },
  { id: 'double', label: 'Double' },
  { id: 'groove', label: 'Groove' },
  { id: 'inset', label: 'Inset' },
] as const;

export const PhotoBorderStudio: React.FC<PhotoBorderStudioProps> = ({
  layer,
  onApplyBorder,
  onClose,
}) => {
  const [config, setConfig] = useState<PhotoBorderConfig>(() => {
    if (layer.borderConfig) {
      return { ...layer.borderConfig };
    }
    return {
      ...DEFAULT_PHOTO_BORDER,
      width: layer.border?.width || DEFAULT_PHOTO_BORDER.width,
      color: layer.border?.color || DEFAULT_PHOTO_BORDER.color,
      radius: layer.borderRadius ?? DEFAULT_PHOTO_BORDER.radius,
    };
  });

  const [activeTab, setActiveTab] = useState<'main' | 'style' | 'shadow'>('main');

  const update = (patch: Partial<PhotoBorderConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  };

  const updateShadow = (patch: Partial<PhotoBorderConfig['shadow']>) => {
    setConfig(prev => ({ ...prev, shadow: { ...prev.shadow, ...patch } }));
  };

  const handleApply = () => {
    onApplyBorder(config);
    onClose();
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_PHOTO_BORDER });
  };

  // Convert hex color + opacity to rgba
  const getBorderRGBA = () => {
    let cleanHex = config.color.replace('#', '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
    const num = parseInt(cleanHex, 16) || 0;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${config.opacity / 100})`;
  };

  const getShadowStyle = () => {
    if (!config.shadow.enabled || !config.enabled) return 'none';
    const s = config.shadow;
    return `${s.offsetX}px ${s.offsetY}px ${s.blur}px rgba(0,0,0,${s.opacity / 100})`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200 text-white">
      {/* Top Studio Header (GREEN THEME) */}
      <header className="h-14 bg-[#0B3D20] border-b border-[#15803D] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-bold">
            <Frame className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white">Photo Border Studio</h2>
            <p className="text-[10px] text-emerald-200/70 truncate max-w-[180px]">{layer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 text-neutral-300 hover:text-white rounded-xl hover:bg-[#15803D] transition-colors"
            title="Reset Border"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-neutral-300 hover:text-white rounded-xl hover:bg-[#15803D] transition-colors"
            title="Close without saving"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-[#22C55E] text-white rounded-xl font-black text-xs shadow-md shadow-[#16A34A]/30 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Apply</span>
          </button>
        </div>
      </header>

      {/* Center Live Interactive Preview */}
      <div className="flex-1 w-full overflow-hidden flex items-center justify-center p-4 sm:p-8 bg-[#052E16]/80 relative">
        <div
          className="relative max-w-full max-h-full transition-all duration-100 flex items-center justify-center"
          style={{
            padding: `${config.padding}px`,
            borderRadius: `${config.radius}px`,
            borderWidth: config.enabled ? `${config.width}px` : '0px',
            borderColor: config.enabled ? getBorderRGBA() : 'transparent',
            borderStyle: config.style,
            boxShadow: getShadowStyle(),
            backgroundColor: config.enabled && config.padding > 0 ? getBorderRGBA() : 'transparent',
          }}
        >
          <img
            src={layer.src}
            alt={layer.name}
            className="max-h-[46vh] sm:max-h-[52vh] max-w-[85vw] object-contain transition-all"
            style={{
              borderRadius: `${Math.max(0, config.radius - config.width)}px`,
            }}
          />

          {!config.enabled && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-[#052E16] text-[#22C55E] border border-[#15803D] px-3 py-1 rounded-full text-xs font-bold">
                Border is OFF
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Surface (GREEN THEME) */}
      <div className="bg-[#0B3D20] border-t border-[#15803D] p-4 shrink-0 max-w-2xl mx-auto w-full space-y-4">
        {/* Master ON/OFF Switch & Tabs */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#15803D]">
          {/* Master Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => update({ enabled: !config.enabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                config.enabled ? 'bg-[#16A34A]' : 'bg-[#052E16] border border-[#15803D]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  config.enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-white">
              Border {config.enabled ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center bg-[#052E16] p-0.5 rounded-xl border border-[#15803D]">
            {(
              [
                { id: 'main', label: 'Color & Width' },
                { id: 'style', label: 'Style & Radius' },
                { id: 'shadow', label: 'Shadow' },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#16A34A] text-white shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Color & Thickness & Opacity */}
        {activeTab === 'main' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Color Swatches + Custom Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold">Border Color</span>
                <span className="font-mono text-[10px] text-[#22C55E] bg-[#052E16] px-1.5 py-0.5 rounded border border-[#15803D]">
                  {config.color}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {/* Native Color Picker */}
                <label className="relative w-8 h-8 rounded-full border-2 border-[#15803D] hover:border-[#22C55E] cursor-pointer shrink-0 flex items-center justify-center bg-[#052E16] shadow-sm">
                  <Palette className="w-4 h-4 text-emerald-300" />
                  <input
                    type="color"
                    value={config.color}
                    onChange={e => update({ color: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>

                {BORDER_PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => update({ color: c })}
                    className={`w-7 h-7 rounded-full shrink-0 border transition-all ${
                      config.color.toLowerCase() === c.toLowerCase()
                        ? 'border-white scale-110 ring-2 ring-[#22C55E] shadow-md'
                        : 'border-[#15803D]'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Thickness / Width Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold">Thickness / Width</span>
                <span className="font-mono text-xs text-[#22C55E] font-bold">{config.width}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={config.width}
                onChange={e => update({ width: Number(e.target.value) })}
                className="w-full accent-[#22C55E] h-1.5 bg-[#052E16] rounded cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold">Opacity</span>
                <span className="font-mono text-xs text-[#22C55E] font-bold">{config.opacity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={config.opacity}
                onChange={e => update({ opacity: Number(e.target.value) })}
                className="w-full accent-[#22C55E] h-1.5 bg-[#052E16] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Style & Corner Radius */}
        {activeTab === 'style' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Style Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-neutral-300">Border Style</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BORDER_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => update({ style: style.id })}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      config.style === style.id
                        ? 'bg-[#16A34A] border-[#22C55E] text-white font-bold'
                        : 'bg-[#052E16] border-[#15803D] hover:border-[#22C55E] text-neutral-300'
                    }`}
                  >
                    <span className="text-xs capitalize">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold">Corner Radius</span>
                <span className="font-mono text-xs text-[#22C55E] font-bold">{config.radius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={config.radius}
                onChange={e => update({ radius: Number(e.target.value) })}
                className="w-full accent-[#22C55E] h-1.5 bg-[#052E16] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Shadow */}
        {activeTab === 'shadow' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Shadow ON/OFF */}
            <div className="flex items-center justify-between bg-[#052E16] p-2.5 rounded-xl border border-[#15803D]">
              <span className="text-xs font-bold text-white">Cast Drop Shadow</span>
              <button
                onClick={() => updateShadow({ enabled: !config.shadow.enabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  config.shadow.enabled ? 'bg-[#16A34A]' : 'bg-[#0B3D20] border border-[#15803D]'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    config.shadow.enabled ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {config.shadow.enabled && (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span className="font-semibold">Shadow Blur</span>
                    <span className="font-mono text-xs text-[#22C55E] font-bold">{config.shadow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={config.shadow.blur}
                    onChange={e => updateShadow({ blur: Number(e.target.value) })}
                    className="w-full accent-[#22C55E] h-1.5 bg-[#052E16] rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span className="font-semibold">Shadow Intensity / Opacity</span>
                    <span className="font-mono text-xs text-[#22C55E] font-bold">{config.shadow.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={config.shadow.opacity}
                    onChange={e => updateShadow({ opacity: Number(e.target.value) })}
                    className="w-full accent-[#22C55E] h-1.5 bg-[#052E16] rounded cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
