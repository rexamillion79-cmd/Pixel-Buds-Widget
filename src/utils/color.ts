export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const sanitized = hex.replace('#', '').trim();
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return { r, g, b };
  }
  const num = parseInt(sanitized.padEnd(6, '0').slice(0, 6), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function hexToRgba(hex: string, opacityPercent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const alpha = Math.max(0, Math.min(100, opacityPercent)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

export function hexToAndroidArgb(hex: string, opacityPercent: number): string {
  const clean = hex.replace('#', '').toUpperCase().padEnd(6, '0').slice(0, 6);
  const alphaVal = Math.round((Math.max(0, Math.min(100, opacityPercent)) / 100) * 255);
  const alphaHex = alphaVal.toString(16).toUpperCase().padStart(2, '0');
  return `#${alphaHex}${clean}`;
}

export function isLightHex(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

export function resolveRingColor(
  baseColor: string,
  level: number,
  dynamicLowBattery: boolean
): string {
  if (level < 10) return '#ef4444';
  if (level < 20) return '#f59e0b';
  if (dynamicLowBattery && level <= 30) return '#f59e0b';
  return baseColor;
}
