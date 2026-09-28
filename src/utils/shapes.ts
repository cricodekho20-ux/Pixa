import { ShapeType } from '../types/editor';

export interface ShapeDefinition {
  type: ShapeType;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const SHAPES_LIST: ShapeDefinition[] = [
  { type: 'rectangle', label: 'Rectangle', defaultWidth: 160, defaultHeight: 100 },
  { type: 'circle', label: 'Circle', defaultWidth: 120, defaultHeight: 120 },
  { type: 'ellipse', label: 'Ellipse', defaultWidth: 160, defaultHeight: 100 },
  { type: 'line', label: 'Line', defaultWidth: 180, defaultHeight: 16 },
  { type: 'arrow', label: 'Arrow', defaultWidth: 160, defaultHeight: 80 },
  { type: 'triangle', label: 'Triangle', defaultWidth: 120, defaultHeight: 120 },
  { type: 'star', label: 'Star', defaultWidth: 120, defaultHeight: 120 },
  { type: 'polygon', label: 'Polygon', defaultWidth: 120, defaultHeight: 120 },
  { type: 'rounded-rect', label: 'Rounded Rectangle', defaultWidth: 160, defaultHeight: 100 },
  { type: 'heart', label: 'Heart', defaultWidth: 120, defaultHeight: 110 },
  { type: 'diamond', label: 'Diamond', defaultWidth: 120, defaultHeight: 120 },
];

export function renderShapeSVGPath(type: ShapeType, w: number, h: number): string {
  switch (type) {
    case 'circle':
    case 'ellipse':
      return `M ${w / 2} 0 A ${w / 2} ${h / 2} 0 1 0 ${w / 2} ${h} A ${w / 2} ${h / 2} 0 1 0 ${w / 2} 0 Z`;
    case 'rounded-rect': {
      const r = Math.min(w, h) * 0.18;
      return `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;
    }
    case 'triangle':
      return `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`;
    case 'star': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 5;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.42;
      let path = '';
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        path += (i === 0 ? 'M ' : 'L ') + `${x.toFixed(2)} ${y.toFixed(2)} `;
      }
      return path + 'Z';
    }
    case 'polygon': {
      // 6-sided hexagon
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) / 2;
      let path = '';
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        path += (i === 0 ? 'M ' : 'L ') + `${x.toFixed(2)} ${y.toFixed(2)} `;
      }
      return path + 'Z';
    }
    case 'diamond':
      return `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`;
    case 'heart': {
      const scaleX = w / 100;
      const scaleY = h / 100;
      return `M ${50 * scaleX} ${82 * scaleY} C ${50 * scaleX} ${82 * scaleY} ${15 * scaleX} ${58 * scaleY} ${15 * scaleX} ${32 * scaleY} C ${15 * scaleX} ${18 * scaleY} ${26 * scaleX} ${12 * scaleY} ${37 * scaleX} ${12 * scaleY} C ${44 * scaleX} ${12 * scaleY} ${48 * scaleX} ${16 * scaleY} ${50 * scaleX} ${20 * scaleY} C ${52 * scaleX} ${16 * scaleY} ${56 * scaleX} ${12 * scaleY} ${63 * scaleX} ${12 * scaleY} C ${74 * scaleX} ${12 * scaleY} ${85 * scaleX} ${18 * scaleY} ${85 * scaleX} ${32 * scaleY} C ${85 * scaleX} ${58 * scaleY} ${50 * scaleX} ${82 * scaleY} ${50 * scaleX} ${82 * scaleY} Z`;
    }
    case 'arrow': {
      const shaftH = h * 0.4;
      const shaftY = (h - shaftH) / 2;
      const headW = w * 0.45;
      return `M 0 ${shaftY} H ${w - headW} V 0 L ${w} ${h / 2} L ${w - headW} ${h} V ${shaftY + shaftH} H 0 Z`;
    }
    case 'line':
      return `M 0 ${h / 2} L ${w} ${h / 2}`;
    case 'rounded-rect':
    case 'rectangle':
    default:
      return `M 0 0 H ${w} V ${h} H 0 Z`;
  }
}
