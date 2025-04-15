
import React from 'react';
import { useBranding } from '../contexts/BrandingContext';

interface DebugPanelProps {
  formData?: any;
  isVisible?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ formData, isVisible = true }) => {
  const { branding, isLoaded } = useBranding();
  
  if (!isVisible) return null;
  
  // Get all computed CSS variables
  const getCssVariables = () => {
    const variables: Record<string, string> = {};
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Get all CSS variables that start with --color-
    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle[i];
      if (prop.startsWith('--color-')) {
        variables[prop] = computedStyle.getPropertyValue(prop);
      }
    }
    
    return variables;
  };
  
  return (
    <div className="debug-panel">
      <h2 className="text-lg font-bold">Debug Info</h2>
      
      <h3>Branding Loaded: {isLoaded ? 'Yes' : 'No'}</h3>
      
      <h3>CSS Variables:</h3>
      <pre>{JSON.stringify(getCssVariables(), null, 2)}</pre>
      
      <h3>Logo Status:</h3>
      <div>
        <p>URL: {branding.company.logo}</p>
        <p>Company: {branding.company.name}</p>
      </div>
      
      <h3>API Response Data:</h3>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
      
      <h3>Current Branding Config:</h3>
      <pre>{JSON.stringify(branding, null, 2)}</pre>
    </div>
  );
};

export default DebugPanel;
