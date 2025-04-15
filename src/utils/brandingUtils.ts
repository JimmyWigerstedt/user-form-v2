
/**
 * Converts a hex color code to an RGB value for CSS variables
 */
export const hexToRgb = (hex: string): string | null => {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');

  // Handle shorthand hex (e.g., #FFF)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Parse the hex values
  const bigint = parseInt(hex, 16);
  
  // Check if it's a valid hex color
  if (isNaN(bigint)) {
    console.error(`Invalid hex color: ${hex}`);
    return null;
  }
  
  // Extract the RGB components
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return `${r}, ${g}, ${b}`;
};

/**
 * Generates RGB variables from branding hex colors
 */
export const generateRgbVariables = (colors: Record<string, string>): Record<string, string> => {
  const rgbVariables: Record<string, string> = {};
  
  Object.entries(colors).forEach(([key, hex]) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      // Convert camelCase to kebab-case for CSS variables
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      rgbVariables[`color-${cssKey}-rgb`] = rgb;
    }
  });
  
  return rgbVariables;
};

/**
 * Creates a transparent version of a color
 */
export const createTransparentColor = (color: string, opacity: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  return `rgba(${rgb}, ${opacity})`;
};

/**
 * Determines if text should be dark or light based on background color
 */
export const shouldUseDarkText = (backgroundColor: string): boolean => {
  // Remove the hash if it exists
  const hex = backgroundColor.replace(/^#/, '');
  
  // Handle shorthand hex (e.g., #FFF)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate the perceived brightness
  // Formula: (R * 299 + G * 587 + B * 114) / 1000
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Use dark text if the background is bright (brightness > 128)
  return brightness > 128;
};
