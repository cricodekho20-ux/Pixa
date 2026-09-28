import React from 'react';
import {
  Maximize2,
  Crop,
  Frame,
  Move,
  Scissors,
  RotateCw,
  Paintbrush,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  X,
  Sliders,
  Palette,
  Download,
} from 'lucide-react';
import { Layer } from '../types/editor';

interface ToolsSheetProps {
  selectedLayer: Layer | null;
  onOpenSizeModal: () => void;
  onOpenCropModal: () => void;
  onOpenResizeModal: () => void;
  onOpenPhotoBorder: () => void;
  onOpenPerspective: () => void;
  onOpenChromaKey: () => void;
  onOpenEffects: () => void;
  onSelectBackground: () => void;
  onOpenExportModal?: () => void;
  onCenterHorizontal: () => void;
  onCenterVertical: () => void;
  onClose: () => void;
}

export const ToolsSheet: React.FC<ToolsSheetProps> = ({
  selectedLayer,
  onOpenSizeModal,
  onOpenCropModal,
  onOpenResizeModal,
  onOpenPhotoBorder,
  onOpenPerspective,
  onOpenChromaKey,
  onOpenEffects,
  onSelectBackground,
  onOpenExportModal,
  onCenterHorizontal,
  onCenterVertical,
  onClose,
}) => {
  const isImage = selectedLayer?.type === 'image';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-[#0B3D20] border-t border-[#15803D] rounded-t-3xl w-full max-w-lg shadow-2xl overflow-hidden p-4 space-y-4 max-h-[75vh] overflow-y-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#15803D]">
          <div>
            <h3 className="text-sm font-extrabold text-white">Studio Tools</h3>
            <p className="text-[11px] text-emerald-200/70">
              {selectedLayer ? `Selected: ${selectedLayer.name}` : 'General Design Tools'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#052E16] text-neutral-300 hover:text-white hover:bg-[#15803D] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Tools Grid (GREEN THEME) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {/* 1. Design Size */}
          <button
            onClick={() => {
              onClose();
              onOpenSizeModal();
            }}
            className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group"
          >
            <Maximize2 className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">Design Size</span>
            <span className="text-[10px] text-emerald-200/60">9:16, 1:1, YT</span>
          </button>

          {/* 2. Photo Border */}
          <button
            onClick={() => {
              onClose();
              onOpenPhotoBorder();
            }}
            className="p-3 bg-[#16A34A]/20 hover:bg-[#16A34A]/30 border border-[#22C55E]/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group"
          >
            <Frame className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform stroke-[2.5]" />
            <span className="text-xs font-bold text-[#DCFCE7]">Photo Border</span>
            <span className="text-[10px] text-emerald-300/80">Frame & Shadow</span>
          </button>

          {/* 3. Crop */}
          <button
            onClick={() => {
              onClose();
              onOpenCropModal();
            }}
            disabled={!isImage}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group border ${
              isImage
                ? 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] hover:border-[#22C55E] text-white active:scale-95'
                : 'bg-[#052E16]/40 border-[#15803D]/40 text-neutral-500 cursor-not-allowed opacity-50'
            }`}
          >
            <Crop className={`w-5 h-5 ${isImage ? 'text-[#22C55E]' : 'text-neutral-500'}`} />
            <span className="text-xs font-bold">Crop Photo</span>
            <span className="text-[10px] text-emerald-200/60">Aspect Ratios</span>
          </button>

          {/* 4. Resize */}
          <button
            onClick={() => {
              onClose();
              onOpenResizeModal();
            }}
            disabled={!selectedLayer}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group border ${
              selectedLayer
                ? 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] hover:border-[#22C55E] text-white active:scale-95'
                : 'bg-[#052E16]/40 border-[#15803D]/40 text-neutral-500 cursor-not-allowed opacity-50'
            }`}
          >
            <Maximize2 className={`w-5 h-5 ${selectedLayer ? 'text-[#22C55E]' : 'text-neutral-500'}`} />
            <span className="text-xs font-bold">Manual Resize</span>
            <span className="text-[10px] text-emerald-200/60">Lock Aspect</span>
          </button>

          {/* 5. Background Removal / Chroma Key */}
          <button
            onClick={() => {
              onClose();
              onOpenChromaKey();
            }}
            disabled={!isImage}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group border ${
              isImage
                ? 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] hover:border-[#22C55E] text-white active:scale-95'
                : 'bg-[#052E16]/40 border-[#15803D]/40 text-neutral-500 cursor-not-allowed opacity-50'
            }`}
          >
            <Scissors className={`w-5 h-5 ${isImage ? 'text-[#22C55E]' : 'text-neutral-500'}`} />
            <span className="text-xs font-bold">Remove BG</span>
            <span className="text-[10px] text-emerald-200/60">Chroma Key</span>
          </button>

          {/* 6. Perspective Warp */}
          <button
            onClick={() => {
              onClose();
              onOpenPerspective();
            }}
            disabled={!isImage}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group border ${
              isImage
                ? 'bg-[#052E16] hover:bg-[#15803D] border-[#15803D] hover:border-[#22C55E] text-white active:scale-95'
                : 'bg-[#052E16]/40 border-[#15803D]/40 text-neutral-500 cursor-not-allowed opacity-50'
            }`}
          >
            <Move className={`w-5 h-5 ${isImage ? 'text-[#22C55E]' : 'text-neutral-500'}`} />
            <span className="text-xs font-bold">Perspective</span>
            <span className="text-[10px] text-emerald-200/60">4-Point Warp</span>
          </button>

          {/* 7. Image Effects */}
          <button
            onClick={() => {
              onClose();
              onOpenEffects();
            }}
            className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group text-white"
          >
            <Sliders className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Effects</span>
            <span className="text-[10px] text-emerald-200/60">Color Filters</span>
          </button>

          {/* 8. Canvas Background */}
          <button
            onClick={() => {
              onClose();
              onSelectBackground();
            }}
            className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center group text-white"
          >
            <Palette className="w-5 h-5 text-[#22C55E] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Background</span>
            <span className="text-[10px] text-emerald-200/60">Color & Gradient</span>
          </button>

          {/* 9. Export Studio (Up to 8K) */}
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
                <span className="bg-[#22C55E] text-[#052E16] text-[9px] font-black px-1 rounded">8K</span>
              </div>
              <span className="text-[10px] text-emerald-300/80">Up to 8K Master</span>
            </button>
          )}
        </div>

        {/* Alignment Actions for selected object */}
        {selectedLayer && (
          <div className="pt-2 border-t border-[#15803D] flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-200/80">Align to Canvas:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onCenterHorizontal();
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <AlignHorizontalDistributeCenter className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Center X</span>
              </button>
              <button
                onClick={() => {
                  onCenterVertical();
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <AlignVerticalDistributeCenter className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Center Y</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
