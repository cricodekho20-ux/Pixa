import React from 'react';
import {
  Maximize2,
  Crop,
  Frame,
  Move,
  Scissors,
  Sliders,
  Palette,
  Download,
  Grid,
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  X,
  Scale,
  Sparkles,
  Magnet,
  Shapes,
  Smile,
} from 'lucide-react';
import { Layer } from '../types/editor';
import { computeRatioString } from './RatioModal';

interface ToolsSheetProps {
  selectedLayer: Layer | null;
  currentWidth: number;
  currentHeight: number;
  snapEnabled: boolean;
  showGrid?: boolean;
  onToggleSnap: () => void;
  onToggleGrid?: () => void;
  onOpenSizeModal: () => void;
  onOpenRatioModal: () => void;
  onSelectBackground: () => void;
  onCenterHorizontal: () => void;
  onCenterVertical: () => void;
  onCenterBoth?: () => void;
  onOpenCropModal: () => void;
  onOpenResizeModal: () => void;
  onOpenPhotoBorder: () => void;
  onOpenPerspective: () => void;
  onOpenChromaKey: () => void;
  onOpenEffects: () => void;
  onOpenShapes?: () => void;
  onOpenStickers?: () => void;
  onOpenExportModal?: () => void;
  onClose: () => void;
}

export const ToolsSheet: React.FC<ToolsSheetProps> = ({
  selectedLayer,
  currentWidth,
  currentHeight,
  snapEnabled,
  showGrid = false,
  onToggleSnap,
  onToggleGrid,
  onOpenSizeModal,
  onOpenRatioModal,
  onSelectBackground,
  onCenterHorizontal,
  onCenterVertical,
  onCenterBoth,
  onOpenCropModal,
  onOpenResizeModal,
  onOpenPhotoBorder,
  onOpenPerspective,
  onOpenChromaKey,
  onOpenEffects,
  onOpenShapes,
  onOpenStickers,
  onOpenExportModal,
  onClose,
}) => {
  const isImage = selectedLayer?.type === 'image';
  const currentRatio = computeRatioString(currentWidth, currentHeight);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-[#0B3D20] border-t border-[#15803D] rounded-t-3xl w-full max-w-lg shadow-2xl overflow-hidden p-4 space-y-4 max-h-[85vh] overflow-y-auto text-white">
        {/* Header with Ratio & Size Tag */}
        <div className="flex items-center justify-between pb-3 border-b border-[#15803D]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">TOOLS</h3>
              <span className="bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 text-[9px] font-mono uppercase px-2 py-0.5 rounded font-black">
                {currentRatio} • {currentWidth}×{currentHeight}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70">
              {selectedLayer ? `Selected: ${selectedLayer.name}` : 'Studio Design & Transformation Tools'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#052E16] text-neutral-300 hover:text-white hover:bg-[#15803D] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY STUDIO TOOLS:
            • Size
            • Ratio
            • Background
            • Grid
            • Alignment
            • Export Settings */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between px-0.5">
            <span>Core Tools</span>
            <span className="text-emerald-400/80 font-normal">Shape, Alignment & Dimensions</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* 1. Size */}
            <button
              onClick={() => {
                onClose();
                onOpenSizeModal();
              }}
              className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group"
            >
              <Maximize2 className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white">Size</span>
              <span className="text-[10px] text-emerald-200/70 font-mono">
                {currentWidth}×{currentHeight}
              </span>
            </button>

            {/* 2. Ratio (Required) */}
            <button
              onClick={() => {
                onClose();
                onOpenRatioModal();
              }}
              className="p-3 bg-[#16A34A]/25 hover:bg-[#16A34A]/40 border-2 border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group shadow-md shadow-[#16A34A]/20"
            >
              <Scale className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform stroke-[2.5]" />
              <span className="text-xs font-black text-[#DCFCE7]">Ratio</span>
              <span className="text-[10px] text-emerald-300 font-bold bg-[#052E16]/80 px-1.5 py-0.2 rounded">
                {currentRatio}
              </span>
            </button>

            {/* 3. Background */}
            <button
              onClick={() => {
                onClose();
                onSelectBackground();
              }}
              className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group text-white"
            >
              <Palette className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Background</span>
              <span className="text-[10px] text-emerald-200/70">Color / Grad</span>
            </button>

            {/* 4. Grid */}
            <button
              onClick={() => {
                if (onToggleGrid) onToggleGrid();
                else onToggleSnap();
              }}
              className={`p-3 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group ${
                showGrid || snapEnabled
                  ? 'bg-[#16A34A]/20 border-[#22C55E] text-white'
                  : 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] text-neutral-200'
              }`}
            >
              <Grid className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Grid</span>
              <span className="text-[9px] font-mono text-[#22C55E] bg-[#052E16] px-1.5 py-0.5 rounded border border-[#15803D]">
                {showGrid || snapEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* 5. Alignment */}
            <button
              onClick={() => {
                if (onCenterBoth) onCenterBoth();
                else {
                  onCenterHorizontal();
                  onCenterVertical();
                }
              }}
              className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group text-white"
            >
              <AlignCenter className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Alignment</span>
              <span className="text-[10px] text-emerald-200/70">Center Object</span>
            </button>

            {/* 6. Export Settings */}
            {onOpenExportModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenExportModal();
                }}
                className="p-3 bg-[#16A34A]/20 hover:bg-[#16A34A]/35 border border-[#22C55E]/60 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group text-white"
              >
                <Download className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform stroke-[2.5]" />
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#DCFCE7]">Export</span>
                  <span className="bg-[#22C55E] text-[#052E16] text-[8px] font-black px-1 rounded">
                    8K
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300/80">Format & Res</span>
              </button>
            )}
          </div>
        </div>

        {/* LAYER EDITING TOOLS:
            Photo Border, Crop, Resize, Remove BG, Perspective, Effects */}
        <div className="space-y-1.5 pt-2 border-t border-[#15803D]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between px-0.5">
            <span>Layer & Photo Tools</span>
            <span className="text-emerald-400/80 font-normal">Independent Transforms</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* Vector Shapes */}
            {onOpenShapes && (
              <button
                onClick={() => {
                  onClose();
                  onOpenShapes();
                }}
                className="p-2.5 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center group text-white"
                title="Add Vector Shape"
              >
                <Shapes className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#DCFCE7]">Vector Shapes</span>
                <span className="text-[9px] text-emerald-300/80">Circle, Star, Box</span>
              </button>
            )}

            {/* Stickers */}
            {onOpenStickers && (
              <button
                onClick={() => {
                  onClose();
                  onOpenStickers();
                }}
                className="p-2.5 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center group text-white"
                title="Add Sticker"
              >
                <Smile className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#DCFCE7]">Stickers</span>
                <span className="text-[9px] text-emerald-300/80">Badges & Art</span>
              </button>
            )}

            {/* Photo Border */}
            <button
              onClick={() => {
                onClose();
                onOpenPhotoBorder();
              }}
              className="p-2.5 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center group"
            >
              <Frame className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#DCFCE7]">Photo Border</span>
              <span className="text-[9px] text-emerald-300/80">Border & Shadow</span>
            </button>

            {/* Crop */}
            <button
              onClick={() => {
                onClose();
                onOpenCropModal();
              }}
              disabled={!isImage}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center group border ${
                isImage
                  ? 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] hover:border-[#22C55E] text-white active:scale-95'
                  : 'bg-[#052E16]/40 border-[#15803D]/40 text-neutral-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Crop className={`w-4 h-4 ${isImage ? 'text-[#22C55E]' : 'text-neutral-500'}`} />
              <span className="text-xs font-bold">Crop Photo</span>
              <span className="text-[9px] text-emerald-200/60">Free / Preset</span>
            </button>

            {/* Resize Layer */}
            <button
              onClick={() => {
                onClose();
                onOpenResizeModal();
              }}
              disabled={!selectedLayer}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center group border ${
                selectedLayer
                  ? 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] hover:border-[#22C55E] text-white active:scale-95'
                  : 'bg-[#052E16]/40 border-[#15803D]/40 text-neutral-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Maximize2 className={`w-4 h-4 ${selectedLayer ? 'text-[#22C55E]' : 'text-neutral-500'}`} />
              <span className="text-xs font-bold">Layer Resize</span>
              <span className="text-[9px] text-emerald-200/60">Lock Aspect</span>
            </button>

            {/* Remove BG / Chroma Key */}
            <button
              onClick={() => {
                onClose();
                onOpenChromaKey();
              }}
              disabled={!isImage}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center group border ${
                isImage
                  ? 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] hover:border-[#22C55E] text-white active:scale-95'
                  : 'bg-[#052E16]/40 border-[#15803D]/40 text-neutral-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Scissors className={`w-4 h-4 ${isImage ? 'text-[#22C55E]' : 'text-neutral-500'}`} />
              <span className="text-xs font-bold">Remove BG</span>
              <span className="text-[9px] text-emerald-200/60">Chroma Key</span>
            </button>

            {/* Perspective Warp */}
            <button
              onClick={() => {
                onClose();
                onOpenPerspective();
              }}
              disabled={!isImage}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center group border ${
                isImage
                  ? 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] hover:border-[#22C55E] text-white active:scale-95'
                  : 'bg-[#052E16]/40 border-[#15803D]/40 text-neutral-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Move className={`w-4 h-4 ${isImage ? 'text-[#22C55E]' : 'text-neutral-500'}`} />
              <span className="text-xs font-bold">Perspective</span>
              <span className="text-[9px] text-emerald-200/60">4-Point Warp</span>
            </button>

            {/* Effects */}
            <button
              onClick={() => {
                onClose();
                onOpenEffects();
              }}
              className="p-2.5 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-center group text-white"
            >
              <Sliders className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Effects</span>
              <span className="text-[9px] text-emerald-200/60">Color Filters</span>
            </button>
          </div>
        </div>

        {/* Alignment Actions Bar */}
        <div className="pt-2 border-t border-[#15803D] flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-emerald-200/80">
            {selectedLayer ? `Align ${selectedLayer.name}:` : 'Align Objects:'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onCenterHorizontal();
                onClose();
              }}
              className="px-2.5 py-1.5 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
              title="Center Horizontally"
            >
              <AlignHorizontalDistributeCenter className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Center X</span>
            </button>
            <button
              onClick={() => {
                onCenterVertical();
                onClose();
              }}
              className="px-2.5 py-1.5 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
              title="Center Vertically"
            >
              <AlignVerticalDistributeCenter className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Center Y</span>
            </button>
            {onCenterBoth && (
              <button
                onClick={() => {
                  onCenterBoth();
                  onClose();
                }}
                className="px-2.5 py-1.5 bg-[#16A34A] hover:bg-[#22C55E] text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                title="Center Both Dimensions"
              >
                <AlignCenter className="w-3.5 h-3.5 text-white" />
                <span>Center Both</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
