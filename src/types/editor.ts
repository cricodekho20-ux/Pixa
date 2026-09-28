export type LayerType = 'image' | 'text' | 'sticker' | 'shape' | 'drawing';

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  scaleX: number;
  scaleY: number;
}

export interface ShadowEffect {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface StrokeEffect {
  width: number;
  color: string;
  opacity: number;
}

export interface ColorStop {
  offset: number; // 0 to 100
  color: string;
}

export interface GradientFill {
  type: 'linear' | 'radial';
  angle: number; // in degrees
  stops: ColorStop[];
}

export interface ThreeDTextEffect {
  enabled: boolean;
  depth: number; // 1 to 50
  angle: number; // 0 to 360
  color: string;
  darken: number; // 0 to 100%
  lightAngle: number; // 0 to 360
  lighting: number; // intensity
  preset?: 'gold' | 'chrome' | 'metal' | 'neon' | 'plastic' | 'classic' | 'bold';
}

export interface CurvedTextEffect {
  enabled: boolean;
  angle: number; // -180 to 180 degrees (arc curvature)
}

export interface TextLayer {
  id: string;
  name: string;
  type: 'text';
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: Transform;
  
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  underline: boolean;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number; // tracking in px
  lineHeight: number; // em
  
  fillType: 'color' | 'linear-gradient' | 'radial-gradient' | 'texture';
  color: string;
  gradient?: GradientFill;
  textureUrl?: string;
  
  stroke?: StrokeEffect;
  shadow?: ShadowEffect;
  innerShadow?: ShadowEffect;
  
  background?: {
    enabled: boolean;
    color: string;
    paddingX: number;
    paddingY: number;
    borderRadius: number;
    opacity: number;
  };
  
  reflection?: {
    enabled: boolean;
    offset: number;
    opacity: number;
  };
  
  threeD?: ThreeDTextEffect;
  curved?: CurvedTextEffect;
  emboss?: {
    enabled: boolean;
    angle: number;
    intensity: number;
  };
}

export interface ImageEffects {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // 0 to 360
  exposure: number; // -100 to 100
  temperature: number; // -100 to 100
  blur: number; // 0 to 50
  sharpen: number; // 0 to 100
  vignette: number; // 0 to 100
  grayscale: number; // 0 to 100
  sepia: number; // 0 to 100
  noise: number; // 0 to 100
  stripes: number; // 0 to 100
}

export interface CornerPin {
  x: number;
  y: number;
}

export interface PerspectiveConfig {
  enabled: boolean;
  topLeft: CornerPin;
  topRight: CornerPin;
  bottomRight: CornerPin;
  bottomLeft: CornerPin;
}

export interface ChromaKeyConfig {
  enabled: boolean;
  color: string; // hex
  tolerance: number; // 0 to 100
  feather: number; // 0 to 50
  edgeSmoothing: number; // 0 to 20
}

export interface PhotoBorderConfig {
  enabled: boolean;
  color: string;
  width: number; // thickness in px (1 - 60)
  opacity: number; // 0 - 100%
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'inset';
  radius: number; // rounded corners in px (0 - 120)
  padding: number; // frame matte padding (0 - 40)
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
  };
}

export interface ImageLayer {
  id: string;
  name: string;
  type: 'image';
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: Transform;
  
  src: string;
  originalSrc: string; // preserved for re-filtering or chroma reset
  naturalWidth: number;
  naturalHeight: number;
  
  flipX: boolean;
  flipY: boolean;
  borderRadius: number;
  border?: StrokeEffect;
  borderConfig?: PhotoBorderConfig;
  shadow?: ShadowEffect;
  mask?: 'none' | 'circle' | 'rounded' | 'heart' | 'star' | 'squircle' | 'diamond';
  
  effects: ImageEffects;
  perspective: PerspectiveConfig;
  chromaKey?: ChromaKeyConfig;
}

export interface StickerLayer {
  id: string;
  name: string;
  type: 'sticker';
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: Transform;
  
  stickerId: string;
  category: string;
  svgContent: string;
  color?: string; // tint
  flipX: boolean;
  flipY: boolean;
  shadow?: ShadowEffect;
}

export type ShapeType = 'rectangle' | 'rounded-rect' | 'circle' | 'ellipse' | 'triangle' | 'star' | 'polygon' | 'line' | 'arrow' | 'heart' | 'diamond';

export interface ShapeLayer {
  id: string;
  name: string;
  type: 'shape';
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: Transform;
  
  shapeType: ShapeType;
  fillType: 'color' | 'gradient';
  fillColor: string;
  gradient?: GradientFill;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
  flipX?: boolean;
  flipY?: boolean;
  shadow?: ShadowEffect;
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
  tool: 'pen' | 'brush' | 'eraser';
}

export interface DrawingLayer {
  id: string;
  name: string;
  type: 'drawing';
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: Transform;
  
  dataUrl: string;
  paths: DrawingPath[];
  shadow?: ShadowEffect;
}

export type Layer = TextLayer | ImageLayer | StickerLayer | ShapeLayer | DrawingLayer;

export interface DesignBackground {
  type: 'color' | 'gradient' | 'transparent' | 'image';
  color: string;
  gradient?: GradientFill;
  imageUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  updatedAt: number;
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  background: DesignBackground;
  layers: Layer[];
  thumbnail?: string;
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  description?: string;
  thumbnail: string;
  project: Project;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
}
