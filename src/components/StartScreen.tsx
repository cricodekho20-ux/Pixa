import React, { useRef } from 'react';
import { Project, Preset } from '../types/editor';
import { ImagePlus, FolderOpen, Bookmark, Sparkles, Trash2, Clock, X } from 'lucide-react';

interface StartScreenProps {
  onAddPhotoFile: (file: File) => void;
  onOpenProject: (project: Project) => void;
  recentProjects: Project[];
  onDeleteProject: (id: string) => void;
  presets: Preset[];
  onLoadPreset: (preset: Preset) => void;
  onSelectSampleImage: (src: string, width: number, height: number, name: string) => void;
}

// Built-in sample images for one-tap instant browser testing
const SAMPLE_PHOTOS = [
  {
    name: 'Cyber City',
    src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80',
    width: 1080,
    height: 720,
    aspect: '16:9',
  },
  {
    name: 'Portrait Model',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&auto=format&fit=crop&q=80',
    width: 1080,
    height: 1350,
    aspect: '4:5',
  },
  {
    name: 'Travertine Stone',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&auto=format&fit=crop&q=80',
    width: 1080,
    height: 1080,
    aspect: '1:1',
  },
  {
    name: 'Sunset Coast',
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    width: 1080,
    height: 1920,
    aspect: '9:16',
  },
];

export const StartScreen: React.FC<StartScreenProps> = ({
  onAddPhotoFile,
  onOpenProject,
  recentProjects,
  onDeleteProject,
  presets,
  onLoadPreset,
  onSelectSampleImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeModal, setActiveModal] = React.useState<'projects' | 'presets' | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddPhotoFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-[#052E16] text-white flex flex-col items-center justify-between p-6 select-none overflow-y-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Brand Tag */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black shadow-lg shadow-[#16A34A]/30">
            D
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>DesignLab</span>
              <span className="text-[10px] bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 px-1.5 py-0.5 rounded font-mono uppercase">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-emerald-200/70">Android Photo & Typography Studio</div>
          </div>
        </div>
      </div>

      {/* Center Hero: 3 Primary Actions */}
      <div className="w-full max-w-sm space-y-4 my-auto py-8">
        {/* + ADD PHOTO: Immediately triggers file picker */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-[#16A34A] hover:bg-[#22C55E] text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-3 font-black text-base shadow-xl shadow-[#16A34A]/30 active:scale-98 transition-all"
        >
          <ImagePlus className="w-6 h-6 stroke-[2.5]" />
          <span>+ ADD PHOTO</span>
        </button>

        {/* OPEN PROJECT */}
        <button
          onClick={() => setActiveModal('projects')}
          className="w-full bg-[#0B3D20] hover:bg-[#15803D] text-white border border-[#15803D] hover:border-[#22C55E] rounded-2xl py-3.5 px-6 flex items-center justify-center gap-2.5 font-bold text-sm shadow-md active:scale-98 transition-all"
        >
          <FolderOpen className="w-5 h-5 text-[#22C55E]" />
          <span>OPEN PROJECT</span>
          {recentProjects.length > 0 && (
            <span className="text-[11px] font-mono bg-[#052E16] text-[#22C55E] px-2 py-0.5 rounded-full ml-1 border border-[#15803D]">
              {recentProjects.length}
            </span>
          )}
        </button>

        {/* MY PRESETS */}
        <button
          onClick={() => setActiveModal('presets')}
          className="w-full bg-[#0B3D20] hover:bg-[#15803D] text-white border border-[#15803D] hover:border-[#22C55E] rounded-2xl py-3.5 px-6 flex items-center justify-center gap-2.5 font-bold text-sm shadow-md active:scale-98 transition-all"
        >
          <Bookmark className="w-5 h-5 text-[#22C55E]" />
          <span>MY PRESETS</span>
          <span className="text-[11px] font-mono bg-[#052E16] text-emerald-200 px-2 py-0.5 rounded-full ml-1 border border-[#15803D]">
            {presets.length}
          </span>
        </button>
      </div>

      {/* Quick Test Photos (for instant 1-tap review in desktop/mobile browser) */}
      <div className="w-full max-w-md pt-4 pb-2 border-t border-[#15803D]/60">
        <div className="flex items-center justify-between text-xs text-emerald-200/80 mb-2.5 px-1">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            Quick Test Photos
          </span>
          <span className="text-[10px] text-emerald-300/70">Tap to edit immediately</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {SAMPLE_PHOTOS.map(photo => (
            <button
              key={photo.name}
              onClick={() => onSelectSampleImage(photo.src, photo.width, photo.height, photo.name)}
              className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-[#0B3D20] border border-[#15803D] hover:border-[#22C55E] transition-all active:scale-95"
            >
              <img
                src={photo.src}
                alt={photo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-[#052E16]/80 px-1 rounded text-emerald-200">
                {photo.aspect}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects Modal */}
      {activeModal === 'projects' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#22C55E]" />
                <h3 className="text-sm font-bold text-white">Saved Projects ({recentProjects.length})</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-[#15803D] text-white hover:bg-emerald-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {recentProjects.length === 0 ? (
                <div className="text-center py-8 text-emerald-200/60 text-xs">
                  No saved projects yet. Tap "+ ADD PHOTO" to start.
                </div>
              ) : (
                recentProjects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onOpenProject(proj);
                      setActiveModal(null);
                    }}
                    className="p-3 bg-[#052E16] border border-[#15803D] hover:border-[#22C55E] rounded-xl flex items-center justify-between cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#22C55E] truncate">
                        {proj.name}
                      </div>
                      <div className="text-[10px] text-emerald-300/70 mt-0.5">
                        {proj.layers.length} layers • {new Date(proj.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className="p-2 text-emerald-300/70 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Presets Modal */}
      {activeModal === 'presets' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#22C55E]" />
                <h3 className="text-sm font-bold text-white">Design Presets ({presets.length})</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-[#15803D] text-white hover:bg-emerald-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => {
                    onLoadPreset(preset);
                    setActiveModal(null);
                  }}
                  className="p-3 bg-[#052E16] border border-[#15803D] hover:border-[#22C55E] rounded-xl cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#22C55E] truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded-full uppercase border border-[#22C55E]/30">
                      {preset.category}
                    </span>
                  </div>
                  {preset.description && (
                    <div className="text-[11px] text-emerald-200/80 mt-1 line-clamp-1">
                      {preset.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
