import React from 'react';
import { ShapeType } from '../types/editor';
import { SHAPES_LIST, renderShapeSVGPath } from '../utils/shapes';
import {
  X,
  Shapes,
  Sparkles,
  MousePointerClick,
  Hand,
} from 'lucide-react';

interface ShapeMenuModalProps {
  onSelectShapeForDrawing: (type: ShapeType) => void;
  onInstantAddShape?: (type: ShapeType) => void;
  onClose: () => void;
}

export const ShapeMenuModal: React.FC<ShapeMenuModalProps> = ({
  onSelectShapeForDrawing,
  onInstantAddShape,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-white animate-in fade-in duration-150">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#16A34A]/20 border border-[#22C55E]/40 flex items-center justify-center">
              <Shapes className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">
                SELECT SHAPE TO DRAW
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                Choose a shape, then drag your finger on the canvas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#052E16] hover:bg-[#15803D] text-neutral-300 hover:text-white flex items-center justify-center transition-colors border border-[#15803D]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tip banner */}
        <div className="mx-4 mt-3 p-2.5 bg-[#052E16] border border-[#15803D] rounded-xl flex items-center gap-2.5 text-xs text-emerald-100">
          <Hand className="w-4 h-4 text-[#22C55E] shrink-0 animate-pulse" />
          <span>
            <strong className="text-[#22C55E]">Touch & Drag:</strong> Tap any shape below, then drag on the canvas to draw it at custom dimensions!
          </span>
        </div>

        {/* Shape Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3">
          {SHAPES_LIST.map(shape => (
            <button
              key={shape.type}
              onClick={() => {
                onSelectShapeForDrawing(shape.type);
                onClose();
              }}
              className="p-3 bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] hover:border-[#22C55E] rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all active:scale-95 group shadow-sm aspect-square text-center focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${shape.defaultWidth} ${shape.defaultHeight}`}
                  className="w-10 h-10 text-[#22C55E] group-hover:scale-110 transition-transform drop-shadow"
                >
                  <path
                    d={renderShapeSVGPath(shape.type, shape.defaultWidth, shape.defaultHeight)}
                    fill="currentColor"
                    stroke="#052E16"
                    strokeWidth={shape.type === 'line' ? '12' : '2'}
                  />
                </svg>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-white group-hover:text-[#DCFCE7] capitalize leading-tight">
                  {shape.label}
                </span>
                <span className="text-[9px] text-emerald-300/70 font-mono mt-0.5">
                  Tap to Draw
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer Action */}
        <div className="p-3 border-t border-[#15803D] bg-[#052E16]/80 flex items-center justify-between text-xs text-neutral-300 px-4">
          <span className="text-[11px] text-emerald-300/80 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            Independent Vector Layers
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#15803D] hover:bg-[#16A34A] text-white font-bold rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
