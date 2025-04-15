
import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateRgbVariables } from '../utils/brandingUtils';

// Default branding values as fallback
const defaultBranding = {
  colors: {
    primary: '#EFB61D',
    primaryMuted: '#f0c75a',
    primaryForeground: '#FFFFFF',
    background: '#393939',
    secondaryBackground: '#444444',
    borderColor: '#555555',
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC'
  },
  company: {
    name: 'Default Company',
    supportEmail: 'support@example.com',
    logo: '/placeholder.svg'
  }
};

export interface BrandingColors {
  primary: string;
  primaryMuted: string;
  primaryForeground: string;
  background: string;
  secondaryBackground: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
}

export interface CompanyInfo {
  name: string;
  supportEmail: string;
  logo: string;
}

export interface BrandingData {
  colors: BrandingColors;
  company: CompanyInfo;
}

interface BrandingContextType {
  branding: BrandingData;
  updateBranding: (newBranding: BrandingData) => void;
  isLoaded: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  updateBranding: () => {},
  isLoaded: false
});

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);
  const [isLoaded, setIsLoaded] = useState(false);

  const updateBranding = (newBranding: BrandingData) => {
    console.log('Updating branding with:', newBranding);
    setBranding(newBranding);
    setIsLoaded(true);
    
    // Update CSS variables when branding changes
    applyBrandingToCssVariables(newBranding.colors);
  };

  // Apply branding colors to CSS variables
  const applyBrandingToCssVariables = (colors: BrandingColors) => {
    const root = document.documentElement;
    
    // Apply all color values to CSS variables
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-muted', colors.primaryMuted);
    root.style.setProperty('--color-primary-foreground', colors.primaryForeground);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-secondary-background', colors.secondaryBackground);
    root.style.setProperty('--color-border', colors.borderColor);
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    
    // Generate and apply RGB variables for all colors
    const rgbVariables = generateRgbVariables(colors);
    Object.entries(rgbVariables).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Update body styles directly for immediate effect
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.textPrimary;
    
    console.log('CSS variables updated with branding colors');
  };

  // Apply default branding on initial load
  useEffect(() => {
    applyBrandingToCssVariables(defaultBranding.colors);
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, isLoaded }}>
      {children}
    </BrandingContext.Provider>
  );
};
