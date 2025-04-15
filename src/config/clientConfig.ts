
/**
 * This file contains client-specific configuration settings.
 * Modify these values to customize the application for different clients.
 */

export const clientConfig = {
  // API configuration
  api: {
    baseUrl: 'https://n8n-main-instance-production-1345.up.railway.app/webhook',
    timeout: 30000 // 30 seconds
  },
  
  // Brand colors
  colors: {
    primary: '#EFB61D', // Main brand color
    primaryMuted: '#f0c75a', // Lighter version for hover states
    primaryForeground: '#FFFFFF', // Text color on primary backgrounds
    background: '#393939', // Page background color
  },
  
  // Company info
  company: {
    name: 'Revenue Aigency',
    supportEmail: 'ruben@revenueaigency.com',
    logo: 'https://i.imgur.com/Xokf51Z.png', // Updated logo URL
  },
  
  // UI customization
  ui: {
    borderRadius: '0.8rem',
    fontFamily: "'Poppins', sans-serif",
  }
};
