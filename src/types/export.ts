export type ExportResolution =
  | 'Original'
  | '720p'
  | '1080p'
  | '2K'
  | '4K'
  | '6K'
  | '8K'
  | 'Custom';

export type ExportQuality = 'Low' | 'Medium' | 'High' | 'Maximum';

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportDimensions {
  width: number;
  height: number;
}

export interface ExportOptions {
  resolution: ExportResolution;
  quality: ExportQuality;
  format: ExportFormat;
  customWidth?: number;
  customHeight?: number;
}

/**
 * Calculates export dimensions based on project aspect ratio and target resolution tier.
 * For standard 16:9 8K: 7680 × 4320 px.
 * For other aspect ratios: maintains project aspect ratio.
 * Examples from user requirements:
 * 9:16 -> 4320 × 7680
 * 16:9 -> 7680 × 4320
 * 1:1  -> 7680 × 7680
 */
export function calculateExportDimensions(
  projectWidth: number,
  projectHeight: number,
  resolution: ExportResolution,
  customDimensions?: { width: number; height: number }
): ExportDimensions {
  if (resolution === 'Custom' && customDimensions) {
    return {
      width: Math.max(1, Math.round(customDimensions.width || projectWidth)),
      height: Math.max(1, Math.round(customDimensions.height || projectHeight)),
    };
  }

  if (resolution === 'Original') {
    return {
      width: Math.max(1, Math.round(projectWidth)),
      height: Math.max(1, Math.round(projectHeight)),
    };
  }

  // Base long-edge dimensions for each tier (matching 16:9 standards)
  const baselineMap: Record<Exclude<ExportResolution, 'Original' | 'Custom'>, number> = {
    '720p': 1280,
    '1080p': 1920,
    '2K': 2560,
    '4K': 3840,
    '6K': 6144,
    '8K': 7680,
  };

  const baseline = baselineMap[resolution as keyof typeof baselineMap] || 7680;
  const isLandscapeOrSquare = projectWidth >= projectHeight;

  if (isLandscapeOrSquare) {
    const width = baseline;
    const height = Math.round(baseline * (projectHeight / projectWidth));
    return { width, height };
  } else {
    const height = baseline;
    const width = Math.round(baseline * (projectWidth / projectHeight));
    return { width, height };
  }
}

/**
 * Maps Quality setting to compression quality parameter (0.0 to 1.0)
 */
export function getQualityFactor(quality: ExportQuality): number {
  switch (quality) {
    case 'Low':
      return 0.5;
    case 'Medium':
      return 0.75;
    case 'High':
      return 0.9;
    case 'Maximum':
      return 1.0;
    default:
      return 1.0;
  }
}
