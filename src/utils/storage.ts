import { Preset, Project } from '../types/editor';

const PROJECTS_KEY = 'designlab_projects_v1';
const USER_PRESETS_KEY = 'designlab_user_presets_v1';
const SETTINGS_KEY = 'designlab_settings_v1';

export interface EditorSettings {
  exportFormat: 'png' | 'jpeg';
  exportQuality: number; // 0.7 to 1.0
  snapToGuides: boolean;
  showGrid: boolean;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  exportFormat: 'png',
  exportQuality: 0.95,
  snapToGuides: true,
  showGrid: false,
};

export const BUILTIN_PRESETS: Preset[] = [
  {
    id: 'preset_yt_thumbnail',
    name: 'YouTube Viral Thumbnail',
    category: 'YouTube',
    description: 'High impact 3D typography with gaming/vlog badge & vibrant gradients',
    thumbnail: '',
    project: {
      id: 'p_yt',
      name: 'YouTube Thumbnail',
      updatedAt: Date.now(),
      width: 1280,
      height: 720,
      background: {
        type: 'gradient',
        color: '#0F172A',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { offset: 0, color: '#0F172A' },
            { offset: 50, color: '#1E1B4B' },
            { offset: 100, color: '#4C1D95' },
          ],
        },
      },
      layers: [
        {
          id: 'ly_yt_title',
          name: 'HEADLINE',
          type: 'text',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 80, y: 140, width: 700, height: 160, rotation: -3, scaleX: 1, scaleY: 1 },
          text: 'MASTER CLASS',
          fontFamily: "'Anton', sans-serif",
          fontSize: 105,
          fontWeight: '900',
          fontStyle: 'normal',
          underline: false,
          textAlign: 'left',
          letterSpacing: 2,
          lineHeight: 1.1,
          fillType: 'linear-gradient',
          color: '#FACC15',
          gradient: {
            type: 'linear',
            angle: 90,
            stops: [
              { offset: 0, color: '#FFF275' },
              { offset: 50, color: '#F59E0B' },
              { offset: 100, color: '#D97706' },
            ],
          },
          stroke: { width: 5, color: '#000000', opacity: 100 },
          shadow: { color: '#000000', blur: 18, offsetX: 6, offsetY: 8, opacity: 85 },
          threeD: {
            enabled: true,
            depth: 14,
            angle: 60,
            color: '#78350F',
            darken: 50,
            lightAngle: 45,
            lighting: 80,
            preset: 'gold',
          },
        },
        {
          id: 'ly_yt_sub',
          name: 'SUB-TEXT',
          type: 'text',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 90, y: 310, width: 620, height: 70, rotation: -2, scaleX: 1, scaleY: 1 },
          text: 'PRO EDITING SECRETS 2026',
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 48,
          fontWeight: '700',
          fontStyle: 'normal',
          underline: false,
          textAlign: 'left',
          letterSpacing: 3,
          lineHeight: 1.2,
          fillType: 'color',
          color: '#FFFFFF',
          stroke: { width: 3, color: '#000000', opacity: 100 },
          shadow: { color: '#000000', blur: 12, offsetX: 3, offsetY: 4, opacity: 75 },
        },
        {
          id: 'ly_yt_badge',
          name: 'LIVE BADGE',
          type: 'sticker',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 80, y: 55, width: 140, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          stickerId: 'news_live',
          category: 'News',
          svgContent: '',
          flipX: false,
          flipY: false,
        },
        {
          id: 'ly_yt_fire',
          name: 'FIRE ICON',
          type: 'sticker',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 700, y: 90, width: 110, height: 110, rotation: 12, scaleX: 1, scaleY: 1 },
          stickerId: 'emoji_fire',
          category: 'Reaction',
          svgContent: '',
          flipX: false,
          flipY: false,
        }
      ],
    },
  },
  {
    id: 'preset_mega_sale',
    name: 'Mega Sale Promotion',
    category: 'E-Commerce',
    description: 'Gold 3D promotional banner with 50% off discount badge',
    thumbnail: '',
    project: {
      id: 'p_sale',
      name: 'Mega Sale 50% Off',
      updatedAt: Date.now(),
      width: 1080,
      height: 1080,
      background: {
        type: 'gradient',
        color: '#831843',
        gradient: {
          type: 'linear',
          angle: 160,
          stops: [
            { offset: 0, color: '#500724' },
            { offset: 50, color: '#831843' },
            { offset: 100, color: '#BE185D' },
          ],
        },
      },
      layers: [
        {
          id: 'ly_sale_heading',
          name: 'SALE TITLE',
          type: 'text',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 90, y: 180, width: 900, height: 180, rotation: 0, scaleX: 1, scaleY: 1 },
          text: 'MEGA SALE',
          fontFamily: "'Anton', sans-serif",
          fontSize: 130,
          fontWeight: '900',
          fontStyle: 'normal',
          underline: false,
          textAlign: 'center',
          letterSpacing: 4,
          lineHeight: 1,
          fillType: 'color',
          color: '#FACC15',
          stroke: { width: 5, color: '#450A0A', opacity: 100 },
          shadow: { color: '#000000', blur: 24, offsetX: 5, offsetY: 10, opacity: 80 },
          threeD: {
            enabled: true,
            depth: 18,
            angle: 75,
            color: '#B45309',
            darken: 50,
            lightAngle: 30,
            lighting: 85,
            preset: 'gold',
          },
        },
        {
          id: 'ly_sale_badge',
          name: 'DISCOUNT BADGE',
          type: 'sticker',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 440, y: 440, width: 200, height: 200, rotation: -12, scaleX: 1, scaleY: 1 },
          stickerId: 'badge_sale_50',
          category: 'Badge',
          svgContent: '',
          flipX: false,
          flipY: false,
        },
        {
          id: 'ly_sale_sub',
          name: 'SUBTITLE',
          type: 'text',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 140, y: 720, width: 800, height: 90, rotation: 0, scaleX: 1, scaleY: 1 },
          text: 'LIMITED TIME ONLY • ORDER NOW',
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 34,
          fontWeight: '900',
          fontStyle: 'normal',
          underline: false,
          textAlign: 'center',
          letterSpacing: 3,
          lineHeight: 1.2,
          fillType: 'color',
          color: '#FFFFFF',
          shadow: { color: '#000000', blur: 10, offsetX: 0, offsetY: 4, opacity: 60 },
        },
      ],
    },
  },
  {
    id: 'preset_breaking_news',
    name: 'Breaking News Banner',
    category: 'News',
    description: 'Broadcast news styling with headline and live ticker',
    thumbnail: '',
    project: {
      id: 'p_news',
      name: 'Breaking News',
      updatedAt: Date.now(),
      width: 1280,
      height: 720,
      background: {
        type: 'gradient',
        color: '#1E293B',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { offset: 0, color: '#0F172A' },
            { offset: 100, color: '#1E293B' },
          ],
        },
      },
      layers: [
        {
          id: 'ly_news_banner',
          name: 'BREAKING BADGE',
          type: 'sticker',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 60, y: 380, width: 320, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
          stickerId: 'news_breaking',
          category: 'News',
          svgContent: '',
          flipX: false,
          flipY: false,
        },
        {
          id: 'ly_news_headline',
          name: 'HEADLINE',
          type: 'text',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 60, y: 470, width: 1160, height: 130, rotation: 0, scaleX: 1, scaleY: 1 },
          text: 'BIGGEST ANNOUNCEMENT OF THE YEAR',
          fontFamily: "'Anton', sans-serif",
          fontSize: 72,
          fontWeight: '900',
          fontStyle: 'normal',
          underline: false,
          textAlign: 'left',
          letterSpacing: 2,
          lineHeight: 1.1,
          fillType: 'color',
          color: '#FFFFFF',
          stroke: { width: 3, color: '#000000', opacity: 100 },
          background: {
            enabled: true,
            color: '#DC2626',
            paddingX: 20,
            paddingY: 10,
            borderRadius: 6,
            opacity: 95,
          },
        },
      ],
    },
  },
  {
    id: 'preset_hindi_quote',
    name: 'Hindi Royal Quote (शाही उद्धरण)',
    category: 'Social',
    description: 'Devanagari serif typography with regal gold flourish',
    thumbnail: '',
    project: {
      id: 'p_quote',
      name: 'Hindi Quote',
      updatedAt: Date.now(),
      width: 1080,
      height: 1080,
      background: {
        type: 'gradient',
        color: '#0A0A0A',
        gradient: {
          type: 'radial',
          angle: 0,
          stops: [
            { offset: 0, color: '#27272A' },
            { offset: 100, color: '#09090B' },
          ],
        },
      },
      layers: [
        {
          id: 'ly_hindi_title',
          name: 'HINDI QUOTE',
          type: 'text',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 80, y: 320, width: 920, height: 260, rotation: 0, scaleX: 1, scaleY: 1 },
          text: 'सफलता का रहस्य केवल निरंतर प्रयास है',
          fontFamily: "'Rozha One', serif",
          fontSize: 68,
          fontWeight: '900',
          fontStyle: 'normal',
          underline: false,
          textAlign: 'center',
          letterSpacing: 1,
          lineHeight: 1.4,
          fillType: 'linear-gradient',
          color: '#FACC15',
          gradient: {
            type: 'linear',
            angle: 90,
            stops: [
              { offset: 0, color: '#FEF08A' },
              { offset: 50, color: '#FACC15' },
              { offset: 100, color: '#CA8A04' },
            ],
          },
          shadow: { color: '#000000', blur: 20, offsetX: 0, offsetY: 8, opacity: 80 },
          threeD: {
            enabled: true,
            depth: 8,
            angle: 90,
            color: '#713F12',
            darken: 60,
            lightAngle: 45,
            lighting: 70,
            preset: 'gold',
          },
        },
        {
          id: 'ly_hindi_crown',
          name: 'CROWN',
          type: 'sticker',
          visible: true,
          locked: false,
          opacity: 100,
          transform: { x: 460, y: 190, width: 160, height: 110, rotation: 0, scaleX: 1, scaleY: 1 },
          stickerId: 'dec_crown',
          category: 'Decorative',
          svgContent: '',
          flipX: false,
          flipY: false,
        },
      ],
    },
  },
];

// Helper to safely serialize projects without crashing on quota exceeded
function sanitizeProjectForStorage(project: Project): Project {
  // Deep clone to avoid mutating in-memory project
  return {
    ...project,
    layers: project.layers.map(layer => {
      if (layer.type === 'image') {
        const src = layer.src || '';
        // If image src is a huge data URL (> 200KB), truncate or remove duplicate originalSrc
        // but keep src intact if possible or compress if needed
        return {
          ...layer,
          // Strip duplicate originalSrc to cut storage footprint in half
          originalSrc: layer.originalSrc === layer.src ? '' : layer.originalSrc.length > 50000 ? '' : layer.originalSrc,
        };
      }
      return layer;
    }),
  };
}

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed: Project[] = JSON.parse(raw);
    // Restore any stripped originalSrc from src
    return parsed.map(p => ({
      ...p,
      layers: p.layers.map(l => {
        if (l.type === 'image' && !l.originalSrc) {
          return { ...l, originalSrc: l.src };
        }
        return l;
      }),
    }));
  } catch (e) {
    console.error('Failed to get projects', e);
    return [];
  }
}

export function saveProject(project: Project): void {
  try {
    const projects = getProjects();
    const cleanProj = sanitizeProjectForStorage(project);
    const idx = projects.findIndex(p => p.id === cleanProj.id);
    if (idx >= 0) {
      projects[idx] = { ...cleanProj, updatedAt: Date.now() };
    } else {
      projects.unshift({ ...cleanProj, updatedAt: Date.now() });
    }

    // Try saving progressively smaller subsets if quota is exceeded
    const attempts = [10, 5, 3, 1];
    for (const count of attempts) {
      try {
        const trimmed = projects.slice(0, count);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(trimmed));
        return;
      } catch (err: unknown) {
        if (err instanceof Error && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          console.warn(`LocalStorage quota exceeded saving ${count} projects, trying smaller set...`);
          continue;
        }
        throw err;
      }
    }

    // If still failing, try saving only current project with minimal layer data
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify([cleanProj]));
    } catch (finalErr) {
      console.warn('Unable to persist project to localStorage due to device quota limits:', finalErr);
    }
  } catch (e) {
    console.warn('Could not save project to localStorage:', e);
  }
}

export function deleteProject(id: string): void {
  try {
    const projects = getProjects().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to delete project', e);
  }
}

export function getUserPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(USER_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to get user presets', e);
    return [];
  }
}

export function saveUserPreset(preset: Preset): void {
  try {
    const presets = getUserPresets();
    const idx = presets.findIndex(p => p.id === preset.id);
    if (idx >= 0) {
      presets[idx] = preset;
    } else {
      presets.unshift(preset);
    }
    localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save preset', e);
  }
}

export function deleteUserPreset(id: string): void {
  try {
    const presets = getUserPresets().filter(p => p.id !== id);
    localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to delete user preset', e);
  }
}

export function getSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
