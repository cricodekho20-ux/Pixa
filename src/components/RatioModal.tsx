import React, { useState, useMemo } from 'react';
import {
  Check,
  X,
  Smartphone,
  Square,
  Monitor,
  Tv,
  Film,
  Camera,
  Layers,
  Sparkles,
  Sliders,
  Maximize2,
  Lock,
  Unlock,
} from 'lucide-react';
import { Layer, DesignBackground } from '../types/editor';

interface RatioModalProps {
  currentWidth: number;
  currentHeight: number;
  originalWidth?: number;
  originalHeight?: number;
  layers: Layer[];
  background: DesignBackground;
  onApplyRatio: (width: number, height: number, ratioLabel: string) => void;
  onClose: () => void;
}

export interface RatioOption {
  id: string;
  name: string;
  label: string;
  category: 'Standard' | 'Portrait' | 'Landscape' | 'Original' | 'Custom';
  ratioW: number;
  ratioH: number;
  defaultW: number;
  defaultH: number;
  description: string;
}

// Greatest Common Divisor helper
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Calculate human-friendly ratio string from width and height
export function computeRatioString(w: number, h: number): string {
  if (!w || !h || w <= 0 || h <= 0) return 'Custom';
  const roundW = Math.round(w);
  const roundH = Math.round(h);
  const aspect = roundW / roundH;

  const commonRatios = [
    { name: '1:1', val: 1 / 1 },
    { name: '4:5', val: 4 / 5 },
    { name: '9:16', val: 9 / 16 },
    { name: '16:9', val: 16 / 9 },
    { name: '3:4', val: 3 / 4 },
    { name: '4:3', val: 4 / 3 },
    { name: '2:3', val: 2 / 3 },
    { name: '3:2', val: 3 / 2 },
    { name: '21:9', val: 21 / 9 },
    { name: '5:4', val: 5 / 4 },
    { name: '16:10', val: 16 / 10 },
  ];

  for (const c of commonRatios) {
    if (Math.abs(aspect - c.val) < 0.015) {
      return c.name;
    }
  }

  const d = gcd(roundW, roundH);
  const rw = Math.round(roundW / d);
  const rh = Math.round(roundH / d);

  if (rw <= 32 && rh <= 32) {
    return `${rw}:${rh}`;
  }

  return `${aspect.toFixed(2)}:1`;
}

export const RatioModal: React.FC<RatioModalProps> = ({
  currentWidth,
  currentHeight,
  originalWidth = 1080,
  originalHeight = 1080,
  layers,
  background,
  onApplyRatio,
  onClose,
}) => {
  // Built-in Ratio Presets matching exact user specifications:
  // Original, 1:1, 4:5, 9:16, 16:9, 3:4, 4:3, 2:3, 3:2, 21:9, Custom
  const RATIO_OPTIONS: RatioOption[] = useMemo(() => [
    {
      id: 'original',
      name: 'Original',
      label: 'Original — Photo Ratio',
      category: 'Original',
      ratioW: originalWidth,
      ratioH: originalHeight,
      defaultW: originalWidth,
      defaultH: originalHeight,
      description: 'Matches the source photo dimensions',
    },
    {
      id: '1:1',
      name: '1:1',
      label: '1:1 — Square',
      category: 'Standard',
      ratioW: 1,
      ratioH: 1,
      defaultW: 1080,
      defaultH: 1080,
      description: 'Instagram Feed, Square Posts, Profile',
    },
    {
      id: '4:5',
      name: '4:5',
      label: '4:5 — Portrait',
      category: 'Portrait',
      ratioW: 4,
      ratioH: 5,
      defaultW: 1080,
      defaultH: 1350,
      description: 'Instagram Portrait Feed, Social Carousel',
    },
    {
      id: '9:16',
      name: '9:16',
      label: '9:16 — Vertical',
      category: 'Portrait',
      ratioW: 9,
      ratioH: 16,
      defaultW: 1080,
      defaultH: 1920,
      description: 'TikTok, Reels, Stories, Shorts, Status',
    },
    {
      id: '16:9',
      name: '16:9',
      label: '16:9 — Landscape',
      category: 'Landscape',
      ratioW: 16,
      ratioH: 9,
      defaultW: 1920,
      defaultH: 1080,
      description: 'YouTube Thumbnail, Desktop, TV Displays',
    },
    {
      id: '3:4',
      name: '3:4',
      label: '3:4 — Portrait',
      category: 'Portrait',
      ratioW: 3,
      ratioH: 4,
      defaultW: 1080,
      defaultH: 1440,
      description: 'iPad Screen, Classic Portrait Photography',
    },
    {
      id: '4:3',
      name: '4:3',
      label: '4:3 — Landscape',
      category: 'Landscape',
      ratioW: 4,
      ratioH: 3,
      defaultW: 1440,
      defaultH: 1080,
      description: 'Standard Landscape, Tablet Displays',
    },
    {
      id: '2:3',
      name: '2:3',
      label: '2:3 — Portrait',
      category: 'Portrait',
      ratioW: 2,
      ratioH: 3,
      defaultW: 1080,
      defaultH: 1620,
      description: '35mm Film Portrait, Pinterest Graphic',
    },
    {
      id: '3:2',
      name: '3:2',
      label: '3:2 — Landscape',
      category: 'Landscape',
      ratioW: 3,
      ratioH: 2,
      defaultW: 1620,
      defaultH: 1080,
      description: 'DSLR Classic Landscape, Photo Print',
    },
    {
      id: '21:9',
      name: '21:9',
      label: '21:9 — Ultrawide',
      category: 'Landscape',
      ratioW: 21,
      ratioH: 9,
      defaultW: 2560,
      defaultH: 1080,
      description: 'Cinematic Ultrawide, Banners & Headers',
    },
    {
      id: 'custom',
      name: 'Custom',
      label: 'Custom — Custom Ratio',
      category: 'Custom',
      ratioW: currentWidth,
      ratioH: currentHeight,
      defaultW: currentWidth,
      defaultH: currentHeight,
      description: 'Custom Width × Height in pixels',
    },
  ], [originalWidth, originalHeight, currentWidth, currentHeight]);

  // Determine current active preset based on aspect ratio
  const initialCurrentRatio = computeRatioString(currentWidth, currentHeight);
  const matchingOption = RATIO_OPTIONS.find(o => o.id === initialCurrentRatio || o.name === initialCurrentRatio);

  const [selectedRatioId, setSelectedRatioId] = useState<string>(matchingOption ? matchingOption.id : 'custom');
  const [targetWidth, setTargetWidth] = useState<number>(currentWidth);
  const [targetHeight, setTargetHeight] = useState<number>(currentHeight);

  // Custom inputs state
  const [customW, setCustomW] = useState<number>(currentWidth);
  const [customH, setCustomH] = useState<number>(currentHeight);

  // Live calculated ratio string
  const calculatedRatio = useMemo(() => {
    return computeRatioString(targetWidth, targetHeight);
  }, [targetWidth, targetHeight]);

  // Handle selecting preset
  const handleSelectRatio = (opt: RatioOption) => {
    setSelectedRatioId(opt.id);
    if (opt.id === 'original') {
      setTargetWidth(originalWidth);
      setTargetHeight(originalHeight);
      setCustomW(originalWidth);
      setCustomH(originalHeight);
    } else if (opt.id === 'custom') {
      setTargetWidth(customW);
      setTargetHeight(customH);
    } else {
      // Keep base standard dimension
      setTargetWidth(opt.defaultW);
      setTargetHeight(opt.defaultH);
      setCustomW(opt.defaultW);
      setCustomH(opt.defaultH);
    }
  };

  // Handle custom dimensions change
  const handleCustomWidthChange = (val: number) => {
    const w = Math.max(50, Math.min(10000, val || 100));
    setCustomW(w);
    setTargetWidth(w);
    setSelectedRatioId('custom');
  };

  const handleCustomHeightChange = (val: number) => {
    const h = Math.max(50, Math.min(10000, val || 100));
    setCustomH(h);
    setTargetHeight(h);
    setSelectedRatioId('custom');
  };

  const handleApply = () => {
    const finalW = Math.max(100, Math.round(targetWidth));
    const finalH = Math.max(100, Math.round(targetHeight));
    const label = RATIO_OPTIONS.find(o => o.id === selectedRatioId)?.label || `${calculatedRatio} — Custom`;
    onApplyRatio(finalW, finalH, label);
    onClose();
  };

  // Compute miniature preview layout
  const previewMaxDim = 150;
  const targetAspect = targetWidth / targetHeight;
  let previewBoxW = previewMaxDim;
  let previewBoxH = previewMaxDim;
  if (targetAspect > 1) {
    previewBoxW = previewMaxDim;
    previewBoxH = Math.max(40, Math.round(previewMaxDim / targetAspect));
  } else {
    previewBoxH = previewMaxDim;
    previewBoxW = Math.max(40, Math.round(previewMaxDim * targetAspect));
  }

  // Scale of existing layers inside mini preview
  const miniScale = previewBoxW / targetWidth;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white animate-in fade-in duration-150">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between bg-[#052E16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black shadow-md">
              <Maximize2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">RATIO SELECT</h3>
                <span className="bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold">
                  Design Shape
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Adjust design proportions without stretching photos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#0B3D20] text-neutral-300 hover:text-white hover:bg-[#15803D] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Live Preview Card */}
          <div className="bg-[#052E16] border border-[#15803D] rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-4">
            {/* Visual Canvas Thumbnail Preview */}
            <div className="flex items-center justify-center w-44 h-44 bg-black/40 rounded-xl border border-emerald-900/60 p-2 shrink-0 relative overflow-hidden">
              <div
                className="relative border-2 border-[#22C55E] rounded shadow-lg overflow-hidden transition-all duration-200 flex items-center justify-center"
                style={{
                  width: `${previewBoxW}px`,
                  height: `${previewBoxH}px`,
                  backgroundColor: background.type === 'color' ? background.color : '#111827',
                }}
              >
                {/* Independent Photo & Layer Shadows in mini preview */}
                {layers.slice(0, 5).map((l, idx) => {
                  const left = Math.max(0, l.transform.x * miniScale);
                  const top = Math.max(0, l.transform.y * miniScale);
                  const w = Math.max(10, l.transform.width * (l.transform.scaleX || 1) * miniScale);
                  const h = Math.max(10, l.transform.height * (l.transform.scaleY || 1) * miniScale);
                  return (
                    <div
                      key={l.id}
                      className="absolute border border-[#22C55E]/40 bg-[#16A34A]/25 rounded-xs flex items-center justify-center overflow-hidden"
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${w}px`,
                        height: `${h}px`,
                        transform: `rotate(${l.transform.rotation || 0}deg)`,
                      }}
                    >
                      <span className="text-[7px] font-mono text-emerald-200 truncate px-0.5">
                        {l.name}
                      </span>
                    </div>
                  );
                })}

                {/* Aspect ratio watermark tag in center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[11px] font-black font-mono text-white/40 bg-black/30 px-1.5 py-0.5 rounded">
                    {calculatedRatio}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Summary Description */}
            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Live Preview:
                </span>
                <span className="text-xs font-black text-[#22C55E] bg-[#16A34A]/20 px-2 py-0.5 rounded-full border border-[#22C55E]/30">
                  {RATIO_OPTIONS.find(o => o.id === selectedRatioId)?.label || `${calculatedRatio} — Custom`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#0B3D20] p-2 rounded-xl border border-[#15803D]/60">
                  <span className="text-[10px] text-emerald-300/80 block">Ratio (Shape)</span>
                  <span className="font-extrabold text-white font-mono text-sm">{calculatedRatio}</span>
                </div>
                <div className="bg-[#0B3D20] p-2 rounded-xl border border-[#15803D]/60">
                  <span className="text-[10px] text-emerald-300/80 block">Size (Dimensions)</span>
                  <span className="font-extrabold text-white font-mono text-xs">
                    {targetWidth} × {targetHeight} px
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-200/80 leading-relaxed bg-[#0B3D20]/50 p-2 rounded-xl border border-[#15803D]/40">
                <span className="text-[#22C55E] font-bold">Independent Layers:</span> Changing ratio modifies the design outline without distorting, stretching, or scaling individual photos.
              </div>
            </div>
          </div>

          {/* Ratio Presets Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Select Ratio</span>
              </span>
              <span className="text-[10px] text-emerald-300/80">Tap to preview shape</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RATIO_OPTIONS.map(opt => {
                const isSelected = selectedRatioId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectRatio(opt)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between group active:scale-98 ${
                      isSelected
                        ? 'bg-[#16A34A] border-[#22C55E] text-white shadow-md shadow-[#16A34A]/30'
                        : 'bg-[#052E16] border-[#15803D] hover:border-[#22C55E] text-neutral-200 hover:bg-[#0B3D20]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-xs tracking-tight">{opt.name}</span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-white text-[#052E16] flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono text-emerald-300/70 group-hover:text-emerald-200">
                          {opt.category}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-medium text-emerald-100/90 mt-1 truncate">
                      {opt.label}
                    </div>

                    <div className="text-[10px] text-emerald-200/70 mt-0.5 truncate">
                      {opt.id === 'original'
                        ? `${originalWidth} × ${originalHeight} px`
                        : opt.id === 'custom'
                        ? 'Manual dimensions'
                        : `${opt.defaultW} × ${opt.defaultH} px`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Ratio Entry Section */}
          <div className="bg-[#052E16] border border-[#15803D] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">CUSTOM RATIO & SIZE</span>
                <span className="text-[10px] text-emerald-200/70">
                  Enter exact pixel dimensions to automatically calculate ratio
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0B3D20] px-2.5 py-1 rounded-full border border-[#15803D]">
                <span className="text-[10px] text-emerald-300">Calculated:</span>
                <span className="text-xs font-mono font-black text-[#22C55E]">{calculatedRatio}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-emerald-300 uppercase font-bold block mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  value={customW}
                  onChange={e => handleCustomWidthChange(Number(e.target.value))}
                  className="w-full bg-[#0B3D20] text-sm font-mono text-white px-3 py-2 rounded-xl border border-[#15803D] focus:outline-none focus:border-[#22C55E] text-center"
                  placeholder="1080"
                />
              </div>

              <div>
                <label className="text-[10px] text-emerald-300 uppercase font-bold block mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  value={customH}
                  onChange={e => handleCustomHeightChange(Number(e.target.value))}
                  className="w-full bg-[#0B3D20] text-sm font-mono text-white px-3 py-2 rounded-xl border border-[#15803D] focus:outline-none focus:border-[#22C55E] text-center"
                  placeholder="1920"
                />
              </div>
            </div>

            <div className="text-[10px] text-emerald-300/80 flex items-center justify-between pt-1">
              <span>Example: 1080 × 1920 → Ratio: 9:16</span>
              <button
                type="button"
                onClick={() => {
                  const temp = customW;
                  handleCustomWidthChange(customH);
                  handleCustomHeightChange(temp);
                }}
                className="text-[#22C55E] hover:underline text-[10px] font-bold"
              >
                Swap Dimensions ⇄
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-[#15803D] flex items-center justify-between bg-[#052E16]">
          <div className="text-left">
            <div className="text-[10px] text-emerald-300">Selected Output:</div>
            <div className="text-xs font-black text-white font-mono">
              {targetWidth} × {targetHeight} px ({calculatedRatio})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-300 hover:text-white rounded-xl hover:bg-[#15803D] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#22C55E] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-[#16A34A]/30 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>APPLY RATIO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
