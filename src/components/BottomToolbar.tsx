import React, { useRef } from 'react';
import {
  Type,
  ImagePlus,
  Smile,
  Shapes,
  PenTool,
  Palette,
  Sliders,
  Layers,
  Wrench,
} from 'lucide-react';

interface BottomToolbarProps {
  onAddText: () => void;
  onAddImageFile: (file: File) => void;
  onOpenStickers: () => void;
  onOpenShapes: () => void;
  onStartDrawing: () => void;
  onSelectBackground: () => void;
  onOpenEffects: () => void;
  onToggleLayers: () => void;
  isLayersOpen: boolean;
  onOpenTools: () => void;
  activeTool?: string;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onAddText,
  onAddImageFile,
  onOpenStickers,
  onOpenShapes,
  onStartDrawing,
  onSelectBackground,
  onOpenEffects,
  onToggleLayers,
  isLayersOpen,
  onOpenTools,
  activeTool,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddImageFile(file);
      e.target.value = '';
    }
  };

  return (
    <nav className="h-16 bg-[#0B3D20] border-t border-[#15803D] px-1 sm:px-3 flex items-center justify-around z-30 select-none shrink-0 shadow-lg text-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Text */}
      <button
        onClick={onAddText}
        className="flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 text-neutral-200 hover:text-[#22C55E] active:scale-95 transition-all group shrink-0"
        title="Add Text"
      >
        <Type className="w-5 h-5 text-neutral-200 group-hover:text-[#22C55E] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-tight mt-1 text-neutral-300 group-hover:text-[#DCFCE7]">
          Text
        </span>
      </button>

      {/* 2. Image (Opens phone image picker for overlay photo) */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 text-neutral-200 hover:text-[#22C55E] active:scale-95 transition-all group shrink-0"
        title="Add Image Overlay"
      >
        <ImagePlus className="w-5 h-5 text-neutral-200 group-hover:text-[#22C55E] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-tight mt-1 text-neutral-300 group-hover:text-[#DCFCE7]">
          Image
        </span>
      </button>

      {/* 3. Sticker */}
      <button
        onClick={onOpenStickers}
        className="flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 text-neutral-200 hover:text-[#22C55E] active:scale-95 transition-all group shrink-0"
        title="Add Sticker"
      >
        <Smile className="w-5 h-5 text-neutral-200 group-hover:text-[#22C55E] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-tight mt-1 text-neutral-300 group-hover:text-[#DCFCE7]">
          Sticker
        </span>
      </button>

      {/* 4. Shape */}
      <button
        onClick={onOpenShapes}
        className="flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 text-neutral-200 hover:text-[#22C55E] active:scale-95 transition-all group shrink-0"
        title="Add Shape"
      >
        <Shapes className="w-5 h-5 text-neutral-200 group-hover:text-[#22C55E] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-tight mt-1 text-neutral-300 group-hover:text-[#DCFCE7]">
          Shape
        </span>
      </button>

      {/* 5. Draw */}
      <button
        onClick={onStartDrawing}
        className="flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 text-neutral-200 hover:text-[#22C55E] active:scale-95 transition-all group shrink-0"
        title="Freehand Draw"
      >
        <PenTool className="w-5 h-5 text-neutral-200 group-hover:text-[#22C55E] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-tight mt-1 text-neutral-300 group-hover:text-[#DCFCE7]">
          Draw
        </span>
      </button>

      {/* 6. Background (Requirement 12) */}
      <button
        onClick={onSelectBackground}
        className="flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 text-neutral-200 hover:text-[#22C55E] active:scale-95 transition-all group shrink-0"
        title="Design Background"
      >
        <Palette className="w-5 h-5 text-neutral-200 group-hover:text-[#22C55E] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-tight mt-1 text-neutral-300 group-hover:text-[#DCFCE7]">
          Background
        </span>
      </button>

      {/* 7. Effects */}
      <button
        onClick={onOpenEffects}
        className="flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 text-neutral-200 hover:text-[#22C55E] active:scale-95 transition-all group shrink-0"
        title="Effects & Filters"
      >
        <Sliders className="w-5 h-5 text-neutral-200 group-hover:text-[#22C55E] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-tight mt-1 text-neutral-300 group-hover:text-[#DCFCE7]">
          Effects
        </span>
      </button>

      {/* 8. Layers */}
      <button
        onClick={onToggleLayers}
        className={`flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 active:scale-95 transition-all group shrink-0 ${
          isLayersOpen ? 'text-[#22C55E] font-bold' : 'text-neutral-200 hover:text-[#22C55E]'
        }`}
        title="Layers Drawer"
      >
        <Layers
          className={`w-5 h-5 group-hover:scale-110 transition-transform ${
            isLayersOpen ? 'text-[#22C55E]' : 'text-neutral-200'
          }`}
        />
        <span className={`text-[10px] font-bold tracking-tight mt-1 ${isLayersOpen ? 'text-[#DCFCE7]' : 'text-neutral-300'}`}>
          Layers
        </span>
      </button>

      {/* 9. Tools */}
      <button
        onClick={onOpenTools}
        className="flex flex-col items-center justify-center min-w-[38px] sm:min-w-[44px] min-h-[44px] px-1.5 py-1 text-neutral-200 hover:text-[#22C55E] active:scale-95 transition-all group shrink-0"
        title="Studio Tools"
      >
        <Wrench className="w-5 h-5 text-neutral-200 group-hover:text-[#22C55E] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-tight mt-1 text-neutral-300 group-hover:text-[#DCFCE7]">
          Tools
        </span>
      </button>
    </nav>
  );
};
