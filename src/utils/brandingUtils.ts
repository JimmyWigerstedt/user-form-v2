
/**
 * Converts a hex color code to an RGB value for CSS variables
 */
export const hexToRgb = (hex: string): string | null => {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');

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
  
  Object.keys(colors).forEach(key => {
    const hex = colors[key];
    const rgb = hexToRgb(hex);
    
    if (rgb) {
      rgbVariables[`${key}-rgb`] = rgb;
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
