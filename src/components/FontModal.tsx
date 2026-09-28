import React, { useState, useEffect } from 'react';
import {
  FontItem,
  SYSTEM_FONTS,
  initCustomFonts,
  saveCustomFontToDB,
  deleteCustomFontFromDB,
  loadFontFileIntoDocument,
} from '../utils/fonts';
import { Search, Star, Upload, Trash2, X, Check } from 'lucide-react';

interface FontModalProps {
  currentFont: string;
  onSelectFont: (fontFamily: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'All',
  'Hindi',
  'English',
  'Headline',
  'Bold',
  'Arabic',
  'Urdu',
  'Bengali',
  'Modern',
  'Display',
  'Handwritten',
  'Custom',
  'Favorites',
] as const;

export const FontModal: React.FC<FontModalProps> = ({ currentFont, onSelectFont, onClose }) => {
  const [fonts, setFonts] = useState<FontItem[]>(SYSTEM_FONTS);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('designlab_favorite_fonts');
      return saved ? JSON.parse(saved) : ['Anton', 'Rozha One', 'Poppins'];
    } catch {
      return ['Anton', 'Rozha One', 'Poppins'];
    }
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    initCustomFonts().then(customs => {
      setFonts([...SYSTEM_FONTS, ...customs]);
    });
  }, []);

  const toggleFavorite = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(name)
      ? favorites.filter(f => f !== name)
      : [...favorites, name];
    setFavorites(updated);
    localStorage.setItem('designlab_favorite_fonts', JSON.stringify(updated));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      const fontName = file.name.replace(/\.[^/.]+$/, '').trim();
      const format = file.name.endsWith('.otf')
        ? 'opentype'
        : file.name.endsWith('.woff')
        ? 'woff'
        : file.name.endsWith('.woff2')
        ? 'woff2'
        : 'truetype';

      const arrayBuffer = await file.arrayBuffer();
      const fontFaceName = await loadFontFileIntoDocument(fontName, arrayBuffer);

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await saveCustomFontToDB({
          name: fontName,
          family: fontFaceName,
          dataUrl,
          category: 'Custom',
        });
      };
      reader.readAsDataURL(file);

      const customFont: FontItem = {
        name: fontName,
        family: `'${fontFaceName}', sans-serif`,
        category: 'Custom',
        sampleText: 'Custom Font Style Preview',
        isCustom: true,
      };

      setFonts(prev => [...prev.filter(f => f.name !== fontName), customFont]);
      setSelectedCat('Custom');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to parse font file. Please upload a valid .ttf or .otf file.');
    }
  };

  const handleDeleteCustom = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCustomFontFromDB(name);
      setFonts(prev => prev.filter(f => f.name !== name));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFonts = fonts.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCat === 'All') return true;
    if (selectedCat === 'Favorites') return favorites.includes(f.name);
    if (selectedCat === 'Custom') return f.isCustom;
    return f.category === selectedCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white">Font System</h2>
            <p className="text-xs text-emerald-200/70">Hindi, Arabic, English & Custom TTF/OTF</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#052E16] hover:bg-[#15803D] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Import Bar */}
        <div className="p-3 border-b border-[#15803D] flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fonts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#052E16] text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-[#15803D] focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <label className="flex items-center gap-1.5 px-3 py-2 bg-[#16A34A] hover:bg-[#22C55E] text-white font-bold text-xs rounded-xl cursor-pointer shadow-md active:scale-95 transition-all shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Font</span>
            <input
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {errorMsg && (
          <div className="mx-3 mt-2 px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto no-scrollbar border-b border-[#15803D] shrink-0">
          {CATEGORIES.map(cat => {
            const active = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#16A34A] text-white font-bold shadow'
                    : 'bg-[#052E16] text-emerald-200/80 hover:text-white hover:bg-[#15803D]'
                }`}
              >
                {cat === 'Favorites' ? `★ Favorites (${favorites.length})` : cat}
              </button>
            );
          })}
        </div>

        {/* Font List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredFonts.length === 0 ? (
            <div className="text-center py-10 text-emerald-200/60 text-xs">
              No fonts found matching your search.
            </div>
          ) : (
            filteredFonts.map(font => {
              const isSelected = currentFont.includes(font.name);
              const isFav = favorites.includes(font.name);

              return (
                <div
                  key={font.name}
                  onClick={() => onSelectFont(font.family)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#052E16] border-[#22C55E] ring-1 ring-[#22C55E]/60 shadow-md'
                      : 'bg-[#052E16]/60 border-[#15803D] hover:border-[#22C55E]'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white truncate">{font.name}</span>
                      <span className="text-[10px] text-emerald-300 bg-[#0B3D20] px-1.5 py-0.5 rounded border border-[#15803D]">
                        {font.category}
                      </span>
                      {font.isCustom && (
                        <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/15 px-1.5 py-0.5 rounded font-mono border border-[#22C55E]/30">
                          Imported
                        </span>
                      )}
                    </div>
                    {/* Live Preview Sample */}
                    <div
                      className="text-lg text-white truncate"
                      style={{ fontFamily: font.family }}
                    >
                      {font.sampleText}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={e => toggleFavorite(font.name, e)}
                      className={`p-1.5 rounded-lg ${
                        isFav ? 'text-[#22C55E]' : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                      title="Favorite"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>

                    {font.isCustom && (
                      <button
                        onClick={e => handleDeleteCustom(font.name, e)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg"
                        title="Delete custom font"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
