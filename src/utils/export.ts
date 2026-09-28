import { Project, Layer, TextLayer, ImageLayer, StickerLayer, ShapeLayer, DrawingLayer } from '../types/editor';
import { drawPerspectiveCanvas } from './perspective';
import { renderShapeSVGPath } from './shapes';

/**
 * High-Resolution Canvas Renderer with 8K Master Support
 * Renders multiple photos, text with 3D/gradients/fonts, stickers, shapes,
 * filters/effects, borders, layers, background removal alpha, and perspective warp.
 */
export async function exportProjectToCanvas(
  project: Project,
  targetWidth?: number,
  targetHeight?: number
): Promise<HTMLCanvasElement> {
  // Ensure all document fonts (custom & system) are loaded
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check bypassed', e);
    }
  }

  const exportW = Math.max(1, Math.round(targetWidth || project.width));
  const exportH = Math.max(1, Math.round(targetHeight || project.height));

  const scaleX = exportW / project.width;
  const scaleY = exportH / project.height;
  const scale = (scaleX + scaleY) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = exportW;
  canvas.height = exportH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Configure high-fidelity image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Design Background
  const bg = project.background;
  if (bg.type === 'color') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bg.type === 'gradient' && bg.gradient) {
    const angleRad = (bg.gradient.angle * Math.PI) / 180;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const length = Math.sqrt(cx * cx + cy * cy);
    const x0 = cx - Math.cos(angleRad) * length;
    const y0 = cy - Math.sin(angleRad) * length;
    const x1 = cx + Math.cos(angleRad) * length;
    const y1 = cy + Math.sin(angleRad) * length;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    bg.gradient.stops.forEach(s => grad.addColorStop(s.offset / 100, s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bg.type === 'image' && bg.imageUrl) {
    const img = await loadImage(bg.imageUrl);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } // 'transparent' leaves the alpha channel completely clean

  // 2. Draw Layers in order with independent transforms
  for (const layer of project.layers) {
    if (!layer.visible) continue;
    ctx.save();
    ctx.globalAlpha = (layer.opacity ?? 100) / 100;

    const t = layer.transform;
    const layerX = t.x * scaleX;
    const layerY = t.y * scaleY;
    const layerW = t.width * scaleX;
    const layerH = t.height * scaleY;

    const cx = layerX + layerW / 2;
    const cy = layerY + layerH / 2;

    ctx.translate(cx, cy);
    if (t.rotation) {
      ctx.rotate((t.rotation * Math.PI) / 180);
    }
    if (t.scaleX !== 1 || t.scaleY !== 1) {
      ctx.scale(t.scaleX, t.scaleY);
    }
    ctx.translate(-layerW / 2, -layerH / 2);

    if (layer.type === 'text') {
      await renderTextLayer(ctx, layer, layerW, layerH, scale);
    } else if (layer.type === 'image') {
      await renderImageLayer(ctx, layer, layerW, layerH, scaleX, scaleY, scale);
    } else if (layer.type === 'sticker') {
      await renderStickerLayer(ctx, layer, layerW, layerH, scale);
    } else if (layer.type === 'shape') {
      renderShapeLayer(ctx, layer, layerW, layerH, scale);
    } else if (layer.type === 'drawing') {
      await renderDrawingLayer(ctx, layer, layerW, layerH);
    }

    ctx.restore();
  }

  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function renderImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  width: number,
  height: number,
  scaleX: number,
  scaleY: number,
  scale: number
) {
  const img = await loadImage(layer.src);

  ctx.save();

  if (layer.flipX || layer.flipY) {
    ctx.translate(layer.flipX ? width : 0, layer.flipY ? height : 0);
    ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
  }

  const bc = layer.borderConfig;
  const hasBorder = bc ? bc.enabled : Boolean(layer.border && layer.border.width > 0);
  const borderWidth = (bc ? (bc.enabled ? bc.width : 0) : (layer.border?.width || 0)) * scale;
  const borderColor = bc ? bc.color : (layer.border?.color || '#FFFFFF');
  const borderOpacity = bc ? bc.opacity / 100 : 1;
  const borderRadius = (bc ? bc.radius : (layer.borderRadius || 0)) * scale;
  const borderPadding = (bc ? bc.padding : 0) * scale;

  // Layer Shadow / Photo Border Shadow
  if (bc?.shadow?.enabled && bc.enabled) {
    const s = bc.shadow;
    ctx.shadowColor = `rgba(0,0,0,${s.opacity / 100})`;
    ctx.shadowBlur = s.blur * scale;
    ctx.shadowOffsetX = s.offsetX * scale;
    ctx.shadowOffsetY = s.offsetY * scale;
  } else if (layer.shadow) {
    ctx.shadowColor = layer.shadow.color;
    ctx.shadowBlur = layer.shadow.blur * scale;
    ctx.shadowOffsetX = layer.shadow.offsetX * scale;
    ctx.shadowOffsetY = layer.shadow.offsetY * scale;
  }

  // Rounded corners clip
  if (borderRadius > 0) {
    ctx.beginPath();
    ctx.roundRect(
      borderPadding,
      borderPadding,
      Math.max(1, width - borderPadding * 2),
      Math.max(1, height - borderPadding * 2),
      Math.max(0, borderRadius - borderWidth)
    );
    ctx.clip();
  }

  // Image Effects / Filters (Brightness, Contrast, Saturation, Hue, Grayscale, Sepia, Blur)
  const filterList: string[] = [];
  if (layer.effects) {
    if (layer.effects.brightness !== 0) {
      filterList.push(`brightness(${100 + layer.effects.brightness}%)`);
    }
    if (layer.effects.contrast !== 0) {
      filterList.push(`contrast(${100 + layer.effects.contrast}%)`);
    }
    if (layer.effects.saturation !== 0) {
      filterList.push(`saturate(${100 + layer.effects.saturation}%)`);
    }
    if (layer.effects.hue !== 0) {
      filterList.push(`hue-rotate(${layer.effects.hue}deg)`);
    }
    if (layer.effects.grayscale !== 0) {
      filterList.push(`grayscale(${layer.effects.grayscale}%)`);
    }
    if (layer.effects.sepia !== 0) {
      filterList.push(`sepia(${layer.effects.sepia}%)`);
    }
    if (layer.effects.blur > 0) {
      filterList.push(`blur(${Math.max(0.5, layer.effects.blur * scale)}px)`);
    }
  }

  if (filterList.length > 0) {
    ctx.filter = filterList.join(' ');
  }

  // Perspective 4-corner warp or standard draw
  const drawW = Math.max(1, width - borderPadding * 2);
  const drawH = Math.max(1, height - borderPadding * 2);

  if (layer.perspective?.enabled) {
    const { topLeft, topRight, bottomRight, bottomLeft } = layer.perspective;
    const scaledTL = { x: topLeft.x * scaleX, y: topLeft.y * scaleY };
    const scaledTR = { x: topRight.x * scaleX, y: topRight.y * scaleY };
    const scaledBR = { x: bottomRight.x * scaleX, y: bottomRight.y * scaleY };
    const scaledBL = { x: bottomLeft.x * scaleX, y: bottomLeft.y * scaleY };

    // High subdivisions for ultra-smooth 8K homography
    const subdivisions = Math.max(24, Math.min(48, Math.round(16 * Math.sqrt(Math.max(scaleX, scaleY)))));
    drawPerspectiveCanvas(ctx, img, drawW, drawH, scaledTL, scaledTR, scaledBR, scaledBL, subdivisions);
  } else {
    ctx.drawImage(img, borderPadding, borderPadding, drawW, drawH);
  }

  // Clear filter before stroke
  ctx.filter = 'none';

  // Draw Border Stroke
  if (hasBorder && borderWidth > 0) {
    ctx.shadowColor = 'transparent';
    let cleanHex = borderColor.replace('#', '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
    const num = parseInt(cleanHex, 16) || 0;
    ctx.strokeStyle = `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${borderOpacity})`;
    ctx.lineWidth = borderWidth;

    if (bc?.style === 'dashed') {
      ctx.setLineDash([borderWidth * 2, borderWidth]);
    } else if (bc?.style === 'dotted') {
      ctx.setLineDash([borderWidth, borderWidth]);
    } else {
      ctx.setLineDash([]);
    }

    const halfW = borderWidth / 2;
    ctx.beginPath();
    if (borderRadius > 0) {
      ctx.roundRect(
        halfW,
        halfW,
        Math.max(1, width - borderWidth),
        Math.max(1, height - borderWidth),
        borderRadius
      );
    } else {
      ctx.rect(halfW, halfW, Math.max(1, width - borderWidth), Math.max(1, height - borderWidth));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

async function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  width: number,
  height: number,
  scale: number
) {
  ctx.save();

  const scaledPaddingX = (layer.background?.paddingX || 0) * scale;
  const scaledPaddingY = (layer.background?.paddingY || 0) * scale;
  const scaledBorderRadius = (layer.background?.borderRadius || 0) * scale;

  // Background box
  if (layer.background?.enabled) {
    const bg = layer.background;
    ctx.fillStyle = bg.color;
    ctx.globalAlpha = (bg.opacity / 100) * ((layer.opacity ?? 100) / 100);
    ctx.beginPath();
    ctx.roundRect(
      -scaledPaddingX,
      -scaledPaddingY,
      width + scaledPaddingX * 2,
      height + scaledPaddingY * 2,
      scaledBorderRadius
    );
    ctx.fill();
    ctx.globalAlpha = (layer.opacity ?? 100) / 100;
  }

  const fontStyle = layer.fontStyle === 'italic' ? 'italic' : 'normal';
  const fontWeight = layer.fontWeight || '700';
  const fontSize = (layer.fontSize || 40) * scale;
  const fontFamily = layer.fontFamily || 'sans-serif';
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = layer.textAlign === 'justify' ? 'left' : (layer.textAlign || 'left');
  ctx.textBaseline = 'middle';

  // Letter spacing
  if (layer.letterSpacing && 'letterSpacing' in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${layer.letterSpacing * scale}px`;
  }

  let posX = 0;
  if (layer.textAlign === 'center') posX = width / 2;
  else if (layer.textAlign === 'right') posX = width;
  const posY = height / 2;

  // 3D extrusion rendering in Canvas
  if (layer.threeD?.enabled) {
    const depth = Math.max(1, Math.min(80, Math.round((layer.threeD.depth || 10) * scale)));
    const rad = (layer.threeD.angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    ctx.fillStyle = layer.threeD.color || '#333333';
    for (let i = depth; i >= 1; i--) {
      ctx.fillText(layer.text, posX + i * cos, posY + i * sin);
    }
  }

  // Drop Shadow
  if (layer.shadow) {
    ctx.shadowColor = layer.shadow.color;
    ctx.shadowBlur = layer.shadow.blur * scale;
    ctx.shadowOffsetX = layer.shadow.offsetX * scale;
    ctx.shadowOffsetY = layer.shadow.offsetY * scale;
  }

  // Fill
  if (layer.fillType === 'linear-gradient' && layer.gradient) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    layer.gradient.stops.forEach(s => grad.addColorStop(s.offset / 100, s.color));
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = layer.color || '#ffffff';
  }

  // Stroke
  if (layer.stroke && layer.stroke.width > 0) {
    ctx.strokeStyle = layer.stroke.color;
    ctx.lineWidth = layer.stroke.width * 2 * scale;
    ctx.lineJoin = 'round';
    ctx.strokeText(layer.text, posX, posY);
  }

  ctx.fillText(layer.text, posX, posY);

  ctx.restore();
}

async function renderStickerLayer(
  ctx: CanvasRenderingContext2D,
  layer: StickerLayer,
  width: number,
  height: number,
  scale: number
) {
  let svg = layer.svgContent || '';
  // Ensure the SVG scales natively to high-resolution export dimensions
  if (!svg.includes('viewBox') && width > 0 && height > 0) {
    svg = svg.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
  }
  const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  const img = await loadImage(svgUrl);

  ctx.save();
  if (layer.shadow) {
    ctx.shadowColor = layer.shadow.color;
    ctx.shadowBlur = layer.shadow.blur * scale;
    ctx.shadowOffsetX = layer.shadow.offsetX * scale;
    ctx.shadowOffsetY = layer.shadow.offsetY * scale;
  }

  if (layer.flipX || layer.flipY) {
    ctx.translate(layer.flipX ? width : 0, layer.flipY ? height : 0);
    ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
  }

  ctx.drawImage(img, 0, 0, width, height);
  ctx.restore();
}

function renderShapeLayer(
  ctx: CanvasRenderingContext2D,
  layer: ShapeLayer,
  width: number,
  height: number,
  scale: number
) {
  ctx.save();

  if (layer.shadow) {
    ctx.shadowColor = layer.shadow.color;
    ctx.shadowBlur = layer.shadow.blur * scale;
    ctx.shadowOffsetX = layer.shadow.offsetX * scale;
    ctx.shadowOffsetY = layer.shadow.offsetY * scale;
  }

  const path = new Path2D(renderShapeSVGPath(layer.shapeType, width, height));

  if (layer.fillType === 'gradient' && layer.gradient) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    layer.gradient.stops.forEach(s => grad.addColorStop(s.offset / 100, s.color));
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = layer.fillColor;
  }
  ctx.fill(path);

  if (layer.strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = layer.strokeWidth * scale;
    ctx.stroke(path);
  }

  ctx.restore();
}

async function renderDrawingLayer(
  ctx: CanvasRenderingContext2D,
  layer: DrawingLayer,
  width: number,
  height: number
) {
  if (layer.dataUrl) {
    const img = await loadImage(layer.dataUrl);
    ctx.drawImage(img, 0, 0, width, height);
  }
}

/**
 * Encodes canvas to Blob with quality parameter and alpha transparency handling
 */
export async function exportProjectToBlob(
  project: Project,
  targetWidth?: number,
  targetHeight?: number,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality = 1.0
): Promise<Blob> {
  const canvas = await exportProjectToCanvas(project, targetWidth, targetHeight);
  const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

  // For JPEG without transparency, render over solid background if transparent
  let exportCanvas = canvas;
  if (format === 'jpeg' && project.background.type === 'transparent') {
    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = canvas.width;
    flatCanvas.height = canvas.height;
    const flatCtx = flatCanvas.getContext('2d');
    if (flatCtx) {
      flatCtx.fillStyle = '#FFFFFF';
      flatCtx.fillRect(0, 0, flatCanvas.width, flatCanvas.height);
      flatCtx.drawImage(canvas, 0, 0);
      exportCanvas = flatCanvas;
    }
  }

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode image blob from canvas'));
      },
      mime,
      quality
    );
  });
}

/**
 * Downloads the exported project at up to 8K resolution
 */
export async function downloadProjectImage(
  project: Project,
  targetWidth?: number,
  targetHeight?: number,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality = 1.0,
  filename?: string
): Promise<void> {
  const blob = await exportProjectToBlob(project, targetWidth, targetHeight, format, quality);
  const ext = format === 'jpeg' ? 'jpg' : format;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || project.name || 'PhotoDesign_8K'}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Shares high-resolution project image using Web Share API
 */
export async function shareProjectImage(
  project: Project,
  targetWidth?: number,
  targetHeight?: number,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality = 1.0
): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    const blob = await exportProjectToBlob(project, targetWidth, targetHeight, format, quality);
    const ext = format === 'jpeg' ? 'jpg' : format;
    const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const file = new File([blob], `${project.name || 'PhotoDesign'}.${ext}`, { type: mime });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: project.name || 'Photo Design Master Export',
        files: [file],
      });
      return true;
    }
  } catch (e) {
    console.warn('Share canceled or failed', e);
  }
  return false;
}
