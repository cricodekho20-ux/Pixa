import React, { useRef, useState } from 'react';
import { Project, Preset } from '../types/editor';
import {
  ImagePlus,
  FolderOpen,
  Camera,
  Images,
  Bookmark,
  Layers,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface GalleryScreenProps {
  onSelectPhotoFile: (file: File) => void;
  onSelectGalleryImage: (src: string, width: number, height: number, name: string) => void;
  onOpenProject: (project: Project) => void;
  recentProjects: Project[];
  onDeleteProject: (id: string) => void;
  presets: Preset[];
  onLoadPreset: (preset: Preset) => void;
}

interface GalleryPhotoItem {
  id: string;
  name: string;
  category: 'Camera' | 'Downloads' | 'Portraits' | 'Wallpapers';
  src: string;
  width: number;
  height: number;
  ratio: string;
  timestamp: string;
}

const DEVICE_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: 'gal_1',
    name: 'Neon Cyber Street',
    category: 'Camera',
    src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80',
    width: 1080,
    height: 720,
    ratio: '16:9',
    timestamp: 'Today, 2:40 PM',
  },
  {
    id: 'gal_2',
    name: 'Studio Portrait Model',
    category: 'Portraits',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&auto=format&fit=crop&q=80',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    timestamp: 'Today, 11:15 AM',
  },
  {
    id: 'gal_3',
    name: 'Minimal Travertine Stone',
    category: 'Downloads',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&auto=format&fit=crop&q=80',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    timestamp: 'Yesterday',
  },
  {
    id: 'gal_4',
    name: 'Golden Mountain Ridge',
    category: 'Wallpapers',
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=80',
    width: 1280,
    height: 720,
    ratio: '16:9',
    timestamp: 'Yesterday',
  },
  {
    id: 'gal_5',
    name: 'Dark Moody Architecture',
    category: 'Camera',
    src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1080&auto=format&fit=crop&q=80',
    width: 1080,
    height: 1440,
    ratio: '3:4',
    timestamp: 'Sep 26',
  },
  {
    id: 'gal_6',
    name: 'Vibrant Sunset Coast',
    category: 'Wallpapers',
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    width: 1200,
    height: 800,
    ratio: '3:2',
    timestamp: 'Sep 25',
  },
];

const ALBUMS = ['All Photos', 'Camera', 'Portraits', 'Downloads', 'Wallpapers'] as const;

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  onSelectPhotoFile,
  onSelectGalleryImage,
  onOpenProject,
  recentProjects,
  onDeleteProject,
  presets,
  onLoadPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All Photos');
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectPhotoFile(file);
    }
  };

  const filteredPhotos = DEVICE_GALLERY_PHOTOS.filter(p =>
    selectedAlbum === 'All Photos' ? true : p.category === selectedAlbum
  );

  return (
    <div className="flex-1 w-full h-full bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top App Bar - Photo Gallery Header */}
      <header className="h-14 border-b border-neutral-800/80 px-4 sm:px-6 flex items-center justify-between bg-neutral-900/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-md">
            <Images className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Select Photo
            </h1>
            <p className="text-[11px] text-neutral-400">Android Photo Picker</p>
          </div>
        </div>

        {/* Quick Drawer trigger for Projects & Presets */}
        <button
          onClick={() => setShowProjectsDrawer(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Projects ({recentProjects.length})</span>
        </button>
      </header>

      {/* Primary Action Button: Opens Android Gallery / File Picker */}
      <div className="p-4 sm:p-5 border-b border-neutral-900 bg-neutral-900/40 shrink-0">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 rounded-2xl py-3.5 px-5 flex items-center justify-between font-extrabold text-sm shadow-xl shadow-amber-500/10 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center shadow-md">
              <ImagePlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="text-sm font-black leading-tight">+ Pick from Phone Gallery</div>
              <div className="text-[11px] text-neutral-900/80 font-medium">Select photo & edit immediately</div>
            </div>
          </div>
          <span className="text-xs bg-neutral-950/20 px-2 py-1 rounded-lg uppercase tracking-wider font-mono">
            Open
          </span>
        </button>
      </div>

      {/* Album Category Pill Filter */}
      <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 overflow-x-auto no-scrollbar border-b border-neutral-900 shrink-0 bg-neutral-950">
        {ALBUMS.map(album => {
          const isActive = selectedAlbum === album;
          return (
            <button
              key={album}
              onClick={() => setSelectedAlbum(album)}
              className={`px-3.5 py-1 text-xs rounded-full whitespace-nowrap font-semibold transition-colors ${
                isActive
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {album}
            </button>
          );
        })}
      </div>

      {/* Photos Grid - Camera Roll Style */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            {selectedAlbum} ({filteredPhotos.length})
          </span>
          <span className="text-[11px] text-neutral-500">Tap photo to edit</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              onClick={() =>
                onSelectGalleryImage(photo.src, photo.width, photo.height, photo.name)
              }
              className="group relative bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-amber-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md flex flex-col"
            >
              {/* Photo Thumbnail */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                <img
                  src={photo.src}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 right-2 bg-neutral-950/80 backdrop-blur-sm text-[10px] font-mono text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-800">
                  {photo.ratio}
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-2.5 bg-neutral-900 flex flex-col justify-between flex-1">
                <div className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 truncate">
                  {photo.name}
                </div>
                <div className="text-[10px] text-neutral-500 flex items-center justify-between mt-1">
                  <span>{photo.category}</span>
                  <span>{photo.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects & Presets Drawer */}
      {showProjectsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full sm:w-96 bg-neutral-900 h-full border-l border-neutral-800 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Projects & Presets</h2>
              </div>
              <button
                onClick={() => setShowProjectsDrawer(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Recent Projects ({recentProjects.length})
                </h3>
                {recentProjects.length === 0 ? (
                  <div className="p-4 bg-neutral-950 rounded-xl text-neutral-500 text-xs text-center">
                    No saved projects yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentProjects.map(proj => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          onOpenProject(proj);
                          setShowProjectsDrawer(false);
                        }}
                        className="p-3 bg-neutral-950 border border-neutral-800 hover:border-amber-400 rounded-xl flex items-center justify-between cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 truncate">
                            {proj.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            {proj.layers.length} layers • {new Date(proj.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteProject(proj.id);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  My Presets ({presets.length})
                </h3>
                <div className="space-y-2">
                  {presets.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        onLoadPreset(preset);
                        setShowProjectsDrawer(false);
                      }}
                      className="p-3 bg-neutral-950 border border-neutral-800 hover:border-amber-400 rounded-xl cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-neutral-200 group-hover:text-amber-400">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {preset.category} • {preset.project.layers.length} layers
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
