import React, { useState } from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Save,
  Download,
  MoreVertical,
  Maximize2,
  Bookmark,
  Magnet,
  Share2,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
} from 'lucide-react';
import { Project } from '../types/editor';

interface TopBarProps {
  project: Project;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onOpenExportModal: () => void;
  onExport: (format: 'png' | 'jpeg', quality: number) => void;
  onShare: () => void;
  onBackToStart: () => void;
  onOpenSizeModal: () => void;
  onOpenPresets: () => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleLockBackground?: () => void;
  isBackgroundLocked?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  project,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onOpenExportModal,
  onExport,
  onShare,
  onBackToStart,
  onOpenSizeModal,
  onOpenPresets,
  snapEnabled,
  onToggleSnap,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleLockBackground,
  isBackgroundLocked,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <header className="h-14 bg-[#0B3D20] border-b border-[#15803D] px-2 sm:px-4 flex items-center justify-between z-30 select-none shrink-0 text-white">
      {/* 1. Left: Back */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onBackToStart}
          className="p-2 text-white hover:text-[#DCFCE7] rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-1.5"
          title="Back to Start Screen"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-xs font-bold hidden sm:inline">Back</span>
        </button>

        <span className="text-xs font-extrabold text-white truncate max-w-[120px] sm:max-w-[200px]">
          {project.name || 'Photo Design'}
        </span>
      </div>

      {/* 2. Center: Undo & Redo */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center bg-[#052E16] p-0.5 rounded-xl border border-[#15803D]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-neutral-300 hover:text-[#22C55E] disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-3.5 bg-[#15803D]" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-neutral-300 hover:text-[#22C55E] disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Right: Lock BG | Save | Export | More */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Lock Background Layer (Requirement 7) */}
        {onToggleLockBackground && (
          <button
            onClick={onToggleLockBackground}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              isBackgroundLocked
                ? 'bg-emerald-600 text-white border-[#22C55E] shadow-sm'
                : 'bg-[#052E16] hover:bg-[#15803D] text-neutral-300 hover:text-white border-[#15803D]'
            }`}
            title={isBackgroundLocked ? 'Background is Locked (Tap to Unlock)' : 'Lock Background Layer'}
          >
            {isBackgroundLocked ? (
              <Lock className="w-3.5 h-3.5 text-white" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-neutral-300" />
            )}
            <span className="hidden sm:inline">
              {isBackgroundLocked ? 'BG Locked' : 'Lock BG'}
            </span>
          </button>
        )}

        {/* Save */}
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#052E16] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl border border-[#15803D] transition-colors"
          title="Save Project & Preset"
        >
          <Save className="w-4 h-4 text-[#22C55E]" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Export Button - Opens High-Res Export Studio (Up to 8K) */}
        <div className="relative flex items-center">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#22C55E] text-white px-3.5 py-1.5 rounded-l-xl font-black text-xs shadow-md shadow-[#16A34A]/25 active:scale-95 transition-all border-r border-[#15803D]"
            title="Open Export Studio (Up to 8K)"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export</span>
            <span className="bg-[#052E16] text-[#DCFCE7] text-[9px] font-black px-1.5 py-0.2 rounded-full hidden sm:inline">
              8K
            </span>
          </button>

          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-[#16A34A] hover:bg-[#22C55E] text-white p-1.5 rounded-r-xl font-black text-xs shadow-md shadow-[#16A34A]/25 active:scale-95 transition-all"
            title="Quick Export Options"
          >
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-52 bg-[#0B3D20] border border-[#15803D] rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150 text-white"
              onClick={() => setShowExportMenu(false)}
            >
              <button
                onClick={onOpenExportModal}
                className="w-full text-left px-3 py-2 rounded-xl text-white bg-[#15803D]/60 hover:bg-[#15803D] flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-[#DCFCE7] flex items-center gap-1.5">
                    <span>Export Studio</span>
                    <span className="bg-[#22C55E] text-[#052E16] text-[9px] font-black px-1 rounded">8K</span>
                  </div>
                  <div className="text-[10px] text-emerald-200/80">Up to 8K & custom size</div>
                </div>
              </button>

              <button
                onClick={() => onExport('png', 1)}
                className="w-full text-left px-3 py-2 rounded-xl text-white hover:bg-[#15803D] flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">Quick PNG</div>
                  <div className="text-[10px] text-emerald-200/70">Original size with transparency</div>
                </div>
                <span className="text-[10px] font-mono bg-[#052E16] px-1.5 py-0.5 rounded text-[#22C55E] border border-[#15803D]">
                  PNG
                </span>
              </button>

              <button
                onClick={() => onExport('jpeg', 0.95)}
                className="w-full text-left px-3 py-2 rounded-xl text-white hover:bg-[#15803D] flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">Quick JPEG</div>
                  <div className="text-[10px] text-emerald-200/70">Original size 95% quality</div>
                </div>
                <span className="text-[10px] font-mono bg-[#052E16] px-1.5 py-0.5 rounded text-emerald-200 border border-[#15803D]">
                  JPG
                </span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={onShare}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#15803D] flex items-center gap-2 text-[#22C55E] font-bold border-t border-[#15803D]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Design</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 text-white hover:text-[#DCFCE7] rounded-xl bg-[#052E16] hover:bg-[#15803D] border border-[#15803D] transition-colors"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-52 bg-[#0B3D20] border border-[#15803D] rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150 text-white"
              onClick={() => setShowMoreMenu(false)}
            >
              <button
                onClick={onOpenSizeModal}
                className="w-full text-left px-3 py-2 rounded-xl text-white hover:bg-[#15803D] flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4 text-[#22C55E]" />
                <span className="font-medium">Change Design Size</span>
              </button>

              <button
                onClick={onOpenPresets}
                className="w-full text-left px-3 py-2 rounded-xl text-white hover:bg-[#15803D] flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-[#22C55E]" />
                <span className="font-medium">Browse Presets</span>
              </button>

              <button
                onClick={onToggleSnap}
                className="w-full text-left px-3 py-2 rounded-xl text-white hover:bg-[#15803D] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Magnet className="w-4 h-4 text-[#22C55E]" />
                  <span className="font-medium">Magnetic Guides</span>
                </div>
                <span className="text-[10px] font-mono text-[#22C55E] bg-[#052E16] px-1.5 py-0.5 rounded border border-[#15803D]">
                  {snapEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
