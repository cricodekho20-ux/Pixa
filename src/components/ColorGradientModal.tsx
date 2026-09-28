import React, { useState } from 'react';
import { GradientFill } from '../types/editor';
import { Palette, Plus, Trash2, Check, X, RotateCcw } from 'lucide-react';

interface ColorGradientModalProps {
  initialFillType: 'color' | 'linear-gradient' | 'radial-gradient';
  initialColor: string;
  initialGradient?: GradientFill;
  onApply: (data: { fillType: 'color' | 'linear-gradient' | 'radial-gradient'; color: string; gradient?: GradientFill }) => void;
  onClose: () => void;
}

const QUICK_COLORS = [
  '#FFFFFF', '#000000', '#FACC15', '#EF4444', '#3B82F6', '#10B981',
  '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#E2E8F0', '#64748B',
];

const PRESET_GRADIENTS: GradientFill[] = [
  {
    type: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#FEF08A' },
      { offset: 50, color: '#FACC15' },
      { offset: 100, color: '#D97706' },
    ],
  },
  {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#EC4899' },
      { offset: 100, color: '#8B5CF6' },
    ],
  },
  {
    type: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#06B6D4' },
      { offset: 100, color: '#3B82F6' },
    ],
  },
  {
    type: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#10B981' },
      { offset: 100, color: '#047857' },
    ],
  },
  {
    type: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#EF4444' },
      { offset: 100, color: '#7F1D1D' },
    ],
  },
  {
    type: 'linear',
    angle: 90,
    stops: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 100, color: '#64748B' },
    ],
  },
];

export const ColorGradientModal: React.FC<ColorGradientModalProps> = ({
  initialFillType,
  initialColor,
  initialGradient,
  onApply,
  onClose,
}) => {
  const [mode, setMode] = useState<'solid' | 'gradient'>(
    initialFillType === 'color' ? 'solid' : 'gradient'
  );
  const [solidColor, setSolidColor] = useState(initialColor || '#FFFFFF');
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>(
    initialGradient?.type || 'linear'
  );
  const [angle, setAngle] = useState(initialGradient?.angle ?? 90);
  const [stops, setStops] = useState<{ offset: number; color: string }[]>(
    initialGradient?.stops || [
      { offset: 0, color: '#FEF08A' },
      { offset: 100, color: '#EA580C' },
    ]
  );
  const [selectedStopIdx, setSelectedStopIdx] = useState(0);

  const handleAddStop = () => {
    if (stops.length >= 6) return;
    const newOffset = Math.round(
      (stops[stops.length - 1].offset + (stops[stops.length - 2]?.offset || 0)) / 2
    );
    const newStops = [...stops, { offset: newOffset, color: '#3B82F6' }].sort(
      (a, b) => a.offset - b.offset
    );
    setStops(newStops);
    setSelectedStopIdx(newStops.findIndex(s => s.offset === newOffset));
  };

  const handleRemoveStop = (idx: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== idx));
    setSelectedStopIdx(0);
  };

  const updateStopColor = (color: string) => {
    setStops(prev =>
      prev.map((s, i) => (i === selectedStopIdx ? { ...s, color } : s))
    );
  };

  const updateStopOffset = (offset: number) => {
    setStops(prev =>
      prev
        .map((s, i) => (i === selectedStopIdx ? { ...s, offset } : s))
        .sort((a, b) => a.offset - b.offset)
    );
  };

  const cssGradientString =
    gradientType === 'linear'
      ? `linear-gradient(${angle}deg, ${stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`
      : `radial-gradient(circle, ${stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`;

  const handleApply = () => {
    if (mode === 'solid') {
      onApply({ fillType: 'color', color: solidColor });
    } else {
      onApply({
        fillType: gradientType === 'linear' ? 'linear-gradient' : 'radial-gradient',
        color: stops[0]?.color || solidColor,
        gradient: {
          type: gradientType,
          angle,
          stops,
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#22C55E]" />
            <h2 className="text-sm font-extrabold text-white">Color & Gradient Studio</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#052E16] hover:bg-[#15803D] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-[#052E16] mx-4 mt-3 rounded-xl border border-[#15803D]">
          <button
            onClick={() => setMode('solid')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === 'solid' ? 'bg-[#16A34A] text-white shadow-sm' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Solid Color
          </button>
          <button
            onClick={() => setMode('gradient')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === 'gradient' ? 'bg-[#16A34A] text-white shadow-sm' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Gradient
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-4">
          <div
            className="h-20 rounded-xl border border-neutral-700/80 shadow-inner flex items-center justify-center font-bold text-lg"
            style={{
              background: mode === 'solid' ? solidColor : cssGradientString,
              color: '#FFFFFF',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            Preview Style
          </div>
        </div>

        {/* Body Controls */}
        <div className="px-4 pb-4 overflow-y-auto max-h-[45vh] space-y-4">
          {mode === 'solid' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">Custom Color</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-neutral-600 relative overflow-hidden cursor-pointer"
                    style={{ backgroundColor: solidColor }}
                  >
                    <input
                      type="color"
                      value={solidColor}
                      onChange={e => setSolidColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={solidColor}
                    onChange={e => setSolidColor(e.target.value)}
                    className="w-24 bg-neutral-800 text-xs font-mono uppercase px-2 py-1.5 rounded-lg border border-neutral-700 text-center text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-neutral-400 block mb-2">Palette Presets</span>
                <div className="grid grid-cols-6 gap-2">
                  {QUICK_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSolidColor(c)}
                      className={`h-9 rounded-xl border transition-transform ${
                        solidColor === c ? 'border-white scale-110 shadow-lg ring-2 ring-amber-400' : 'border-neutral-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Linear vs Radial + Angle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-lg">
                  <button
                    onClick={() => setGradientType('linear')}
                    className={`px-3 py-1 text-xs rounded-md ${
                      gradientType === 'linear' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    Linear
                  </button>
                  <button
                    onClick={() => setGradientType('radial')}
                    className={`px-3 py-1 text-xs rounded-md ${
                      gradientType === 'radial' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    Radial
                  </button>
                </div>

                {gradientType === 'linear' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Angle</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={angle}
                      onChange={e => setAngle(Number(e.target.value))}
                      className="w-20 h-1.5 bg-neutral-800 rounded-lg accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-neutral-300 w-8">{angle}°</span>
                  </div>
                )}
              </div>

              {/* Gradient Color Stops Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-300">Color Stops ({stops.length})</span>
                  <button
                    onClick={handleAddStop}
                    disabled={stops.length >= 6}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Stop
                  </button>
                </div>

                <div className="flex items-center gap-2 p-2 bg-neutral-800/80 rounded-xl border border-neutral-700/60 overflow-x-auto">
                  {stops.map((stop, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedStopIdx(idx)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer shrink-0 transition-all ${
                        selectedStopIdx === idx
                          ? 'bg-neutral-900 border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-neutral-800 border-neutral-700'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-neutral-500"
                        style={{ backgroundColor: stop.color }}
                      />
                      <span className="text-xs font-mono text-neutral-200">{stop.offset}%</span>
                      {stops.length > 2 && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveStop(idx);
                          }}
                          className="text-neutral-500 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Selected Stop */}
              {stops[selectedStopIdx] && (
                <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300">Stop Color</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg border border-neutral-600 relative overflow-hidden cursor-pointer"
                        style={{ backgroundColor: stops[selectedStopIdx].color }}
                      >
                        <input
                          type="color"
                          value={stops[selectedStopIdx].color}
                          onChange={e => updateStopColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={stops[selectedStopIdx].color}
                        onChange={e => updateStopColor(e.target.value)}
                        className="w-20 bg-neutral-800 text-xs font-mono uppercase px-2 py-1 rounded border border-neutral-700 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">Position</span>
                      <span className="font-mono text-neutral-300">{stops[selectedStopIdx].offset}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stops[selectedStopIdx].offset}
                      onChange={e => updateStopOffset(Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-700 rounded-lg accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Gradient Presets */}
              <div>
                <span className="text-xs font-semibold text-neutral-400 block mb-2">Gradient Presets</span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_GRADIENTS.map((g, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setGradientType(g.type);
                        setAngle(g.angle);
                        setStops([...g.stops]);
                        setSelectedStopIdx(0);
                      }}
                      className="h-9 rounded-xl border border-neutral-700 hover:border-neutral-500 shadow-sm transition-transform active:scale-95"
                      style={{
                        background: `linear-gradient(${g.angle}deg, ${g.stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
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
            <span>Apply Color</span>
          </button>
        </div>
      </div>
    </div>
  );
};
