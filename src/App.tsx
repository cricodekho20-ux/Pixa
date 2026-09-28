import React, { useState, useEffect, useRef } from 'react';
import {
  Project,
  Layer,
  TextLayer,
  ImageLayer,
  StickerLayer,
  ShapeLayer,
  DrawingLayer,
  Preset,
  DesignBackground,
  PhotoBorderConfig,
} from './types/editor';
import { StartScreen } from './components/StartScreen';
import { TopBar } from './components/TopBar';
import { EditingArea } from './components/EditingArea';
import { BottomToolbar } from './components/BottomToolbar';
import { PropertyPanels } from './components/PropertyPanels';
import { LayersDrawer } from './components/LayersDrawer';
import { FontModal } from './components/FontModal';
import { ColorGradientModal } from './components/ColorGradientModal';
import { ThreeDTextModal } from './components/ThreeDTextModal';
import { EffectsModal } from './components/EffectsModal';
import { ChromaKeyModal } from './components/ChromaKeyModal';
import { StickerShapeModal } from './components/StickerShapeModal';
import { FreehandDrawCanvas } from './components/FreehandDrawCanvas';
import { PhotoBorderStudio, DEFAULT_PHOTO_BORDER } from './components/PhotoBorderStudio';
import { ToolsSheet } from './components/ToolsSheet';
import { CanvasSizeModal } from './components/CanvasSizeModal';
import { CropModal } from './components/CropModal';
import { ResizeModal } from './components/ResizeModal';
import { ExportModal } from './components/ExportModal';
import {
  BUILTIN_PRESETS,
  getProjects,
  saveProject,
  deleteProject,
  getUserPresets,
  saveUserPreset,
  deleteUserPreset,
  getSettings,
  saveSettings,
  EditorSettings,
} from './utils/storage';
import { downloadProjectImage, shareProjectImage } from './utils/export';
import { StickerItem } from './utils/stickers';
import { ShapeDefinition } from './utils/shapes';
import { X, Bookmark } from 'lucide-react';

export default function App() {
  // App views: 'start' (clean start screen) or 'editor' (active workspace)
  const [currentView, setCurrentView] = useState<'start' | 'editor'>('start');

  // Active Project state
  const [project, setProject] = useState<Project>({
    id: `proj_${Date.now()}`,
    name: 'Photo Design',
    updatedAt: Date.now(),
    width: 1080,
    height: 1080,
    background: {
      type: 'color',
      color: '#0F172A',
    },
    layers: [],
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  // Selection & UI states
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Modals & dedicated studio screens
  const [showToolsSheet, setShowToolsSheet] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showThreeDModal, setShowThreeDModal] = useState(false);
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [showChromaModal, setShowChromaModal] = useState(false);
  const [showPhotoBorderStudio, setShowPhotoBorderStudio] = useState(false);
  const [showStickerShapeModal, setShowStickerShapeModal] = useState(false);
  const [stickerShapeInitialTab, setStickerShapeInitialTab] = useState<'stickers' | 'shapes'>('stickers');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [perspectiveLayerId, setPerspectiveLayerId] = useState<string | null>(null);

  // Settings & Storage lists
  const [settings, setSettings] = useState<EditorSettings>(getSettings);
  const [recentProjects, setRecentProjects] = useState<Project[]>(getProjects);
  const [presets, setPresets] = useState<Preset[]>([...getUserPresets(), ...BUILTIN_PRESETS]);

  // Push new state to history stack (max 35 steps)
  const pushHistory = (newProject: Project) => {
    setHistory(prev => [...prev.slice(-34), project]);
    setFuture([]);
    setProject(newProject);
    saveProject(newProject);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setFuture(prev => [project, ...prev]);
    setProject(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setHistory(prev => [...prev, project]);
    setProject(next);
  };

  // Helper to read image file into data URL and get intrinsic dimensions
  const readImageFile = (
    file: File
  ): Promise<{ src: string; width: number; height: number; name: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        const img = new Image();
        img.onload = () => {
          resolve({
            src,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            name: file.name.replace(/\.[^/.]+$/, ''),
          });
        };
        img.onerror = reject;
        img.src = src;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 1 & 2. SELECT PHOTO -> OPENS DIRECTLY INSIDE EDITING AREA (NO HOME SCREEN, NO SETUP SCREEN)
  const handleSelectPhotoFile = async (file: File) => {
    try {
      const { src, width, height, name } = await readImageFile(file);
      const initialWidth = width || 1080;
      const initialHeight = height || 1080;

      const baseLayer: ImageLayer = {
        id: `ly_base_${Date.now()}`,
        name: name ? name.toUpperCase() : 'BASE PHOTO',
        type: 'image',
        visible: true,
        locked: false,
        opacity: 100,
        transform: {
          x: 0,
          y: 0,
          width: initialWidth,
          height: initialHeight,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        src,
        originalSrc: src,
        naturalWidth: width,
        naturalHeight: height,
        flipX: false,
        flipY: false,
        borderRadius: 0,
        effects: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          hue: 0,
          exposure: 0,
          temperature: 0,
          blur: 0,
          sharpen: 0,
          vignette: 0,
          grayscale: 0,
          sepia: 0,
          noise: 0,
          stripes: 0,
        },
        perspective: {
          enabled: false,
          topLeft: { x: 0, y: 0 },
          topRight: { x: initialWidth, y: 0 },
          bottomRight: { x: initialWidth, y: initialHeight },
          bottomLeft: { x: 0, y: initialHeight },
        },
      };

      const newProj: Project = {
        id: `proj_${Date.now()}`,
        name: name || 'Photo Design',
        updatedAt: Date.now(),
        width: initialWidth,
        height: initialHeight,
        background: {
          type: 'color',
          color: '#000000',
        },
        layers: [baseLayer],
      };

      setProject(newProj);
      setHistory([]);
      setFuture([]);
      setSelectedLayerId(baseLayer.id);
      saveProject(newProj);
      setRecentProjects(getProjects());
      setCurrentView('editor');
    } catch (e) {
      console.error('Failed to open photo', e);
    }
  };

  const handleSelectGalleryImage = (src: string, width: number, height: number, name: string) => {
    const baseLayer: ImageLayer = {
      id: `ly_base_${Date.now()}`,
      name: name.toUpperCase(),
      type: 'image',
      visible: true,
      locked: false,
      opacity: 100,
      transform: {
        x: 0,
        y: 0,
        width,
        height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      src,
      originalSrc: src,
      naturalWidth: width,
      naturalHeight: height,
      flipX: false,
      flipY: false,
      borderRadius: 0,
      effects: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        exposure: 0,
        temperature: 0,
        blur: 0,
        sharpen: 0,
        vignette: 0,
        grayscale: 0,
        sepia: 0,
        noise: 0,
        stripes: 0,
      },
      perspective: {
        enabled: false,
        topLeft: { x: 0, y: 0 },
        topRight: { x: width, y: 0 },
        bottomRight: { x: width, y: height },
        bottomLeft: { x: 0, y: height },
      },
    };

    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name,
      updatedAt: Date.now(),
      width,
      height,
      background: {
        type: 'color',
        color: '#000000',
      },
      layers: [baseLayer],
    };

    setProject(newProj);
    setHistory([]);
    setFuture([]);
    setSelectedLayerId(baseLayer.id);
    saveProject(newProj);
    setRecentProjects(getProjects());
    setCurrentView('editor');
  };

  const handleOpenProject = (proj: Project) => {
    setProject(proj);
    setHistory([]);
    setFuture([]);
    setSelectedLayerId(proj.layers[0]?.id || null);
    setCurrentView('editor');
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setRecentProjects(getProjects());
  };

  const handleLoadPreset = (preset: Preset) => {
    const loadedProj: Project = {
      ...preset.project,
      id: `proj_${Date.now()}`,
      name: `${preset.name} Copy`,
      updatedAt: Date.now(),
    };
    setProject(loadedProj);
    setHistory([]);
    setFuture([]);
    setSelectedLayerId(loadedProj.layers[0]?.id || null);
    saveProject(loadedProj);
    setRecentProjects(getProjects());
    setCurrentView('editor');
    setShowPresetsModal(false);
  };

  // ADD TEXT (Unlimited text layers)
  const handleAddText = () => {
    const count = project.layers.filter(l => l.type === 'text').length + 1;
    const newTextLayer: TextLayer = {
      id: `ly_text_${Date.now()}`,
      name: `TEXT ${count}`,
      type: 'text',
      visible: true,
      locked: false,
      opacity: 100,
      transform: {
        x: Math.round(project.width * 0.15),
        y: Math.round(project.height * 0.4),
        width: Math.round(project.width * 0.7),
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      text: 'New Text',
      fontFamily: "'Anton', sans-serif",
      fontSize: 64,
      fontWeight: '900',
      fontStyle: 'normal',
      underline: false,
      textAlign: 'center',
      letterSpacing: 1,
      lineHeight: 1.1,
      fillType: 'color',
      color: '#FFFFFF',
      stroke: { width: 2, color: '#000000', opacity: 100 },
      shadow: { color: '#000000', blur: 10, offsetX: 0, offsetY: 4, opacity: 70 },
      threeD: {
        enabled: false,
        depth: 10,
        angle: 60,
        color: '#262626',
        darken: 50,
        lightAngle: 45,
        lighting: 70,
      },
    };

    pushHistory({
      ...project,
      layers: [...project.layers, newTextLayer],
    });
    setSelectedLayerId(newTextLayer.id);
  };

  // ADD IMAGE (Independent photo object)
  const handleAddImageFile = async (file: File) => {
    try {
      const { src, width, height, name } = await readImageFile(file);
      const aspect = width / height;
      const targetW = Math.round(project.width * 0.55);
      const targetH = Math.round(targetW / aspect);

      const newImageLayer: ImageLayer = {
        id: `ly_img_${Date.now()}`,
        name: name ? name.toUpperCase() : 'PHOTO',
        type: 'image',
        visible: true,
        locked: false,
        opacity: 100,
        transform: {
          x: Math.round((project.width - targetW) / 2),
          y: Math.round((project.height - targetH) / 2),
          width: targetW,
          height: targetH,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        src,
        originalSrc: src,
        naturalWidth: width,
        naturalHeight: height,
        flipX: false,
        flipY: false,
        borderRadius: 0,
        effects: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          hue: 0,
          exposure: 0,
          temperature: 0,
          blur: 0,
          sharpen: 0,
          vignette: 0,
          grayscale: 0,
          sepia: 0,
          noise: 0,
          stripes: 0,
        },
        perspective: {
          enabled: false,
          topLeft: { x: 0, y: 0 },
          topRight: { x: targetW, y: 0 },
          bottomRight: { x: targetW, y: targetH },
          bottomLeft: { x: 0, y: targetH },
        },
      };

      pushHistory({
        ...project,
        layers: [...project.layers, newImageLayer],
      });
      setSelectedLayerId(newImageLayer.id);
    } catch (e) {
      console.error(e);
    }
  };

  // REPLACE IMAGE (keeps exact position, size, rotation, border)
  const handleReplaceImage = async (file: File) => {
    if (!selectedLayerId) return;
    const currentLayer = project.layers.find(l => l.id === selectedLayerId);
    if (!currentLayer || currentLayer.type !== 'image') return;

    try {
      const { src, width, height } = await readImageFile(file);
      const updated: ImageLayer = {
        ...currentLayer,
        src,
        originalSrc: src,
        naturalWidth: width,
        naturalHeight: height,
      };

      handleUpdateLayer(selectedLayerId, updated);
    } catch (e) {
      console.error(e);
    }
  };

  // ADD STICKER
  const handleAddSticker = (sticker: StickerItem) => {
    const size = Math.round(project.width * 0.25);
    const newSticker: StickerLayer = {
      id: `ly_stk_${Date.now()}`,
      name: sticker.name.toUpperCase(),
      type: 'sticker',
      visible: true,
      locked: false,
      opacity: 100,
      transform: {
        x: Math.round((project.width - size) / 2),
        y: Math.round((project.height - size) / 2),
        width: size,
        height: size,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      stickerId: sticker.id,
      category: sticker.category,
      svgContent: sticker.svg,
      flipX: false,
      flipY: false,
    };

    pushHistory({
      ...project,
      layers: [...project.layers, newSticker],
    });
    setSelectedLayerId(newSticker.id);
  };

  const handleAddCustomSticker = async (file: File) => {
    try {
      const { src, width, height, name } = await readImageFile(file);
      const size = Math.round(project.width * 0.28);
      const aspect = width / height;
      const w = aspect >= 1 ? size : Math.round(size * aspect);
      const h = aspect >= 1 ? Math.round(size / aspect) : size;

      const newSticker: StickerLayer = {
        id: `ly_stk_${Date.now()}`,
        name: name ? name.toUpperCase() : 'CUSTOM STICKER',
        type: 'sticker',
        visible: true,
        locked: false,
        opacity: 100,
        transform: {
          x: Math.round((project.width - w) / 2),
          y: Math.round((project.height - h) / 2),
          width: w,
          height: h,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        stickerId: `custom_${Date.now()}`,
        category: 'Custom',
        svgContent: `<image href="${src}" width="${w}" height="${h}"/>`,
        flipX: false,
        flipY: false,
      };

      pushHistory({
        ...project,
        layers: [...project.layers, newSticker],
      });
      setSelectedLayerId(newSticker.id);
    } catch (e) {
      console.error(e);
    }
  };

  // ADD SHAPE
  const handleAddShape = (shape: ShapeDefinition) => {
    const scale = project.width / 800;
    const w = Math.round(shape.defaultWidth * scale);
    const h = Math.round(shape.defaultHeight * scale);

    const newShape: ShapeLayer = {
      id: `ly_shp_${Date.now()}`,
      name: shape.label.toUpperCase(),
      type: 'shape',
      visible: true,
      locked: false,
      opacity: 100,
      transform: {
        x: Math.round((project.width - w) / 2),
        y: Math.round((project.height - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      shapeType: shape.type,
      fillType: 'color',
      fillColor: '#FACC15',
      strokeColor: '#000000',
      strokeWidth: 0,
      borderRadius: 12,
    };

    pushHistory({
      ...project,
      layers: [...project.layers, newShape],
    });
    setSelectedLayerId(newShape.id);
  };

  // Freehand Drawing Finished
  const handleDrawingFinished = (drawingLayer: DrawingLayer) => {
    pushHistory({
      ...project,
      layers: [...project.layers, drawingLayer],
    });
    setSelectedLayerId(drawingLayer.id);
    setIsDrawingMode(false);
  };

  // Layer Update / Mutators
  const handleUpdateLayer = (id: string, updates: Partial<Layer>) => {
    const updatedLayers = project.layers.map(l => (l.id === id ? { ...l, ...updates } : l));
    pushHistory({ ...project, layers: updatedLayers as Layer[] });
  };

  const handleUpdateLayerTransform = (id: string, updates: Partial<Layer['transform']>) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l =>
        l.id === id ? { ...l, transform: { ...l.transform, ...updates } } : l
      ),
    }));
  };

  // DUPLICATE / DELETE / REORDER
  const handleDuplicateLayer = (id: string) => {
    const source = project.layers.find(l => l.id === id);
    if (!source) return;

    const clone: Layer = JSON.parse(JSON.stringify(source));
    clone.id = `ly_${source.type}_${Date.now()}`;
    clone.name = `${source.name} Copy`;
    clone.transform.x += 24;
    clone.transform.y += 24;

    pushHistory({
      ...project,
      layers: [...project.layers, clone],
    });
    setSelectedLayerId(clone.id);
  };

  const handleDeleteLayer = (id: string) => {
    const remaining = project.layers.filter(l => l.id !== id);
    pushHistory({ ...project, layers: remaining });
    if (selectedLayerId === id) {
      setSelectedLayerId(remaining[remaining.length - 1]?.id || null);
    }
  };

  const handleBringForward = (id: string) => {
    const idx = project.layers.findIndex(l => l.id === id);
    if (idx === -1 || idx === project.layers.length - 1) return;
    const reordered = [...project.layers];
    const item = reordered.splice(idx, 1)[0];
    reordered.splice(idx + 1, 0, item);
    pushHistory({ ...project, layers: reordered });
  };

  const handleReorderLayer = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const idx = project.layers.findIndex(l => l.id === id);
    if (idx === -1) return;
    const reordered = [...project.layers];
    const item = reordered.splice(idx, 1)[0];

    if (direction === 'top') {
      reordered.push(item);
    } else if (direction === 'bottom') {
      reordered.unshift(item);
    } else if (direction === 'up' && idx < project.layers.length - 1) {
      reordered.splice(idx + 1, 0, item);
    } else if (direction === 'down' && idx > 0) {
      reordered.splice(idx - 1, 0, item);
    } else {
      reordered.splice(idx, 0, item);
    }

    pushHistory({ ...project, layers: reordered });
  };

  // Open Photo Border Studio
  const handleOpenPhotoBorderStudio = () => {
    let target = project.layers.find(l => l.id === selectedLayerId && l.type === 'image') as ImageLayer | undefined;
    if (!target) {
      target = project.layers.find(l => l.type === 'image') as ImageLayer | undefined;
      if (target) {
        setSelectedLayerId(target.id);
      }
    }

    if (target) {
      setShowPhotoBorderStudio(true);
    }
  };

  const handleApplyPhotoBorder = (borderConfig: PhotoBorderConfig) => {
    const targetId = selectedLayerId || project.layers.find(l => l.type === 'image')?.id;
    if (!targetId) return;

    handleUpdateLayer(targetId, {
      borderConfig,
      borderRadius: borderConfig.radius,
    });
  };

  // Apply Crop to selected photo
  const handleApplyCrop = (newSrc: string, croppedWidth: number, croppedHeight: number) => {
    if (!selectedLayerId) return;
    const current = project.layers.find(l => l.id === selectedLayerId);
    if (!current || current.type !== 'image') return;

    const currentW = current.transform.width;
    const newAspect = croppedWidth / croppedHeight;
    const newH = Math.round(currentW / newAspect);

    handleUpdateLayer(selectedLayerId, {
      src: newSrc,
      naturalWidth: croppedWidth,
      naturalHeight: croppedHeight,
      transform: {
        ...current.transform,
        height: newH,
      },
    });
    setShowCropModal(false);
  };

  // Apply manual resize to selected layer
  const handleApplyResize = (width: number, height: number, scaleX: number, scaleY: number) => {
    if (!selectedLayerId) return;
    handleUpdateLayerTransform(selectedLayerId, {
      width,
      height,
      scaleX,
      scaleY,
    });
    setShowResizeModal(false);
  };

  // Apply design canvas size from Tools -> Size
  const handleApplyCanvasSize = (width: number, height: number) => {
    pushHistory({
      ...project,
      width,
      height,
    });
    setShowSizeModal(false);
  };

  // Center alignment tools
  const handleCenterHorizontal = () => {
    if (!selectedLayerId) return;
    const layer = project.layers.find(l => l.id === selectedLayerId);
    if (!layer) return;
    const newX = Math.round((project.width - layer.transform.width) / 2);
    handleUpdateLayerTransform(selectedLayerId, { x: newX });
  };

  const handleCenterVertical = () => {
    if (!selectedLayerId) return;
    const layer = project.layers.find(l => l.id === selectedLayerId);
    if (!layer) return;
    const newY = Math.round((project.height - layer.transform.height) / 2);
    handleUpdateLayerTransform(selectedLayerId, { y: newY });
  };

  // Save as Preset
  const handleSaveAsPreset = () => {
    const name = window.prompt('Name this preset:', `${project.name} Preset`);
    if (!name) return;

    const newPreset: Preset = {
      id: `custom_preset_${Date.now()}`,
      name,
      category: 'Custom',
      description: `Preset with ${project.layers.length} layers, photo borders, and 3D styling`,
      thumbnail: '',
      project: JSON.parse(JSON.stringify(project)),
    };

    saveUserPreset(newPreset);
    setPresets([...getUserPresets(), ...BUILTIN_PRESETS]);
  };

  // Export handlers
  const handleExport = async (format: 'png' | 'jpeg', quality: number) => {
    try {
      await downloadProjectImage(project, project.width, project.height, format, quality, project.name);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const handleShare = async () => {
    try {
      await shareProjectImage(project, project.width, project.height);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId) || null;
  const targetImageForBorder =
    (project.layers.find(l => l.id === selectedLayerId && l.type === 'image') as ImageLayer) ||
    (project.layers.find(l => l.type === 'image') as ImageLayer) ||
    null;

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#052E16] font-sans text-white">
      {currentView === 'start' ? (
        <StartScreen
          onAddPhotoFile={handleSelectPhotoFile}
          onOpenProject={handleOpenProject}
          recentProjects={recentProjects}
          onDeleteProject={handleDeleteProject}
          presets={presets}
          onLoadPreset={handleLoadPreset}
          onSelectSampleImage={handleSelectGalleryImage}
        />
      ) : (
        <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
          {/* Top Bar: Back | Undo | Redo | Save | Export | More */}
          <TopBar
            project={project}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSave={handleSaveAsPreset}
            onOpenExportModal={() => setShowExportModal(true)}
            onExport={handleExport}
            onShare={handleShare}
            onBackToStart={() => {
              saveProject(project);
              setRecentProjects(getProjects());
              setCurrentView('start');
            }}
            onOpenSizeModal={() => setShowSizeModal(true)}
            onOpenPresets={() => setShowPresetsModal(true)}
            snapEnabled={settings.snapToGuides}
            onToggleSnap={() =>
              setSettings(s => {
                const next = { ...s, snapToGuides: !s.snapToGuides };
                saveSettings(next);
                return next;
              })
            }
            zoom={zoom}
            onZoomIn={() => setZoom(z => Math.min(3, z * 1.15))}
            onZoomOut={() => setZoom(z => Math.max(0.2, z / 1.15))}
            onResetZoom={() => {
              setZoom(0.85);
              setPan({ x: 0, y: 0 });
            }}
            onToggleLockBackground={() => {
              if (project.layers.length > 0) {
                const baseLayer = project.layers[0];
                handleUpdateLayer(baseLayer.id, { locked: !baseLayer.locked });
              }
            }}
            isBackgroundLocked={Boolean(project.layers[0]?.locked)}
          />

          {/* Central Workspace: Main EDITING AREA with independent transforms for every photo */}
          <div className="relative flex-1 w-full overflow-hidden flex">
            <EditingArea
              project={project}
              selectedLayerId={selectedLayerId}
              onSelectLayer={id => setSelectedLayerId(id)}
              onUpdateLayerTransform={handleUpdateLayerTransform}
              onUpdateLayer={handleUpdateLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onDeleteLayer={handleDeleteLayer}
              onBringForward={handleBringForward}
              onOpenCrop={() => setShowCropModal(true)}
              onOpenResize={() => setShowResizeModal(true)}
              onOpenBorder={handleOpenPhotoBorderStudio}
              onOpenEffects={() => setShowEffectsModal(true)}
              onOpenChroma={() => setShowChromaModal(true)}
              onStartPerspective={() => {
                if (selectedLayer?.type === 'image') {
                  setPerspectiveLayerId(selectedLayer.id);
                }
              }}
              zoom={zoom}
              setZoom={setZoom}
              pan={pan}
              setPan={setPan}
              snapEnabled={settings.snapToGuides}
              perspectiveLayerId={perspectiveLayerId}
              onApplyPerspective={persp => {
                if (perspectiveLayerId) {
                  handleUpdateLayer(perspectiveLayerId, { perspective: persp });
                }
                setPerspectiveLayerId(null);
              }}
              onCancelPerspective={() => setPerspectiveLayerId(null)}
            />

            {/* Freehand Drawing Overlay Mode */}
            {isDrawingMode && (
              <FreehandDrawCanvas
                canvasWidth={project.width}
                canvasHeight={project.height}
                zoom={zoom}
                pan={pan}
                onFinish={handleDrawingFinished}
                onCancel={() => setIsDrawingMode(false)}
              />
            )}

            {/* Android Layers Drawer */}
            {isLayersOpen && (
              <LayersDrawer
                layers={project.layers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={id => setSelectedLayerId(id)}
                onUpdateLayer={handleUpdateLayer}
                onDuplicateLayer={handleDuplicateLayer}
                onDeleteLayer={handleDeleteLayer}
                onReorderLayer={handleReorderLayer}
                onClose={() => setIsLayersOpen(false)}
              />
            )}
          </div>

          {/* Contextual Property Panels for Selected Object */}
          <PropertyPanels
            selectedLayer={selectedLayer}
            onUpdateLayer={handleUpdateLayer}
            onUpdateLayerTransform={handleUpdateLayerTransform}
            onOpenFontModal={() => setShowFontModal(true)}
            onOpenColorModal={() => setShowColorModal(true)}
            onOpenThreeDModal={() => setShowThreeDModal(true)}
            onOpenEffectsModal={() => setShowEffectsModal(true)}
            onOpenChromaModal={() => setShowChromaModal(true)}
            onOpenPhotoBorder={handleOpenPhotoBorderStudio}
            onStartPerspective={() => {
              if (selectedLayer?.type === 'image') {
                setPerspectiveLayerId(selectedLayer.id);
              }
            }}
            onReplaceImage={handleReplaceImage}
            onOpenCrop={() => setShowCropModal(true)}
            onOpenResize={() => setShowResizeModal(true)}
            background={project.background}
            onChangeBackground={bg => pushHistory({ ...project, background: bg })}
          />

          {/* Android Bottom Toolbar: Text | Image | Sticker | Shape | Draw | Background | Effects | Layers | Tools */}
          <BottomToolbar
            onAddText={handleAddText}
            onAddImageFile={handleAddImageFile}
            onOpenStickers={() => {
              setStickerShapeInitialTab('stickers');
              setShowStickerShapeModal(true);
            }}
            onOpenShapes={() => {
              setStickerShapeInitialTab('shapes');
              setShowStickerShapeModal(true);
            }}
            onStartDrawing={() => setIsDrawingMode(true)}
            onSelectBackground={() => setSelectedLayerId(null)}
            onOpenEffects={() => setShowEffectsModal(true)}
            onToggleLayers={() => setIsLayersOpen(!isLayersOpen)}
            isLayersOpen={isLayersOpen}
            onOpenTools={() => setShowToolsSheet(true)}
          />
        </div>
      )}

      {/* Tools Sheet (Size, Photo Border, Crop, Resize, Chroma, Perspective, Effects, Center) */}
      {showToolsSheet && (
        <ToolsSheet
          selectedLayer={selectedLayer}
          onOpenSizeModal={() => setShowSizeModal(true)}
          onOpenCropModal={() => {
            if (selectedLayer?.type === 'image') {
              setShowCropModal(true);
            }
          }}
          onOpenResizeModal={() => {
            if (selectedLayer) {
              setShowResizeModal(true);
            }
          }}
          onOpenPhotoBorder={handleOpenPhotoBorderStudio}
          onOpenPerspective={() => {
            if (selectedLayer?.type === 'image') {
              setPerspectiveLayerId(selectedLayer.id);
            }
          }}
          onOpenChromaKey={() => {
            if (selectedLayer?.type === 'image') {
              setShowChromaModal(true);
            }
          }}
          onOpenEffects={() => setShowEffectsModal(true)}
          onSelectBackground={() => setSelectedLayerId(null)}
          onOpenExportModal={() => setShowExportModal(true)}
          onCenterHorizontal={handleCenterHorizontal}
          onCenterVertical={handleCenterVertical}
          onClose={() => setShowToolsSheet(false)}
        />
      )}

      {/* Design Size Modal (9:16, 4:5, 1:1, 16:9, YouTube, IG, FB, WhatsApp, Custom) */}
      {showSizeModal && (
        <CanvasSizeModal
          currentWidth={project.width}
          currentHeight={project.height}
          onApplySize={handleApplyCanvasSize}
          onClose={() => setShowSizeModal(false)}
        />
      )}

      {/* Crop Modal (Free, 1:1, 4:5, 9:16, 16:9, Custom) */}
      {showCropModal && selectedLayer?.type === 'image' && (
        <CropModal
          layer={selectedLayer as ImageLayer}
          onApplyCrop={handleApplyCrop}
          onClose={() => setShowCropModal(false)}
        />
      )}

      {/* Resize Modal (Manual width/height, Lock Aspect Ratio) */}
      {showResizeModal && selectedLayer && (
        <ResizeModal
          layer={selectedLayer}
          onApplyResize={handleApplyResize}
          onClose={() => setShowResizeModal(false)}
        />
      )}

      {/* Photo Border Studio Screen */}
      {showPhotoBorderStudio && targetImageForBorder && (
        <PhotoBorderStudio
          layer={targetImageForBorder}
          onApplyBorder={handleApplyPhotoBorder}
          onClose={() => setShowPhotoBorderStudio(false)}
        />
      )}

      {/* Font Modal */}
      {showFontModal && selectedLayer?.type === 'text' && (
        <FontModal
          currentFont={(selectedLayer as TextLayer).fontFamily}
          onSelectFont={fontFamily => {
            handleUpdateLayer(selectedLayer.id, { fontFamily });
            setShowFontModal(false);
          }}
          onClose={() => setShowFontModal(false)}
        />
      )}

      {/* Color & Gradient Modal */}
      {showColorModal && (selectedLayer?.type === 'text' || selectedLayer?.type === 'shape') && (
        <ColorGradientModal
          initialFillType={
            selectedLayer.type === 'text'
              ? (selectedLayer as TextLayer).fillType === 'color'
                ? 'color'
                : 'linear-gradient'
              : 'color'
          }
          initialColor={
            selectedLayer.type === 'text'
              ? (selectedLayer as TextLayer).color
              : (selectedLayer as ShapeLayer).fillColor
          }
          initialGradient={
            selectedLayer.type === 'text'
              ? (selectedLayer as TextLayer).gradient
              : undefined
          }
          onApply={data => {
            if (selectedLayer.type === 'text') {
              handleUpdateLayer(selectedLayer.id, {
                fillType: data.fillType,
                color: data.color,
                gradient: data.gradient,
              });
            } else if (selectedLayer.type === 'shape') {
              handleUpdateLayer(selectedLayer.id, {
                fillType: data.fillType === 'color' ? 'color' : 'gradient',
                fillColor: data.color,
                gradient: data.gradient,
              });
            }
            setShowColorModal(false);
          }}
          onClose={() => setShowColorModal(false)}
        />
      )}

      {/* 3D Text Modal */}
      {showThreeDModal && selectedLayer?.type === 'text' && (
        <ThreeDTextModal
          layer={selectedLayer as TextLayer}
          onApply={(threeD, textMod) => {
            handleUpdateLayer(selectedLayer.id, {
              threeD,
              ...(textMod || {}),
            });
            setShowThreeDModal(false);
          }}
          onClose={() => setShowThreeDModal(false)}
        />
      )}

      {/* Effects Modal */}
      {showEffectsModal && (
        <EffectsModal
          layer={
            (selectedLayer?.type === 'image'
              ? (selectedLayer as ImageLayer)
              : (project.layers.find(l => l.type === 'image') as ImageLayer)) || {
              id: 'mock',
              type: 'image',
              name: 'Effects',
              src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
              originalSrc: '',
              naturalWidth: 600,
              naturalHeight: 400,
              effects: {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                hue: 0,
                exposure: 0,
                temperature: 0,
                blur: 0,
                sharpen: 0,
                vignette: 0,
                grayscale: 0,
                sepia: 0,
                noise: 0,
                stripes: 0,
              },
              perspective: {
                enabled: false,
                topLeft: { x: 0, y: 0 },
                topRight: { x: 600, y: 0 },
                bottomRight: { x: 600, y: 400 },
                bottomLeft: { x: 0, y: 400 },
              },
              transform: { x: 0, y: 0, width: 600, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
              visible: true,
              locked: false,
              opacity: 100,
              borderRadius: 0,
              flipX: false,
              flipY: false,
            }
          }
          onApply={effects => {
            const targetId = selectedLayer?.type === 'image' ? selectedLayer.id : project.layers.find(l => l.type === 'image')?.id;
            if (targetId) {
              handleUpdateLayer(targetId, { effects });
            }
            setShowEffectsModal(false);
          }}
          onClose={() => setShowEffectsModal(false)}
        />
      )}

      {/* Chroma Key / Background Removal Modal */}
      {showChromaModal && selectedLayer?.type === 'image' && (
        <ChromaKeyModal
          layer={selectedLayer as ImageLayer}
          onApply={(newSrc, chromaKey) => {
            handleUpdateLayer(selectedLayer.id, {
              src: newSrc,
              chromaKey,
            });
            setShowChromaModal(false);
          }}
          onClose={() => setShowChromaModal(false)}
        />
      )}

      {/* Sticker & Shape Picker Modal */}
      {showStickerShapeModal && (
        <StickerShapeModal
          initialTab={stickerShapeInitialTab}
          onAddSticker={handleAddSticker}
          onAddCustomSticker={handleAddCustomSticker}
          onAddShape={handleAddShape}
          onClose={() => setShowStickerShapeModal(false)}
        />
      )}

      {/* Presets Modal from TopBar */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
          <div className="bg-[#0B3D20] border border-[#15803D] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-[#15803D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#22C55E]" />
                <h3 className="text-sm font-extrabold text-white">Design Presets ({presets.length})</h3>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="w-7 h-7 rounded-full bg-[#052E16] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className="p-3 bg-[#052E16] border border-[#15803D] hover:border-[#22C55E] rounded-xl cursor-pointer group transition-colors"
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

      {/* Up to 8K High-Resolution Export Studio Modal */}
      {showExportModal && (
        <ExportModal
          project={project}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
