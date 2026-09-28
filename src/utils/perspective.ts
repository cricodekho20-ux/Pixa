import { CornerPin } from '../types/editor';

// Solves 8 linear equations for 2D perspective / homography projection
// Maps unit rectangle [0,0], [w,0], [w,h], [0,h] to 4 arbitrary quadrilateral corner pins
export function getPerspectiveMatrix3D(
  width: number,
  height: number,
  topLeft: CornerPin,
  topRight: CornerPin,
  bottomRight: CornerPin,
  bottomLeft: CornerPin
): string {
  // Source points: (0,0), (w,0), (w,h), (0,h)
  // Target points: (x0, y0), (x1, y1), (x2, y2), (x3, y3)
  const x0 = topLeft.x, y0 = topLeft.y;
  const x1 = topRight.x, y1 = topRight.y;
  const x2 = bottomRight.x, y2 = bottomRight.y;
  const x3 = bottomLeft.x, y3 = bottomLeft.y;

  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;

  const sumX = x0 - x1 + x2 - x3;
  const sumY = y0 - y1 + y2 - y3;

  if (Math.abs(sumX) < 1e-5 && Math.abs(sumY) < 1e-5) {
    // Affine transformation
    const a = (x1 - x0) / width;
    const b = (y1 - y0) / width;
    const c = (x3 - x0) / height;
    const d = (y3 - y0) / height;
    const tx = x0;
    const ty = y0;
    return `matrix3d(${a.toFixed(6)}, ${b.toFixed(6)}, 0, 0, ${c.toFixed(6)}, ${d.toFixed(6)}, 0, 0, 0, 0, 1, 0, ${tx.toFixed(6)}, ${ty.toFixed(6)}, 0, 1)`;
  }

  // General projective transformation
  const det = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(det) < 1e-7) {
    return 'none';
  }

  const g = (sumX * dy2 - sumY * dx2) / det;
  const h = (dx1 * sumY - dy1 * sumX) / det;

  const a = ((x1 - x0 + g * x1) / width);
  const b = ((y1 - y0 + g * y1) / width);
  const c = ((x3 - x0 + h * x3) / height);
  const d = ((y3 - y0 + h * y3) / height);
  const tx = x0;
  const ty = y0;

  const gNorm = g / width;
  const hNorm = h / height;

  return `matrix3d(${a.toFixed(6)}, ${b.toFixed(6)}, 0, ${gNorm.toFixed(6)}, ${c.toFixed(6)}, ${d.toFixed(6)}, 0, ${hNorm.toFixed(6)}, 0, 0, 1, 0, ${tx.toFixed(6)}, ${ty.toFixed(6)}, 0, 1)`;
}

export function drawPerspectiveCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  w: number,
  h: number,
  topLeft: CornerPin,
  topRight: CornerPin,
  bottomRight: CornerPin,
  bottomLeft: CornerPin,
  subdivisions = 16
) {
  // Bilinear interpolation patch drawing onto 2D canvas for export
  const stepU = 1 / subdivisions;
  const stepV = 1 / subdivisions;

  function interpolate(u: number, v: number): { x: number; y: number } {
    const x =
      (1 - u) * (1 - v) * topLeft.x +
      u * (1 - v) * topRight.x +
      u * v * bottomRight.x +
      (1 - u) * v * bottomLeft.x;
    const y =
      (1 - u) * (1 - v) * topLeft.y +
      u * (1 - v) * topRight.y +
      u * v * bottomRight.y +
      (1 - u) * v * bottomLeft.y;
    return { x, y };
  }

  for (let i = 0; i < subdivisions; i++) {
    for (let j = 0; j < subdivisions; j++) {
      const u0 = i * stepU;
      const v0 = j * stepV;
      const u1 = (i + 1) * stepU;
      const v1 = (j + 1) * stepV;

      const p00 = interpolate(u0, v0);
      const p10 = interpolate(u1, v0);
      const p11 = interpolate(u1, v1);
      const p01 = interpolate(u0, v1);

      // Draw quad as two triangles
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.clip();

      const sx = u0 * w;
      const sy = v0 * h;
      const sw = (u1 - u0) * w;
      const sh = (v1 - v0) * h;

      ctx.drawImage(img, sx, sy, sw, sh, p00.x, p00.y, p11.x - p00.x, p11.y - p00.y);
      ctx.restore();
    }
  }
}
