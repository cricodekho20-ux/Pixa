import { TextLayer, ThreeDTextEffect } from '../types/editor';

export interface ThreeDPresetConfig {
  name: string;
  depth: number;
  angle: number;
  color: string;
  darken: number;
  lightAngle: number;
  lighting: number;
  gradient?: {
    type: 'linear' | 'radial';
    angle: number;
    stops: { offset: number; color: string }[];
  };
  stroke?: { width: number; color: string; opacity: number };
}

export const THREE_D_PRESETS: Record<string, ThreeDPresetConfig> = {
  gold: {
    name: 'Gold 3D',
    depth: 16,
    angle: 60,
    color: '#854D0E',
    darken: 60,
    lightAngle: 45,
    lighting: 85,
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { offset: 0, color: '#FEF08A' },
        { offset: 40, color: '#FACC15' },
        { offset: 70, color: '#CA8A04' },
        { offset: 100, color: '#A16207' },
      ],
    },
    stroke: { width: 2, color: '#78350F', opacity: 90 },
  },
  chrome: {
    name: 'Chrome 3D',
    depth: 18,
    angle: 70,
    color: '#1E293B',
    darken: 70,
    lightAngle: 40,
    lighting: 95,
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { offset: 0, color: '#FFFFFF' },
        { offset: 45, color: '#94A3B8' },
        { offset: 50, color: '#0F172A' },
        { offset: 80, color: '#CBD5E1' },
        { offset: 100, color: '#E2E8F0' },
      ],
    },
    stroke: { width: 2, color: '#0F172A', opacity: 90 },
  },
  metal: {
    name: 'Metal 3D',
    depth: 14,
    angle: 65,
    color: '#334155',
    darken: 55,
    lightAngle: 45,
    lighting: 75,
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { offset: 0, color: '#E2E8F0' },
        { offset: 50, color: '#64748B' },
        { offset: 100, color: '#334155' },
      ],
    },
    stroke: { width: 3, color: '#1E293B', opacity: 80 },
  },
  neon: {
    name: 'Neon Glow 3D',
    depth: 12,
    angle: 45,
    color: '#831843',
    darken: 30,
    lightAngle: 90,
    lighting: 100,
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { offset: 0, color: '#FFFFFF' },
        { offset: 100, color: '#F43F5E' },
      ],
    },
    stroke: { width: 4, color: '#FB7185', opacity: 90 },
  },
  plastic: {
    name: 'Plastic 3D',
    depth: 15,
    angle: 75,
    color: '#0369A1',
    darken: 45,
    lightAngle: 30,
    lighting: 70,
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { offset: 0, color: '#38BDF8' },
        { offset: 100, color: '#0284C7' },
      ],
    },
  },
  classic: {
    name: 'Classic 3D',
    depth: 20,
    angle: 55,
    color: '#000000',
    darken: 70,
    lightAngle: 60,
    lighting: 60,
  },
  bold: {
    name: 'Bold Extrude',
    depth: 28,
    angle: 90,
    color: '#111827',
    darken: 80,
    lightAngle: 45,
    lighting: 60,
    stroke: { width: 4, color: '#000000', opacity: 100 },
  },
};

// Generates the multi-step CSS text-shadow for extruded 3D text
export function generate3DTextShadow(effect: ThreeDTextEffect): string {
  if (!effect || !effect.enabled) return '';

  const depth = Math.max(1, Math.min(50, effect.depth));
  const rad = (effect.angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const baseHex = effect.color || '#000000';
  const shadows: string[] = [];

  for (let i = 1; i <= depth; i++) {
    const x = (i * cos).toFixed(1);
    const y = (i * sin).toFixed(1);
    
    // Progressively darken deeper layers
    const darkenFactor = (i / depth) * (effect.darken / 100);
    const layerColor = adjustColorDarkness(baseHex, darkenFactor);
    shadows.push(`${x}px ${y}px 0px ${layerColor}`);
  }

  // Add the ambient ground shadow behind the extrusion
  const dropX = ((depth + 4) * cos).toFixed(1);
  const dropY = ((depth + 6) * sin).toFixed(1);
  shadows.push(`${dropX}px ${dropY}px 14px rgba(0,0,0,0.65)`);

  return shadows.join(', ');
}

function adjustColorDarkness(hex: string, factor: number): string {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.max(0, Math.min(255, Math.round(r * (1 - factor * 0.7))));
  g = Math.max(0, Math.min(255, Math.round(g * (1 - factor * 0.7))));
  b = Math.max(0, Math.min(255, Math.round(b * (1 - factor * 0.7))));

  return `rgb(${r}, ${g}, ${b})`;
}

// Generate CSS text-shadow for normal shadow + inner shadow + reflection + glow
export function generateCompositeTextShadow(layer: TextLayer): string {
  const parts: string[] = [];

  // 1. 3D shadow extrusion
  if (layer.threeD?.enabled) {
    parts.push(generate3DTextShadow(layer.threeD));
  }

  // 2. Regular drop shadow
  if (layer.shadow) {
    const s = layer.shadow;
    const alpha = s.opacity / 100;
    parts.push(`${s.offsetX}px ${s.offsetY}px ${s.blur}px ${hexToRgba(s.color, alpha)}`);
  }

  return parts.filter(Boolean).join(', ');
}

function hexToRgba(hex: string, alpha: number): string {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
