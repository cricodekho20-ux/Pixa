import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Layer,
  Project,
  TextLayer,
  ImageLayer,
  StickerLayer,
  ShapeLayer,
  DrawingLayer,
} from '../types/editor';
import { SmartGuides, GuideLine } from './SmartGuides';
import { PerspectivePins } from './PerspectivePins';
import { getPerspectiveMatrix3D } from '../utils/perspective';
import { generateCompositeTextShadow } from '../utils/text3d';
import { renderShapeSVGPath } from '../utils/shapes';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  ChevronsUp,
  RotateCw,
  Crop,
  Maximize2,
  Frame,
  FlipHorizontal,
} from 'lucide-react';

interface EditingAreaProps {
  project: Project;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayerTransform: (id: string, updates: Partial<Layer['transform']>) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onBringForward: (id: string) => void;
  // Tools triggers for selected photo
  onOpenCrop?: () => void;
  onOpenResize?: () => void;
  onOpenBorder?: () => void;
  onOpenEffects?: () => void;
  onOpenChroma?: () => void;
  onStartPerspective?: () => void;
  // Fixed workspace fit
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  snapEnabled: boolean;
  perspectiveLayerId: string | null;
  onApplyPerspective: (perspective: ImageLayer['perspective']) => void;
  onCancelPerspective: () => void;
}

export const EditingArea: React.FC<EditingAreaProps> = ({
  project,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayerTransform,
  onUpdateLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onBringForward,
  onOpenCrop,
  onOpenResize,
  onOpenBorder,
  onOpenEffects,
  onOpenChroma,
  onStartPerspective,
  zoom,
  setZoom,
  pan,
  setPan,
  snapEnabled,
  perspectiveLayerId,
  onApplyPerspective,
  onCancelPerspective,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Single-pointer interaction: Move, Corner/Side Resize, Rotate
  // Strictly locked to dragState.layerId!
  const [dragState, setDragState] = useState<{
    mode: 'move' | 'resize' | 'rotate';
    layerId: string;
    handle?: 'tl' | 'tr' | 'br' | 'bl' | 't' | 'r' | 'b' | 'l';
    startX: number;
    startY: number;
    initialTransform: Layer['transform'];
    hasMoved: boolean;
  } | null>(null);

  // Multi-touch tracking on SELECTED LAYER ONLY (Pinch-zoom scales ONLY the selected layer!)
  // Requirement 1 & 2: NO GLOBAL TRANSFORMATION. Gestures modify ONLY the selected object.
  const touchStateRef = useRef<{
    targetLayerId: string;
    initialDistance: number;
    initialAngle: number;
    initialCenter: { x: number; y: number };
    initialTransform: Layer['transform'];
  } | null>(null);

  // Alignment guide lines
  const [guides, setGuides] = useState<GuideLine[]>([]);

  // Double tap tracking for text inline editing
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

  // Fit workspace canvas cleanly inside container on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 28;
      const scaleX = (rect.width - padding * 2) / project.width;
      const scaleY = (rect.height - padding * 2) / project.height;
      const fit = Math.min(1.0, Math.max(0.15, Math.min(scaleX, scaleY)));
      setZoom(fit);
      setPan({
        x: Math.round((rect.width - project.width * fit) / 2),
        y: Math.round((rect.height - project.height * fit) / 2),
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [project.width, project.height, setZoom, setPan]);

  // Touch Start Handler for Multi-Touch Pinch & Rotate
  // When 2 fingers touch anywhere on the screen:
  // If a layer is selected and not locked:
  // All 2-finger gestures apply EXCLUSIVELY to that selected layer.
  // Other layers are NEVER transformed!
  // The canvas container NEVER scales or pans!
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      if (!selectedLayerId) return;
      const selectedLayer = project.layers.find(l => l.id === selectedLayerId);
      if (!selectedLayer || selectedLayer.locked) return;

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const angle = (Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180) / Math.PI;
      const center = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      touchStateRef.current = {
        targetLayerId: selectedLayer.id,
        initialDistance: Math.max(10, dist),
        initialAngle: angle,
        initialCenter: center,
        initialTransform: { ...selectedLayer.transform },
      };

      // Clear any single-pointer drag to avoid conflicting updates
      setDragState(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStateRef.current) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const angle = (Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180) / Math.PI;
      const center = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      const { targetLayerId, initialDistance, initialAngle, initialCenter, initialTransform } =
        touchStateRef.current;

      // CRITICAL REQUIREMENTS 1, 2, 3 & 5:
      // ONLY the selected photo scales and rotates! Other photos DO NOT zoom/rotate!
      // The parent editing area remains FIXED!
      const scaleFactor = Math.max(0.1, Math.min(8.0, dist / initialDistance));
      const newScaleX = Math.round(initialTransform.scaleX * scaleFactor * 100) / 100;
      const newScaleY = Math.round(initialTransform.scaleY * scaleFactor * 100) / 100;

      const angleDiff = angle - initialAngle;
      let newRot = Math.round((initialTransform.rotation + angleDiff) % 360);
      if (newRot < 0) newRot += 360;

      const dx = (center.x - initialCenter.x) / zoom;
      const dy = (center.y - initialCenter.y) / zoom;

      onUpdateLayerTransform(targetLayerId, {
        scaleX: newScaleX,
        scaleY: newScaleY,
        rotation: newRot,
        x: Math.round(initialTransform.x + dx),
        y: Math.round(initialTransform.y + dy),
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStateRef.current = null;
    }
  };

  // Background pointer down: Deselect object if user taps canvas background outside layers
  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-wrapper') {
      onSelectLayer(null);
      setDragState(null);
    }
  };

  // Layer Pointer Down:
  // 1. Detect which object is touched
  // 2. Select ONLY that object
  // 3. Prepare drag for ONLY that object
  const handleLayerPointerDown = (layer: Layer, e: React.PointerEvent) => {
    if (perspectiveLayerId) return;
    e.stopPropagation();

    // Select this layer immediately
    onSelectLayer(layer.id);

    // If layer is locked (e.g. locked background photo), do not initiate drag/move gestures!
    if (layer.locked) {
      setDragState(null);
      return;
    }

    // Double tap detection for text
    const now = Date.now();
    if (
      layer.type === 'text' &&
      lastTapRef.current &&
      lastTapRef.current.id === layer.id &&
      now - lastTapRef.current.time < 350
    ) {
      const newText = window.prompt('Edit Text:', (layer as TextLayer).text);
      if (newText !== null) {
        onUpdateLayer(layer.id, { text: newText });
      }
      lastTapRef.current = null;
      return;
    }
    lastTapRef.current = { id: layer.id, time: now };

    setDragState({
      mode: 'move',
      layerId: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      initialTransform: { ...layer.transform },
      hasMoved: false,
    });
  };

  // Corner or Side Resize Handle Pointer Down
  const handleResizePointerDown = (
    handle: 'tl' | 'tr' | 'br' | 'bl' | 't' | 'r' | 'b' | 'l',
    layer: Layer,
    e: React.PointerEvent
  ) => {
    e.stopPropagation();
    if (layer.locked) return;

    setDragState({
      mode: 'resize',
      handle,
      layerId: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      initialTransform: { ...layer.transform },
      hasMoved: false,
    });
  };

  // Rotation Handle Pointer Down
  const handleRotatePointerDown = (layer: Layer, e: React.PointerEvent) => {
    e.stopPropagation();
    if (layer.locked) return;

    setDragState({
      mode: 'rotate',
      layerId: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      initialTransform: { ...layer.transform },
      hasMoved: false,
    });
  };

  // Pointer Move during Drag / Resize / Rotate (Applied strictly to dragState.layerId ONLY)
  const handlePointerMove = (e: React.PointerEvent) => {
    // If multi-touch pinch is active, do not execute single pointer drag
    if (touchStateRef.current) return;
    if (!dragState) return;

    const currentLayer = project.layers.find(l => l.id === dragState.layerId);
    if (!currentLayer || currentLayer.locked) return;

    const dx = (e.clientX - dragState.startX) / zoom;
    const dy = (e.clientY - dragState.startY) / zoom;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      dragState.hasMoved = true;
    }

    if (dragState.mode === 'move') {
      let targetX = Math.round(dragState.initialTransform.x + dx);
      let targetY = Math.round(dragState.initialTransform.y + dy);

      const activeGuides: GuideLine[] = [];
      const threshold = 8;

      if (snapEnabled) {
        const centerX = project.width / 2;
        const layerCenterX = targetX + dragState.initialTransform.width / 2;
        if (Math.abs(layerCenterX - centerX) < threshold) {
          targetX = Math.round(centerX - dragState.initialTransform.width / 2);
          activeGuides.push({ type: 'x', position: centerX });
        }

        const centerY = project.height / 2;
        const layerCenterY = targetY + dragState.initialTransform.height / 2;
        if (Math.abs(layerCenterY - centerY) < threshold) {
          targetY = Math.round(centerY - dragState.initialTransform.height / 2);
          activeGuides.push({ type: 'y', position: centerY });
        }
      }

      setGuides(activeGuides);
      onUpdateLayerTransform(dragState.layerId, { x: targetX, y: targetY });
    } else if (dragState.mode === 'resize') {
      const init = dragState.initialTransform;
      let newW = init.width;
      let newH = init.height;
      let newX = init.x;
      let newY = init.y;

      switch (dragState.handle) {
        // 4 Corner handles (Proportional scaling for clean photo layout)
        case 'br':
          newW = Math.max(20, Math.round(init.width + dx));
          newH = Math.max(20, Math.round(init.height + dy));
          break;
        case 'bl':
          newW = Math.max(20, Math.round(init.width - dx));
          newH = Math.max(20, Math.round(init.height + dy));
          newX = init.x + (init.width - newW);
          break;
        case 'tr':
          newW = Math.max(20, Math.round(init.width + dx));
          newH = Math.max(20, Math.round(init.height - dy));
          newY = init.y + (init.height - newH);
          break;
        case 'tl':
          newW = Math.max(20, Math.round(init.width - dx));
          newH = Math.max(20, Math.round(init.height - dy));
          newX = init.x + (init.width - newW);
          newY = init.y + (init.height - newH);
          break;
        // 4 Side handles (Requirement 6)
        case 't':
          newH = Math.max(20, Math.round(init.height - dy));
          newY = init.y + (init.height - newH);
          break;
        case 'b':
          newH = Math.max(20, Math.round(init.height + dy));
          break;
        case 'l':
          newW = Math.max(20, Math.round(init.width - dx));
          newX = init.x + (init.width - newW);
          break;
        case 'r':
          newW = Math.max(20, Math.round(init.width + dx));
          break;
      }

      onUpdateLayerTransform(dragState.layerId, {
        width: newW,
        height: newH,
        x: newX,
        y: newY,
      });
    } else if (dragState.mode === 'rotate') {
      const init = dragState.initialTransform;
      const centerScreenX = (init.x + init.width / 2) * zoom + pan.x;
      const centerScreenY = (init.y + init.height / 2) * zoom + pan.y;

      const angleRad = Math.atan2(e.clientY - centerScreenY, e.clientX - centerScreenX);
      let angleDeg = Math.round((angleRad * 180) / Math.PI) + 90;
      if (angleDeg < 0) angleDeg += 360;
      angleDeg = angleDeg % 360;

      if (snapEnabled) {
        [0, 45, 90, 135, 180, 225, 270, 315, 360].forEach(snap => {
          if (Math.abs(angleDeg - snap) < 4) {
            angleDeg = snap % 360;
          }
        });
      }

      onUpdateLayerTransform(dragState.layerId, { rotation: angleDeg });
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
    setGuides([]);
  };

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);
  const perspectiveLayer = perspectiveLayerId
    ? (project.layers.find(l => l.id === perspectiveLayerId && l.type === 'image') as ImageLayer)
    : null;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative flex-1 w-full h-full bg-[#052E16] overflow-hidden select-none touch-none flex items-center justify-center cursor-default"
    >
      {/* Background Subtle Dot Pattern in dark green */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Workspace Canvas (Fixed scale, NOT mutated by gestures) */}
      <div
        id="canvas-wrapper"
        className="absolute shadow-2xl origin-top-left border border-emerald-900/50"
        style={{
          width: `${project.width}px`,
          height: `${project.height}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Design Background Layer */}
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden ${
            project.background.type === 'transparent' ? 'bg-checkerboard' : ''
          }`}
          style={{
            backgroundColor:
              project.background.type === 'color' ? project.background.color : undefined,
            backgroundImage:
              project.background.type === 'gradient' && project.background.gradient
                ? project.background.gradient.type === 'linear'
                  ? `linear-gradient(${project.background.gradient.angle}deg, ${project.background.gradient.stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`
                  : `radial-gradient(circle, ${project.background.gradient.stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`
                : project.background.type === 'image' && project.background.imageUrl
                ? `url(${project.background.imageUrl})`
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* EVERY LAYER IS AN INDEPENDENT OBJECT */}
        {project.layers.map((layer, index) => {
          if (!layer.visible) return null;
          const isSelected = selectedLayerId === layer.id;
          const t = layer.transform;

          return (
            <div
              key={layer.id}
              onPointerDown={e => handleLayerPointerDown(layer, e)}
              className={`absolute select-none ${
                layer.locked ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
              }`}
              style={{
                left: `${t.x}px`,
                top: `${t.y}px`,
                width: `${t.width}px`,
                height: `${t.height}px`,
                transform: `rotate(${t.rotation || 0}deg) scale(${t.scaleX || 1}, ${t.scaleY || 1})`,
                opacity: (layer.opacity ?? 100) / 100,
                transformOrigin: 'center center',
                zIndex: index + 1,
              }}
            >
              {/* IMAGE LAYER */}
              {layer.type === 'image' && (() => {
                const bc = layer.borderConfig;
                const hasBorder = bc ? bc.enabled : (layer.border && layer.border.width > 0);
                const borderWidth = bc ? (bc.enabled ? bc.width : 0) : (layer.border?.width || 0);
                const borderColor = bc ? bc.color : (layer.border?.color || '#FFFFFF');
                const borderOpacity = bc ? bc.opacity / 100 : 1;
                const borderStyle = bc ? bc.style : 'solid';
                const borderRadius = bc ? bc.radius : (layer.borderRadius || 0);
                const borderPadding = bc ? bc.padding : 0;

                let boxShadow = 'none';
                if (bc?.shadow?.enabled && bc.enabled) {
                  const s = bc.shadow;
                  boxShadow = `${s.offsetX}px ${s.offsetY}px ${s.blur}px rgba(0,0,0,${s.opacity / 100})`;
                } else if (layer.shadow) {
                  boxShadow = `${layer.shadow.offsetX}px ${layer.shadow.offsetY}px ${layer.shadow.blur}px ${layer.shadow.color}`;
                }

                let cleanHex = borderColor.replace('#', '');
                if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
                const num = parseInt(cleanHex, 16) || 0;
                const rgba = `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${borderOpacity})`;

                return (
                  <div
                    className="w-full h-full relative"
                    style={{
                      padding: `${borderPadding}px`,
                      borderRadius: `${borderRadius}px`,
                      borderWidth: hasBorder ? `${borderWidth}px` : '0px',
                      borderColor: hasBorder ? rgba : 'transparent',
                      borderStyle: borderStyle,
                      boxShadow: boxShadow,
                      transform: `${layer.flipX ? 'scaleX(-1)' : ''} ${layer.flipY ? 'scaleY(-1)' : ''}`,
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                  >
                    <img
                      src={layer.src}
                      alt={layer.name}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      style={{
                        borderRadius: `${Math.max(0, borderRadius - borderWidth)}px`,
                        transform: layer.perspective?.enabled
                          ? getPerspectiveMatrix3D(
                              t.width,
                              t.height,
                              layer.perspective.topLeft,
                              layer.perspective.topRight,
                              layer.perspective.bottomRight,
                              layer.perspective.bottomLeft
                            )
                          : undefined,
                        transformOrigin: '0 0',
                        filter: [
                          layer.effects?.brightness !== 0 ? `brightness(${100 + (layer.effects?.brightness || 0)}%)` : '',
                          layer.effects?.contrast !== 0 ? `contrast(${100 + (layer.effects?.contrast || 0)}%)` : '',
                          layer.effects?.saturation !== 0 ? `saturate(${100 + (layer.effects?.saturation || 0)}%)` : '',
                          layer.effects?.hue !== 0 ? `hue-rotate(${layer.effects?.hue || 0}deg)` : '',
                          layer.effects?.grayscale !== 0 ? `grayscale(${layer.effects?.grayscale || 0}%)` : '',
                          layer.effects?.sepia !== 0 ? `sepia(${layer.effects?.sepia || 0}%)` : '',
                          layer.effects?.blur !== 0 ? `blur(${layer.effects?.blur || 0}px)` : '',
                        ].filter(Boolean).join(' ') || undefined,
                      }}
                    />
                  </div>
                );
              })()}

              {/* TEXT LAYER */}
              {layer.type === 'text' && (
                <div
                  className="w-full h-full flex items-center select-none"
                  style={{
                    justifyContent:
                      layer.textAlign === 'center'
                        ? 'center'
                        : layer.textAlign === 'right'
                        ? 'flex-end'
                        : 'flex-start',
                  }}
                >
                  <div
                    className="leading-tight break-words select-none"
                    style={{
                      fontFamily: layer.fontFamily,
                      fontSize: `${layer.fontSize}px`,
                      fontWeight: layer.fontWeight,
                      fontStyle: layer.fontStyle,
                      textDecoration: layer.underline ? 'underline' : 'none',
                      textAlign: layer.textAlign,
                      letterSpacing: `${layer.letterSpacing || 0}px`,
                      color: layer.fillType === 'color' ? layer.color : undefined,
                      backgroundImage:
                        layer.fillType === 'linear-gradient' && layer.gradient
                          ? `linear-gradient(${layer.gradient.angle}deg, ${layer.gradient.stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`
                          : layer.fillType === 'radial-gradient' && layer.gradient
                          ? `radial-gradient(circle, ${layer.gradient.stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`
                          : undefined,
                      WebkitBackgroundClip: layer.fillType.includes('gradient') ? 'text' : undefined,
                      WebkitTextFillColor: layer.fillType.includes('gradient') ? 'transparent' : undefined,
                      WebkitTextStroke:
                        layer.stroke && layer.stroke.width > 0
                          ? `${layer.stroke.width}px ${layer.stroke.color}`
                          : undefined,
                      textShadow: generateCompositeTextShadow(layer),
                      backgroundColor: layer.background?.enabled ? layer.background.color : undefined,
                      padding: layer.background?.enabled
                        ? `${layer.background.paddingY}px ${layer.background.paddingX}px`
                        : undefined,
                      borderRadius: layer.background?.enabled
                        ? `${layer.background.borderRadius}px`
                        : undefined,
                    }}
                  >
                    {layer.text}
                  </div>
                </div>
              )}

              {/* STICKER LAYER */}
              {layer.type === 'sticker' && (
                <div
                  className="w-full h-full pointer-events-none drop-shadow-md select-none"
                  style={{
                    transform: `${layer.flipX ? 'scaleX(-1)' : ''} ${layer.flipY ? 'scaleY(-1)' : ''}`,
                  }}
                  dangerouslySetInnerHTML={{ __html: layer.svgContent }}
                />
              )}

              {/* SHAPE LAYER */}
              {layer.type === 'shape' && (
                <svg
                  viewBox={`0 0 ${t.width} ${t.height}`}
                  className="w-full h-full pointer-events-none"
                >
                  <path
                    d={renderShapeSVGPath(layer.shapeType, t.width, t.height)}
                    fill={layer.fillColor}
                    stroke={layer.strokeColor}
                    strokeWidth={layer.strokeWidth}
                  />
                </svg>
              )}

              {/* DRAWING LAYER */}
              {layer.type === 'drawing' && (
                <img
                  src={layer.dataUrl}
                  alt="Drawing"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              )}
            </div>
          );
        })}

        {/* Selected Layer Bounding Box & Handles (EXCLUSIVELY FOR SELECTED LAYER) */}
        {selectedLayer && !perspectiveLayerId && (
          <div
            className="absolute pointer-events-none z-30"
            style={{
              left: `${selectedLayer.transform.x}px`,
              top: `${selectedLayer.transform.y}px`,
              width: `${selectedLayer.transform.width}px`,
              height: `${selectedLayer.transform.height}px`,
              transform: `rotate(${selectedLayer.transform.rotation || 0}deg) scale(${selectedLayer.transform.scaleX || 1}, ${selectedLayer.transform.scaleY || 1})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Outline Box in GREEN */}
            <div
              className={`absolute inset-0 rounded-sm ${
                selectedLayer.locked
                  ? 'border-[2px] border-dashed border-emerald-400/70 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                  : 'border-[2px] border-[#22C55E] shadow-[0_0_14px_rgba(34,197,94,0.7)]'
              }`}
            />

            {/* Quick Floating Action Mini-Pill above bounding box (GREEN THEME) */}
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 pointer-events-auto bg-[#0B3D20]/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#15803D] shadow-2xl flex items-center gap-1.5 whitespace-nowrap text-white">
              <span className="text-[10px] font-extrabold text-[#22C55E] px-1 truncate max-w-[85px]">
                {selectedLayer.name}
              </span>
              <div className="h-3 w-px bg-[#15803D]" />

              {/* Requirement 7 & 8: BACKGROUND LOCK / UNLOCK TOGGLE */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onUpdateLayer(selectedLayer.id, { locked: !selectedLayer.locked });
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  selectedLayer.locked
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-neutral-300 hover:text-[#22C55E] hover:bg-[#15803D]/60'
                }`}
                title={selectedLayer.locked ? 'Locked (Tap to Unlock)' : 'Lock Layer'}
              >
                {selectedLayer.locked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span>Locked</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Lock</span>
                  </>
                )}
              </button>

              {!selectedLayer.locked && (
                <>
                  <div className="h-3 w-px bg-[#15803D]" />
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDuplicateLayer(selectedLayer.id);
                    }}
                    className="p-1 text-neutral-300 hover:text-white rounded hover:bg-[#15803D]/60 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onBringForward(selectedLayer.id);
                    }}
                    className="p-1 text-neutral-300 hover:text-white rounded hover:bg-[#15803D]/60 transition-colors"
                    title="Bring Forward"
                  >
                    <ChevronsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteLayer(selectedLayer.id);
                    }}
                    className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-[#15803D]/60 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Quick Photo Tools bar below selected image (GREEN THEME) */}
            {selectedLayer.type === 'image' && (
              <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 pointer-events-auto bg-[#0B3D20]/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#15803D] shadow-2xl flex items-center gap-1.5 text-xs whitespace-nowrap text-white">
                <button
                  onClick={onOpenBorder}
                  className="px-2 py-0.5 rounded text-[#22C55E] bg-[#15803D]/30 hover:bg-[#15803D] flex items-center gap-1 font-bold text-[11px]"
                >
                  <Frame className="w-3 h-3 text-[#22C55E]" />
                  <span>Border</span>
                </button>
                <button
                  onClick={onOpenCrop}
                  className="px-2 py-0.5 rounded text-neutral-200 hover:text-white hover:bg-[#15803D] flex items-center gap-1 font-semibold text-[11px]"
                >
                  <Crop className="w-3 h-3 text-emerald-400" />
                  <span>Crop</span>
                </button>
                <button
                  onClick={onOpenResize}
                  className="px-2 py-0.5 rounded text-neutral-200 hover:text-white hover:bg-[#15803D] flex items-center gap-1 font-semibold text-[11px]"
                >
                  <Maximize2 className="w-3 h-3 text-emerald-400" />
                  <span>Resize</span>
                </button>
                <button
                  onClick={() =>
                    onUpdateLayer(selectedLayer.id, {
                      flipX: !(selectedLayer as ImageLayer).flipX,
                    })
                  }
                  className="p-1 text-neutral-300 hover:text-white rounded hover:bg-[#15803D]"
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Handles only appear when layer is UNLOCKED */}
            {!selectedLayer.locked && (
              <>
                {/* Rotation Knob on Top in GREEN */}
                <div
                  onPointerDown={e => handleRotatePointerDown(selectedLayer, e)}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 w-7 h-7 -ml-3.5 -mt-3.5 rounded-full bg-[#22C55E] border-2 border-[#052E16] shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto hover:scale-125 transition-transform"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4 text-[#052E16] stroke-[3]" />
                </div>
                <div className="absolute -top-4 left-1/2 w-[2px] h-4 bg-[#22C55E] -translate-x-1/2" />

                {/* 4 Corner Resize Handles in GREEN (Requirement 6) */}
                {(['tl', 'tr', 'br', 'bl'] as const).map(handle => {
                  let posClass = '';
                  if (handle === 'tl') posClass = '-top-2.5 -left-2.5 cursor-nwse-resize';
                  if (handle === 'tr') posClass = '-top-2.5 -right-2.5 cursor-nesw-resize';
                  if (handle === 'br') posClass = '-bottom-2.5 -right-2.5 cursor-nwse-resize';
                  if (handle === 'bl') posClass = '-bottom-2.5 -left-2.5 cursor-nesw-resize';

                  return (
                    <div
                      key={handle}
                      onPointerDown={e => handleResizePointerDown(handle, selectedLayer, e)}
                      className={`absolute w-5 h-5 rounded-full bg-[#22C55E] border-2 border-[#052E16] shadow-md pointer-events-auto hover:scale-125 transition-transform ${posClass}`}
                    />
                  );
                })}

                {/* 4 Side Resize Handles in GREEN (Requirement 6) */}
                {(['t', 'r', 'b', 'l'] as const).map(side => {
                  let posClass = '';
                  if (side === 't') posClass = '-top-2 left-1/2 -translate-x-1/2 cursor-ns-resize';
                  if (side === 'b') posClass = '-bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize';
                  if (side === 'l') posClass = '-left-2 top-1/2 -translate-y-1/2 cursor-ew-resize';
                  if (side === 'r') posClass = '-right-2 top-1/2 -translate-y-1/2 cursor-ew-resize';

                  return (
                    <div
                      key={side}
                      onPointerDown={e => handleResizePointerDown(side, selectedLayer, e)}
                      className={`absolute w-4 h-4 rounded-full bg-[#16A34A] border-2 border-[#052E16] shadow-sm pointer-events-auto hover:scale-125 transition-transform ${posClass}`}
                    />
                  );
                })}
              </>
            )}

            {/* When locked, show a subtle center lock badge */}
            {selectedLayer.locked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-[#052E16]/85 text-[#22C55E] text-xs font-bold px-3 py-1 rounded-full border border-[#15803D] flex items-center gap-1.5 shadow">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Magnetic Guides Overlay */}
      <SmartGuides guides={guides} zoom={zoom} pan={pan} />

      {/* Perspective 4-Point Warp Pins Overlay */}
      {perspectiveLayer && (
        <PerspectivePins
          layer={perspectiveLayer}
          zoom={zoom}
          pan={pan}
          onApply={onApplyPerspective}
          onCancel={onCancelPerspective}
        />
      )}
    </div>
  );
};
