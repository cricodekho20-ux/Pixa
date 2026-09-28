import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Share2,
  Check,
  Sparkles,
  Lock,
  Unlock,
  Images,
  Layers,
  Info,
  Loader2,
  MonitorCheck,
  Sliders,
} from 'lucide-react';
import { Project } from '../types/editor';
import {
  ExportResolution,
  ExportQuality,
  ExportFormat,
  calculateExportDimensions,
  getQualityFactor,
} from '../types/export';
import { downloadProjectImage, shareProjectImage } from '../utils/export';

interface ExportModalProps {
  project: Project;
  onClose: () => void;
  onSavedToGallery?: (dataUrl: string, name: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  onClose,
  onSavedToGallery,
}) => {
  // Independent Resolution state
  const [resolution, setResolution] = useState<ExportResolution>('8K');

  // Independent Quality state
  const [quality, setQuality] = useState<ExportQuality>('Maximum');

  // Format state
  const [format, setFormat] = useState<ExportFormat>('png');

  // Custom size controls
  const [customWidth, setCustomWidth] = useState<number>(project.width);
  const [customHeight, setCustomHeight] = useState<number>(project.height);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // Export progress & feedback state
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Aspect ratio of the current project
  const projectAspect = project.width / project.height;

  // Calculate final dimensions dynamically based on selected resolution or custom inputs
  const currentDimensions = useMemo(() => {
    return calculateExportDimensions(
      project.width,
      project.height,
      resolution,
      resolution === 'Custom' ? { width: customWidth, height: customHeight } : undefined
    );
  }, [project.width, project.height, resolution, customWidth, customHeight]);

  // Handler for custom width change with aspect ratio locking
  const handleCustomWidthChange = (val: number) => {
    const w = Math.max(1, Math.min(16384, Math.round(val || 1)));
    setCustomWidth(w);
    if (lockAspectRatio) {
      setCustomHeight(Math.max(1, Math.round(w / projectAspect)));
    }
  };

  // Handler for custom height change with aspect ratio locking
  const handleCustomHeightChange = (val: number) => {
    const h = Math.max(1, Math.min(16384, Math.round(val || 1)));
    setCustomHeight(h);
    if (lockAspectRatio) {
      setCustomWidth(Math.max(1, Math.round(h * projectAspect)));
    }
  };

  // 1. Primary EXPORT Action
  const handleExecuteExport = async () => {
    try {
      setIsExporting(true);
      setSuccessNotice(null);
      setExportStage(`Rendering ${resolution} canvas (${currentDimensions.width} × ${currentDimensions.height} px)...`);

      // Allow UI to update spinner before heavy canvas draw
      await new Promise(r => setTimeout(r, 60));

      setExportStage(`Encoding ${format.toUpperCase()} (${quality} quality)...`);
      const qualityFactor = getQualityFactor(quality);
      const filename = `${project.name || 'PhotoDesign'}_${resolution}_${currentDimensions.width}x${currentDimensions.height}`;

      await downloadProjectImage(
        project,
        currentDimensions.width,
        currentDimensions.height,
        format,
        qualityFactor,
        filename
      );

      setSuccessNotice(`Successfully exported ${resolution} (${currentDimensions.width} × ${currentDimensions.height} px)!`);
      setTimeout(() => setSuccessNotice(null), 4500);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please check browser memory or try a lower resolution.');
    } finally {
      setIsExporting(false);
      setExportStage('');
    }
  };

  // 2. SAVE TO GALLERY Action
  const handleSaveToGallery = async () => {
    try {
      setIsExporting(true);
      setSuccessNotice(null);
      setExportStage('Saving high-resolution design to gallery...');

      await new Promise(r => setTimeout(r, 60));

      const qualityFactor = getQualityFactor(quality);
      const filename = `${project.name || 'Gallery_Master'}_${resolution}`;

      await downloadProjectImage(
        project,
        currentDimensions.width,
        currentDimensions.height,
        format,
        qualityFactor,
        filename
      );

      if (onSavedToGallery) {
        onSavedToGallery(project.name, `${resolution} (${currentDimensions.width}×${currentDimensions.height})`);
      }

      setSuccessNotice(`Saved to Photo Gallery at ${resolution} (${currentDimensions.width} × ${currentDimensions.height} px)!`);
      setTimeout(() => setSuccessNotice(null), 4500);
    } catch (err) {
      console.error('Save to gallery failed:', err);
      alert('Could not save to gallery. Please try again.');
    } finally {
      setIsExporting(false);
      setExportStage('');
    }
  };

  // 3. SHARE Action
  const handleShare = async () => {
    try {
      setIsExporting(true);
      setSuccessNotice(null);
      setExportStage('Preparing high-resolution file for sharing...');

      await new Promise(r => setTimeout(r, 60));

      const qualityFactor = getQualityFactor(quality);
      const shared = await shareProjectImage(
        project,
        currentDimensions.width,
        currentDimensions.height,
        format,
        qualityFactor
      );

      if (shared) {
        setSuccessNotice('Design shared successfully!');
      } else {
        // Fallback: download if native share is unavailable in desktop iframe
        await handleExecuteExport();
      }
      setTimeout(() => setSuccessNotice(null), 4500);
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsExporting(false);
      setExportStage('');
    }
  };

  // Resolution options list
  const resolutionOptions: ExportResolution[] = [
    'Original',
    '720p',
    '1080p',
    '2K',
    '4K',
    '6K',
    '8K',
    'Custom',
  ];

  // Quality options list
  const qualityOptions: ExportQuality[] = ['Low', 'Medium', 'High', 'Maximum'];

  // Formats list
  const formatOptions: { id: ExportFormat; label: string; desc: string }[] = [
    { id: 'png', label: 'PNG', desc: 'Preserves transparency & maximum image detail' },
    { id: 'jpeg', label: 'JPG', desc: 'Uses selected quality setting for photography' },
    { id: 'webp', label: 'WEBP', desc: 'Modern high compression with transparency' },
  ];

  const megapixels = ((currentDimensions.width * currentDimensions.height) / 1000000).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#15803D] flex items-center justify-between bg-[#052E16]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shadow-lg shadow-[#16A34A]/30">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">Export Studio</h2>
                <span className="bg-[#16A34A] text-[#DCFCE7] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#22C55E]/50 tracking-wider">
                  UP TO 8K
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/70">
                High-resolution master rendering with all layers, borders, 3D text & effects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#052E16] text-neutral-300 hover:text-white hover:bg-[#15803D] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Success Banner */}
          {successNotice && (
            <div className="p-3 bg-emerald-950/90 border border-[#22C55E] rounded-2xl flex items-center gap-2.5 text-xs text-[#DCFCE7] animate-in zoom-in-95 duration-150 shadow-lg">
              <Check className="w-4 h-4 text-[#22C55E] shrink-0 stroke-[3]" />
              <span className="font-bold">{successNotice}</span>
            </div>
          )}

          {/* SECTION 1: EXPORT RESOLUTION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black tracking-wider text-emerald-300 uppercase flex items-center gap-1.5">
                <MonitorCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Export Resolution</span>
              </label>
              <span className="text-[11px] text-emerald-200/80 font-mono">
                {currentDimensions.width} × {currentDimensions.height} px
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {resolutionOptions.map(res => {
                const isSelected = resolution === res;
                const dims = calculateExportDimensions(
                  project.width,
                  project.height,
                  res,
                  res === 'Custom' ? { width: customWidth, height: customHeight } : undefined
                );
                const is8K = res === '8K';

                return (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`relative p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#15803D] border-[#22C55E] text-white shadow-lg shadow-[#16A34A]/25 ring-2 ring-[#22C55E]/40'
                        : 'bg-[#052E16] hover:bg-[#15803D]/60 border-[#15803D] text-neutral-300 hover:text-white'
                    }`}
                  >
                    {is8K && (
                      <span className="absolute -top-1.5 -right-1 bg-gradient-to-r from-emerald-400 to-green-500 text-[#052E16] text-[9px] font-black px-1.5 py-0.2 rounded-full shadow">
                        8K ULTRA
                      </span>
                    )}
                    <div className="font-extrabold text-xs">{res}</div>
                    <div className="text-[10px] font-mono text-emerald-200/70 truncate">
                      {res === 'Custom' ? 'Manual' : `${dims.width}×${dims.height}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CUSTOM SIZE INPUTS (Only shown when Custom is selected) */}
            {resolution === 'Custom' && (
              <div className="p-3.5 bg-[#052E16] border border-[#15803D] rounded-2xl space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-200">Custom Pixel Dimensions</span>
                  <button
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                      lockAspectRatio
                        ? 'bg-[#15803D] text-[#DCFCE7] border-[#22C55E]'
                        : 'bg-[#0B3D20] text-neutral-400 border-[#15803D] hover:text-white'
                    }`}
                    title={lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                  >
                    {lockAspectRatio ? <Lock className="w-3 h-3 text-[#22C55E]" /> : <Unlock className="w-3 h-3" />}
                    <span>{lockAspectRatio ? 'Ratio Locked' : 'Ratio Free'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-emerald-200/70 uppercase font-mono font-bold block mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={16384}
                      value={customWidth}
                      onChange={e => handleCustomWidthChange(Number(e.target.value))}
                      className="w-full bg-[#0B3D20] border border-[#15803D] focus:border-[#22C55E] focus:outline-none rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-200/70 uppercase font-mono font-bold block mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={16384}
                      value={customHeight}
                      onChange={e => handleCustomHeightChange(Number(e.target.value))}
                      className="w-full bg-[#0B3D20] border border-[#15803D] focus:border-[#22C55E] focus:outline-none rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: QUALITY (Separated from Resolution) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black tracking-wider text-emerald-300 uppercase flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#22C55E]" />
                <span>Quality (Encoding & Compression)</span>
              </label>
              <span className="text-[11px] text-emerald-200/70">
                {quality === 'Maximum' ? '100% Master' : quality === 'High' ? '90% Studio' : quality === 'Medium' ? '75% Web' : '50% Compact'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {qualityOptions.map(q => {
                const isSelected = quality === q;
                return (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-2 px-3 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#15803D] border-[#22C55E] text-white shadow-md ring-2 ring-[#22C55E]/40 font-black text-xs'
                        : 'bg-[#052E16] hover:bg-[#15803D]/60 border-[#15803D] text-neutral-300 hover:text-white font-bold text-xs'
                    }`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-emerald-200/60 leading-tight">
              Resolution controls pixel dimensions. Quality controls compression encoding.
            </p>
          </div>

          {/* SECTION 3: EXPORT FORMAT */}
          <div className="space-y-2">
            <label className="text-xs font-black tracking-wider text-emerald-300 uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#22C55E]" />
              <span>Export Format</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {formatOptions.map(f => {
                const isSelected = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#15803D] border-[#22C55E] text-white shadow-lg ring-2 ring-[#22C55E]/40'
                        : 'bg-[#052E16] hover:bg-[#15803D]/60 border-[#15803D] text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-extrabold text-sm">{f.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#22C55E]" />}
                    </div>
                    <span className="text-[10px] text-emerald-200/70 leading-tight">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: MANDATORY BEFORE EXPORTING SUMMARY CARD */}
          <div className="p-4 bg-[#052E16] border border-[#22C55E]/60 rounded-3xl space-y-3 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-[#15803D]">
              <span className="text-[11px] font-black uppercase text-[#22C55E] tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Export Specifications</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-300/80 bg-[#0B3D20] px-2 py-0.5 rounded-full border border-[#15803D]">
                {megapixels} MP Master
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#0B3D20]/90 p-2.5 rounded-2xl border border-[#15803D]">
                <div className="text-[10px] text-emerald-300/70 font-semibold">Resolution:</div>
                <div className="text-sm font-black text-white">{resolution}</div>
              </div>

              <div className="bg-[#0B3D20]/90 p-2.5 rounded-2xl border border-[#15803D]">
                <div className="text-[10px] text-emerald-300/70 font-semibold">Dimensions:</div>
                <div className="text-xs font-mono font-bold text-white truncate">
                  {currentDimensions.width} × {currentDimensions.height} px
                </div>
              </div>

              <div className="bg-[#0B3D20]/90 p-2.5 rounded-2xl border border-[#15803D]">
                <div className="text-[10px] text-emerald-300/70 font-semibold">Quality:</div>
                <div className="text-sm font-black text-white">{quality}</div>
              </div>

              <div className="bg-[#0B3D20]/90 p-2.5 rounded-2xl border border-[#15803D]">
                <div className="text-[10px] text-emerald-300/70 font-semibold">Format:</div>
                <div className="text-sm font-black text-white uppercase">{format === 'jpeg' ? 'JPG' : format}</div>
              </div>
            </div>

            {/* Feature confirmation checklist */}
            <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-emerald-200/70">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#22C55E]" /> Photos & Layers</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#22C55E]" /> Text & 3D Extrusion</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#22C55E]" /> Vector Stickers & Shapes</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#22C55E]" /> Effects & Photo Borders</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#22C55E]" /> Perspective Warp</span>
            </div>
          </div>

          {/* Progress / Loading Spinner Overlay */}
          {isExporting && (
            <div className="p-3 bg-emerald-950/80 border border-[#22C55E] rounded-2xl flex items-center justify-center gap-3 text-xs text-white shadow-lg animate-pulse">
              <Loader2 className="w-4 h-4 text-[#22C55E] animate-spin" />
              <span className="font-bold">{exportStage || 'Rendering high-resolution master...'}</span>
            </div>
          )}
        </div>

        {/* SECTION 5: ACTION BUTTONS (EXPORT | SAVE TO GALLERY | SHARE) */}
        <div className="p-4 sm:p-5 bg-[#052E16] border-t border-[#15803D] flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          {/* 1. EXPORT */}
          <button
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="w-full sm:flex-1 bg-[#16A34A] hover:bg-[#22C55E] disabled:opacity-50 text-white font-black py-3 px-4 rounded-2xl shadow-xl shadow-[#16A34A]/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>EXPORT</span>
          </button>

          {/* 2. SAVE TO GALLERY */}
          <button
            onClick={handleSaveToGallery}
            disabled={isExporting}
            className="w-full sm:flex-1 bg-[#0B3D20] hover:bg-[#15803D] disabled:opacity-50 text-[#DCFCE7] font-bold py-3 px-4 rounded-2xl border border-[#22C55E]/60 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Images className="w-4 h-4 text-[#22C55E]" />
            <span>SAVE TO GALLERY</span>
          </button>

          {/* 3. SHARE */}
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 bg-[#0B3D20] hover:bg-[#15803D] disabled:opacity-50 text-white font-bold py-3 rounded-2xl border border-[#15803D] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            title="Share via device share sheet"
          >
            <Share2 className="w-4 h-4 text-[#22C55E]" />
            <span>SHARE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
