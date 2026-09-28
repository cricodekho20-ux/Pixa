import React, { useState } from 'react';
import { Layer } from '../types/editor';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Edit2,
  Check,
  X,
  Type,
  Image as ImageIcon,
  Smile,
  Shapes,
  PenTool,
} from 'lucide-react';

interface LayersDrawerProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onClose: () => void;
}

export const LayersDrawer: React.FC<LayersDrawerProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onReorderLayer,
  onClose,
}) => {
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // Multi-select state
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-[#22C55E]" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />;
      case 'sticker':
        return <Smile className="w-3.5 h-3.5 text-emerald-400" />;
      case 'shape':
        return <Shapes className="w-3.5 h-3.5 text-emerald-400" />;
      case 'drawing':
        return <PenTool className="w-3.5 h-3.5 text-emerald-300" />;
    }
  };

  const startRename = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNameId(layer.id);
    setTempName(layer.name);
  };

  const saveRename = (id: string) => {
    if (tempName.trim()) {
      onUpdateLayer(id, { name: tempName.trim() });
    }
    setEditingNameId(null);
  };

  const toggleMultiSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGroup = () => {
    selectedIds.forEach(id => {
      const l = layers.find(x => x.id === id);
      if (l && !l.name.includes('[Group]')) {
        onUpdateLayer(id, { name: `[Group] ${l.name}` });
      }
    });
    setMultiSelectMode(false);
    setSelectedIds([]);
  };

  const handleUngroup = () => {
    selectedIds.forEach(id => {
      const l = layers.find(x => x.id === id);
      if (l) {
        onUpdateLayer(id, { name: l.name.replace('[Group] ', '') });
      }
    });
    setMultiSelectMode(false);
    setSelectedIds([]);
  };

  const reversedLayers = [...layers].reverse();

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-[#0B3D20] border-l border-[#15803D] shadow-2xl flex flex-col text-white">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#22C55E]" />
          <h2 className="text-sm font-extrabold text-white">Layers ({layers.length})</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMultiSelectMode(!multiSelectMode);
              setSelectedIds([]);
            }}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              multiSelectMode
                ? 'bg-[#16A34A] text-white font-bold border-[#22C55E]'
                : 'text-neutral-300 border-[#15803D] hover:text-white hover:bg-[#15803D]'
            }`}
          >
            {multiSelectMode ? 'Cancel' : 'Multi-Select'}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#052E16] hover:bg-[#15803D] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-select Actions Bar */}
      {multiSelectMode && selectedIds.length > 0 && (
        <div className="px-4 py-2 bg-[#052E16] border-b border-[#15803D] flex items-center justify-between text-xs">
          <span className="text-emerald-200 font-medium">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGroup}
              className="px-2.5 py-1 bg-[#16A34A] text-white font-bold rounded-md hover:bg-[#22C55E]"
            >
              Group
            </button>
            <button
              onClick={handleUngroup}
              className="px-2.5 py-1 bg-[#15803D] text-white rounded-md hover:bg-emerald-600"
            >
              Ungroup
            </button>
          </div>
        </div>
      )}

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {reversedLayers.length === 0 ? (
          <div className="text-center py-12 text-emerald-200/60 text-xs">
            No layers added yet. Tap + Text or + Add Image.
          </div>
        ) : (
          reversedLayers.map(layer => {
            const isSelected = selectedLayerId === layer.id;
            const isChecked = selectedIds.includes(layer.id);
            const isEditing = editingNameId === layer.id;

            return (
              <div
                key={layer.id}
                onClick={() => {
                  if (multiSelectMode) {
                    toggleMultiSelect(layer.id, { stopPropagation: () => {} } as any);
                  } else {
                    onSelectLayer(layer.id);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#052E16] border-[#22C55E] shadow-md ring-1 ring-[#22C55E]/60'
                    : 'bg-[#052E16]/60 border-[#15803D] hover:border-[#22C55E]'
                } ${!layer.visible ? 'opacity-50' : ''}`}
              >
                {/* Main Row: Checkbox/Icon + Name + Visibility/Lock */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {multiSelectMode ? (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => toggleMultiSelect(layer.id, e as any)}
                        className="rounded accent-[#22C55E] cursor-pointer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-[#0B3D20] border border-[#15803D] flex items-center justify-center shrink-0">
                        {getLayerIcon(layer.type)}
                      </div>
                    )}

                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={tempName}
                          onChange={e => setTempName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveRename(layer.id)}
                          className="bg-[#0B3D20] text-xs px-2 py-1 rounded border border-[#22C55E] text-white w-full"
                          autoFocus
                        />
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            saveRename(layer.id);
                          }}
                          className="p-1 text-[#22C55E]"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-xs font-bold text-white truncate">
                          {layer.name}
                        </span>
                        <button
                          onClick={e => startRename(layer, e)}
                          className="text-neutral-400 hover:text-white p-0.5"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions: Eye & Lock */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onUpdateLayer(layer.id, { visible: !layer.visible });
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        layer.visible ? 'text-neutral-300 hover:text-white' : 'text-neutral-600'
                      }`}
                      title={layer.visible ? 'Hide' : 'Show'}
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5 text-emerald-300" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-500" />}
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onUpdateLayer(layer.id, { locked: !layer.locked });
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        layer.locked ? 'text-white bg-emerald-600 shadow' : 'text-neutral-400 hover:text-white'
                      }`}
                      title={layer.locked ? 'Unlock' : 'Lock'}
                    >
                      {layer.locked ? <Lock className="w-3.5 h-3.5 text-white" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Sub-row when selected: Reorder / Duplicate / Delete */}
                {isSelected && !multiSelectMode && (
                  <div className="pt-2 border-t border-[#15803D] flex items-center justify-between text-neutral-300">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onReorderLayer(layer.id, 'top');
                        }}
                        className="p-1 hover:text-white rounded hover:bg-[#15803D]"
                        title="Bring to Front"
                      >
                        <ChevronsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onReorderLayer(layer.id, 'up');
                        }}
                        className="p-1 hover:text-white rounded hover:bg-[#15803D]"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onReorderLayer(layer.id, 'down');
                        }}
                        className="p-1 hover:text-white rounded hover:bg-[#15803D]"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onReorderLayer(layer.id, 'bottom');
                        }}
                        className="p-1 hover:text-white rounded hover:bg-[#15803D]"
                        title="Send to Back"
                      >
                        <ChevronsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDuplicateLayer(layer.id);
                        }}
                        className="p-1 hover:text-[#22C55E] rounded hover:bg-[#15803D]"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteLayer(layer.id);
                        }}
                        className="p-1 hover:text-rose-400 rounded hover:bg-[#15803D]"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
