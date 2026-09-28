import React, { useState } from 'react';
import { STICKERS, STICKER_CATEGORIES, StickerItem } from '../utils/stickers';
import { SHAPES_LIST, ShapeDefinition, renderShapeSVGPath } from '../utils/shapes';
import { Smile, Shapes, Upload, X } from 'lucide-react';

interface StickerShapeModalProps {
  initialTab?: 'stickers' | 'shapes';
  onAddSticker: (sticker: StickerItem) => void;
  onAddCustomSticker: (file: File) => void;
  onAddShape: (shape: ShapeDefinition) => void;
  onClose: () => void;
}

export const StickerShapeModal: React.FC<StickerShapeModalProps> = ({
  initialTab = 'stickers',
  onAddSticker,
  onAddCustomSticker,
  onAddShape,
  onClose,
}) => {
  const [tab, setTab] = useState<'stickers' | 'shapes'>(initialTab);
  const [selectedStickerCat, setSelectedStickerCat] = useState<string>('All');

  const filteredStickers = STICKERS.filter(s =>
    selectedStickerCat === 'All' ? true : s.category === selectedStickerCat
  );

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddCustomSticker(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header with Tabs */}
        <div className="p-3 border-b border-[#15803D] flex items-center justify-between">
          <div className="flex p-1 bg-[#052E16] rounded-xl border border-[#15803D]">
            <button
              onClick={() => setTab('stickers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                tab === 'stickers'
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Stickers</span>
            </button>
            <button
              onClick={() => setTab('shapes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                tab === 'shapes'
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Shapes className="w-3.5 h-3.5" />
              <span>Shapes</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#052E16] hover:bg-[#15803D] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 1: Stickers Catalog */}
        {tab === 'stickers' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sticker Categories & Custom Upload */}
            <div className="p-2 border-b border-[#15803D] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <label className="flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs font-bold rounded-full cursor-pointer shadow-sm active:scale-95 transition-all shrink-0">
                <Upload className="w-3 h-3" />
                <span>Custom PNG</span>
                <input
                  type="file"
                  accept="image/png,image/webp,image/svg+xml"
                  onChange={handleCustomUpload}
                  className="hidden"
                />
              </label>

              {['All', ...STICKER_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedStickerCat(cat)}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedStickerCat === cat
                      ? 'bg-[#16A34A] text-white font-bold'
                      : 'bg-[#052E16] text-emerald-200/80 hover:bg-[#15803D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sticker Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
              {filteredStickers.map(stk => (
                <button
                  key={stk.id}
                  onClick={() => {
                    onAddSticker(stk);
                    onClose();
                  }}
                  className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group shadow-sm aspect-square"
                  title={stk.name}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform"
                    dangerouslySetInnerHTML={{ __html: stk.svg }}
                  />
                  <span className="text-[10px] text-emerald-200/80 truncate w-full text-center">
                    {stk.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Vector Shapes Catalog */}
        {tab === 'shapes' && (
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {SHAPES_LIST.map(shape => (
              <button
                key={shape.type}
                onClick={() => {
                  onAddShape(shape);
                  onClose();
                }}
                className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group shadow-sm aspect-square"
              >
                <svg
                  viewBox={`0 0 ${shape.defaultWidth} ${shape.defaultHeight}`}
                  className="w-12 h-12 text-[#22C55E] group-hover:scale-110 transition-transform"
                >
                  <path
                    d={renderShapeSVGPath(shape.type, shape.defaultWidth, shape.defaultHeight)}
                    fill="currentColor"
                    stroke="#052E16"
                    strokeWidth="2"
                  />
                </svg>
                <span className="text-xs font-bold text-white capitalize">{shape.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
