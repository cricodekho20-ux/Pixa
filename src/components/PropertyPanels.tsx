import React, { useRef } from 'react';
import {
  Layer,
  TextLayer,
  ImageLayer,
  ShapeLayer,
  StickerLayer,
  DrawingLayer,
  DesignBackground,
} from '../types/editor';
import {
  Type,
  Image as ImageIcon,
  Palette,
  Box,
  Sliders,
  Crop,
  Layers,
  Sparkles,
  Scissors,
  Move,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  RefreshCw,
  Frame,
  Lock,
  Unlock,
} from 'lucide-react';

interface PropertyPanelsProps {
  selectedLayer: Layer | null;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onUpdateLayerTransform?: (id: string, updates: Partial<Layer['transform']>) => void;
  onOpenFontModal: () => void;
  onOpenColorModal: () => void;
  onOpenThreeDModal: () => void;
  onOpenEffectsModal: () => void;
  onOpenChromaModal: () => void;
  onOpenPhotoBorder: () => void;
  onStartPerspective: () => void;
  onReplaceImage: (file: File) => void;
  onOpenCrop?: () => void;
  onOpenResize?: () => void;
  // Background controls
  background: DesignBackground;
  onChangeBackground: (bg: DesignBackground) => void;
}

export const PropertyPanels: React.FC<PropertyPanelsProps> = ({
  selectedLayer,
  onUpdateLayer,
  onUpdateLayerTransform,
  onOpenFontModal,
  onOpenColorModal,
  onOpenThreeDModal,
  onOpenEffectsModal,
  onOpenChromaModal,
  onOpenPhotoBorder,
  onStartPerspective,
  onReplaceImage,
  onOpenCrop,
  onOpenResize,
  background,
  onChangeBackground,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!selectedLayer) {
    // Design Background Inspector (GREEN THEME)
    return (
      <div className="p-3 bg-[#0B3D20] border-t border-[#15803D] text-xs text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Design Background</span>
          </span>
          <span className="text-[10px] text-emerald-200/70">Tap any photo or text to edit it</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Transparent */}
          <button
            onClick={() => onChangeBackground({ type: 'transparent', color: 'transparent' })}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 ${
              background.type === 'transparent'
                ? 'bg-[#16A34A] border-[#22C55E] text-white font-bold'
                : 'bg-[#052E16] border-[#15803D] text-emerald-100 hover:bg-[#15803D]'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-checkerboard border border-emerald-400" />
            Transparent
          </button>

          {/* Solid Colors */}
          {['#052E16', '#0B3D20', '#000000', '#0F172A', '#1E1B4B', '#FFFFFF'].map(c => (
            <button
              key={c}
              onClick={() => onChangeBackground({ type: 'color', color: c })}
              className={`w-7 h-7 rounded-full border shrink-0 transition-transform ${
                background.type === 'color' && background.color === c
                  ? 'border-white scale-110 ring-2 ring-[#22C55E] shadow-md'
                  : 'border-[#15803D]'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}

          {/* Gradients */}
          <button
            onClick={() =>
              onChangeBackground({
                type: 'gradient',
                color: '#052E16',
                gradient: {
                  type: 'linear',
                  angle: 135,
                  stops: [
                    { offset: 0, color: '#052E16' },
                    { offset: 100, color: '#16A34A' },
                  ],
                },
              })
            }
            className={`px-3 py-1.5 rounded-xl border shrink-0 font-medium ${
              background.type === 'gradient'
                ? 'border-[#22C55E] bg-[#16A34A] text-white font-bold'
                : 'border-[#15803D] text-white bg-[#052E16] hover:bg-[#15803D]'
            }`}
          >
            Green Glow
          </button>

          <button
            onClick={() =>
              onChangeBackground({
                type: 'gradient',
                color: '#052E16',
                gradient: {
                  type: 'linear',
                  angle: 135,
                  stops: [
                    { offset: 0, color: '#07180D' },
                    { offset: 100, color: '#0B3D20' },
                  ],
                },
              })
            }
            className={`px-3 py-1.5 rounded-xl border shrink-0 font-medium ${
              background.type === 'gradient'
                ? 'border-[#22C55E] bg-[#16A34A] text-white font-bold'
                : 'border-[#15803D] text-white bg-[#052E16] hover:bg-[#15803D]'
            }`}
          >
            Dark Forest
          </button>
        </div>
      </div>
    );
  }

  // Hidden replace image file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onReplaceImage(file);
    }
  };

  return (
    <div className="bg-[#0B3D20] border-t border-[#15803D] p-2 sm:p-3 text-xs overflow-x-auto no-scrollbar select-none text-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Layer-specific property controls */}
      {selectedLayer.type === 'text' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Edit Text content */}
          <button
            onClick={() => {
              const newText = window.prompt('Edit Text:', selectedLayer.text);
              if (newText !== null) {
                onUpdateLayer(selectedLayer.id, { text: newText });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white rounded-xl border border-[#15803D] shrink-0 font-bold active:scale-95 transition-colors"
          >
            <Type className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Edit Text</span>
          </button>

          {/* Font Picker */}
          <button
            onClick={onOpenFontModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white rounded-xl border border-[#15803D] shrink-0 font-medium active:scale-95 transition-colors"
          >
            <span className="truncate max-w-[80px]">Font</span>
            <span className="text-[10px] text-[#22C55E] font-mono font-bold">Aa</span>
          </button>

          {/* Color & Gradient */}
          <button
            onClick={onOpenColorModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white rounded-xl border border-[#15803D] shrink-0 font-medium active:scale-95 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span>Color / Gradient</span>
          </button>

          {/* 3D Text Studio */}
          <button
            onClick={onOpenThreeDModal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border shrink-0 font-semibold active:scale-95 transition-colors ${
              selectedLayer.threeD?.enabled
                ? 'bg-[#16A34A] text-white border-[#22C55E]'
                : 'bg-[#052E16] text-white border-[#15803D] hover:bg-[#15803D]'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>3D Text</span>
          </button>

          {/* Font Size slider */}
          <div className="flex items-center gap-2 bg-[#052E16] px-3 py-1.5 rounded-xl border border-[#15803D] shrink-0">
            <span className="text-[10px] text-emerald-200/80 font-bold">SIZE</span>
            <input
              type="range"
              min="14"
              max="200"
              value={selectedLayer.fontSize}
              onChange={e => onUpdateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
              className="w-20 accent-[#22C55E] h-1.5 bg-[#0B3D20] rounded cursor-pointer"
            />
            <span className="text-xs font-mono text-white w-6">{selectedLayer.fontSize}</span>
          </div>

          {/* Lock / Unlock Toggle */}
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { locked: !selectedLayer.locked })}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl border shrink-0 font-medium active:scale-95 transition-colors ${
              selectedLayer.locked
                ? 'bg-emerald-600 text-white border-[#22C55E]'
                : 'bg-[#052E16] text-neutral-200 border-[#15803D] hover:bg-[#15803D]'
            }`}
          >
            {selectedLayer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{selectedLayer.locked ? 'Locked' : 'Lock'}</span>
          </button>

          {/* B / I / U formatting */}
          <div className="flex items-center bg-[#052E16] p-0.5 rounded-xl border border-[#15803D] shrink-0">
            <button
              onClick={() =>
                onUpdateLayer(selectedLayer.id, {
                  fontWeight: selectedLayer.fontWeight === '900' ? '400' : '900',
                })
              }
              className={`p-1.5 rounded-lg ${
                selectedLayer.fontWeight === '900' ? 'bg-[#15803D] text-[#22C55E]' : 'text-neutral-300'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onUpdateLayer(selectedLayer.id, {
                  fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`p-1.5 rounded-lg ${
                selectedLayer.fontStyle === 'italic' ? 'bg-[#15803D] text-[#22C55E]' : 'text-neutral-300'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onUpdateLayer(selectedLayer.id, { underline: !selectedLayer.underline })
              }
              className={`p-1.5 rounded-lg ${
                selectedLayer.underline ? 'bg-[#15803D] text-[#22C55E]' : 'text-neutral-300'
              }`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center bg-[#052E16] p-0.5 rounded-xl border border-[#15803D] shrink-0">
            {(['left', 'center', 'right'] as const).map(align => (
              <button
                key={align}
                onClick={() => onUpdateLayer(selectedLayer.id, { textAlign: align })}
                className={`p-1.5 rounded-lg ${
                  selectedLayer.textAlign === align ? 'bg-[#15803D] text-[#22C55E]' : 'text-neutral-300'
                }`}
              >
                {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-2 bg-[#052E16] px-3 py-1.5 rounded-xl border border-[#15803D] shrink-0">
            <span className="text-[10px] text-emerald-200/80 font-bold">OPACITY</span>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedLayer.opacity ?? 100}
              onChange={e => onUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
              className="w-16 accent-[#22C55E] h-1.5 bg-[#0B3D20] rounded cursor-pointer"
            />
            <span className="text-xs font-mono text-white">{selectedLayer.opacity ?? 100}%</span>
          </div>
        </div>
      )}

      {selectedLayer.type === 'image' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* PHOTO BORDER BUTTON (Requirement 4, 5, 6, 7) */}
          <button
            onClick={onOpenPhotoBorder}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold shrink-0 active:scale-95 transition-all shadow-md ${
              selectedLayer.borderConfig?.enabled
                ? 'bg-[#16A34A] text-white ring-2 ring-[#22C55E]'
                : 'bg-[#052E16] hover:bg-[#15803D] text-[#22C55E] border border-[#15803D]'
            }`}
          >
            <Frame className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Photo Border</span>
            {selectedLayer.borderConfig?.enabled && (
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">
                {selectedLayer.borderConfig.width}px
              </span>
            )}
          </button>

          {/* CROP BUTTON */}
          {onOpenCrop && (
            <button
              onClick={onOpenCrop}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white rounded-xl border border-[#15803D] shrink-0 font-medium active:scale-95"
            >
              <Crop className="w-3.5 h-3.5 text-emerald-400" />
              <span>Crop</span>
            </button>
          )}

          {/* RESIZE BUTTON */}
          {onOpenResize && (
            <button
              onClick={onOpenResize}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white rounded-xl border border-[#15803D] shrink-0 font-medium active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resize</span>
            </button>
          )}

          {/* LOCK / UNLOCK TOGGLE (Requirement 8) */}
          <button
            onClick={() => onUpdateLayer(selectedLayer.id, { locked: !selectedLayer.locked })}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl border shrink-0 font-bold active:scale-95 transition-colors ${
              selectedLayer.locked
                ? 'bg-emerald-600 text-white border-[#22C55E]'
                : 'bg-[#052E16] text-neutral-200 border-[#15803D] hover:bg-[#15803D]'
            }`}
          >
            {selectedLayer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{selectedLayer.locked ? 'Locked' : 'Lock'}</span>
          </button>

          {/* REPLACE IMAGE BUTTON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white font-semibold rounded-xl border border-[#15803D] shrink-0 active:scale-95 transition-transform"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5] text-[#22C55E]" />
            <span>Replace Image</span>
          </button>

          {/* Background Removal / Chroma Key */}
          <button
            onClick={onOpenChromaModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white rounded-xl border border-[#15803D] shrink-0 font-medium active:scale-95"
          >
            <Scissors className="w-3.5 h-3.5 text-emerald-400" />
            <span>Remove BG / Chroma</span>
          </button>

          {/* 4-Point Perspective Warp */}
          <button
            onClick={onStartPerspective}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white rounded-xl border border-[#15803D] shrink-0 font-medium active:scale-95"
          >
            <Move className="w-3.5 h-3.5 text-emerald-400" />
            <span>Perspective</span>
          </button>

          {/* Filter Effects */}
          <button
            onClick={onOpenEffectsModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#052E16] hover:bg-[#15803D] text-white rounded-xl border border-[#15803D] shrink-0 font-medium active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Effects</span>
          </button>

          {/* Flip Horizontal / Vertical */}
          <div className="flex items-center bg-[#052E16] p-0.5 rounded-xl border border-[#15803D] shrink-0">
            <button
              onClick={() => onUpdateLayer(selectedLayer.id, { flipX: !selectedLayer.flipX })}
              className={`p-1.5 rounded-lg ${selectedLayer.flipX ? 'bg-[#15803D] text-[#22C55E]' : 'text-neutral-300'}`}
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateLayer(selectedLayer.id, { flipY: !selectedLayer.flipY })}
              className={`p-1.5 rounded-lg ${selectedLayer.flipY ? 'bg-[#15803D] text-[#22C55E]' : 'text-neutral-300'}`}
              title="Flip Vertical"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Corner Radius */}
          <div className="flex items-center gap-2 bg-[#052E16] px-3 py-1.5 rounded-xl border border-[#15803D] shrink-0">
            <span className="text-[10px] text-emerald-200/80 font-bold">RADIUS</span>
            <input
              type="range"
              min="0"
              max="120"
              value={selectedLayer.borderRadius ?? 0}
              onChange={e => onUpdateLayer(selectedLayer.id, { borderRadius: Number(e.target.value) })}
              className="w-16 accent-[#22C55E] h-1.5 bg-[#0B3D20] rounded cursor-pointer"
            />
            <span className="text-xs font-mono text-white">{selectedLayer.borderRadius ?? 0}px</span>
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-2 bg-[#052E16] px-3 py-1.5 rounded-xl border border-[#15803D] shrink-0">
            <span className="text-[10px] text-emerald-200/80 font-bold">OPACITY</span>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedLayer.opacity ?? 100}
              onChange={e => onUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
              className="w-16 accent-[#22C55E] h-1.5 bg-[#0B3D20] rounded cursor-pointer"
            />
            <span className="text-xs font-mono text-white">{selectedLayer.opacity ?? 100}%</span>
          </div>

          {/* Scale Slider (Independent Object Transform) */}
          {onUpdateLayerTransform && (
            <div className="flex items-center gap-2 bg-[#052E16] px-3 py-1.5 rounded-xl border border-[#15803D] shrink-0">
              <span className="text-[10px] text-emerald-200/80 font-bold">SCALE</span>
              <input
                type="range"
                min="20"
                max="300"
                value={Math.round((selectedLayer.transform.scaleX || 1) * 100)}
                onChange={e => {
                  const s = Number(e.target.value) / 100;
                  onUpdateLayerTransform(selectedLayer.id, { scaleX: s, scaleY: s });
                }}
                className="w-16 accent-[#22C55E] h-1.5 bg-[#0B3D20] rounded cursor-pointer"
              />
              <span className="text-xs font-mono text-white">
                {Math.round((selectedLayer.transform.scaleX || 1) * 100)}%
              </span>
            </div>
          )}

          {/* Rotate Slider */}
          {onUpdateLayerTransform && (
            <div className="flex items-center gap-2 bg-[#052E16] px-3 py-1.5 rounded-xl border border-[#15803D] shrink-0">
              <span className="text-[10px] text-emerald-200/80 font-bold">ROTATE</span>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedLayer.transform.rotation || 0}
                onChange={e => {
                  onUpdateLayerTransform(selectedLayer.id, { rotation: Number(e.target.value) });
                }}
                className="w-16 accent-[#22C55E] h-1.5 bg-[#0B3D20] rounded cursor-pointer"
              />
              <span className="text-xs font-mono text-white">
                {selectedLayer.transform.rotation || 0}°
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
