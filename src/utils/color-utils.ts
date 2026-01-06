/**
 * Color Utilities for WCAG 2.1 AA Compliance
 *
 * Ensures stakeholder colors are used appropriately for accessibility
 */

/**
 * Calculate relative luminance of a color
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getLuminance(hexColor: string): number {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if text color meets WCAG AA on white background
 * Returns true if contrast ratio >= 4.5:1
 */
export function meetsWCAG_AA(textColor: string, bgColor: string = '#ffffff'): boolean {
  return getContrastRatio(textColor, bgColor) >= 4.5;
}

/**
 * Darken a hex color by a percentage
 * Used to ensure stakeholder colors meet WCAG when used for text
 */
export function darkenColor(hexColor: string, percent: number): string {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const darken = (val: number) => Math.max(0, Math.floor(val * (1 - percent / 100)));

  const newR = darken(r);
  const newG = darken(g);
  const newB = darken(b);

  return `#${((1 << 24) | (newR << 16) | (newG << 8) | newB).toString(16).slice(1)}`;
}

/**
 * Get WCAG AA compliant text color from stakeholder color
 * If the color doesn't meet WCAG AA, use dark gray instead
 */
export function getAccessibleTextColor(stakeholderColor: string): string {
  // Dark gray that meets WCAG AA on white
  const SAFE_DARK_GRAY = '#1f2937'; // Tailwind gray-800

  // Check if stakeholder color meets WCAG AA on white background
  if (meetsWCAG_AA(stakeholderColor, '#ffffff')) {
    return stakeholderColor;
  }

  // If not, return safe dark gray
  return SAFE_DARK_GRAY;
}

/**
 * Get appropriate text color for button with stakeholder background
 * Returns white or dark based on contrast ratio
 */
export function getButtonTextColor(bgColor: string): string {
  const whiteContrast = getContrastRatio('#ffffff', bgColor);
  const darkContrast = getContrastRatio('#1f2937', bgColor);

  // Return white if it has better contrast
  return whiteContrast >= darkContrast ? '#ffffff' : '#1f2937';
}
