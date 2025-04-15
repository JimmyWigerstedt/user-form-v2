
import React, { useState, useEffect, useRef } from 'react';
import { useUrlParams } from '../hooks/useUrlParams';
import { fetchFormData } from '../services/api';
import ApiKeyForm from '../components/ApiKeyForm';
import UserInvitationForm from '../components/UserInvitationForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBranding } from '../contexts/BrandingContext';
import DebugPanel from '../components/DebugPanel';
import { generateRgbVariables } from '../utils/brandingUtils';

interface BrandingColors {
  primary: string;
  primaryMuted: string;
  primaryForeground: string;
  background: string;
  secondaryBackground: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
}

interface CompanyInfo {
  name: string;
  supportEmail: string;
  logo: string;
}

interface FormData {
  name?: string;
  availableUsers?: number;
  activeUsers?: number;
  emails?: string;
  paymentemail?: string;
  submitted?: boolean;
  branding?: {
    colors: BrandingColors;
    company: CompanyInfo;
  };
}

// Extend the PageLoadResponse type to include branding
interface PageLoadResponse extends FormData {
  branding?: {
    colors: BrandingColors;
    company: CompanyInfo;
  };
}

const Index = () => {
  const { formToken = '' } = useUrlParams<{ formToken: string }>();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyFormCompleted, setIsApiKeyFormCompleted] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const userFormRef = useRef<HTMLDivElement>(null);
  const { updateBranding, branding, isLoaded: isBrandingLoaded } = useBranding();
  
  useEffect(() => {
    const loadFormData = async () => {
      try {
        console.log('Calling fetchFormData with token:', formToken);
        
        // Only show the no token error if there's actually no token after a short delay
        // This gives time for the URL params to be properly extracted
        if (!formToken) {
          const tokenCheckTimeout = setTimeout(() => {
            const currentParams = new URLSearchParams(window.location.search);
            const currentToken = currentParams.get('formToken');
            
            if (!currentToken) {
              setError('No form token provided. Please check the URL.');
            }
          }, 500);
          
          return () => clearTimeout(tokenCheckTimeout);
        }
        
        const data = await fetchFormData(formToken);
        console.log('Data received in component:', data);
        
        if (Object.keys(data).length === 0) {
          setError('Invalid form token or no data received.');
          setFormData(null);
        } else {
          setFormData(data as FormData);
          
          // Apply branding if available in the response
          if (data.branding) {
            console.log('Applying branding from API response:', data.branding);
            
            // Apply RGB variables for colors
            const colors = data.branding.colors;
            const rgbVariables = generateRgbVariables(colors);
            Object.entries(rgbVariables).forEach(([name, value]) => {
              document.documentElement.style.setProperty(`--${name}`, value);
            });
            
            // Update branding in context
            updateBranding(data.branding);
          } else {
            console.log('No branding data in API response, using defaults');
          }
          
          // If form is already submitted, mark API key form as completed
          if (data.submitted) {
            setIsApiKeyFormCompleted(true);
          }
          
          // Clear any previous errors since we got data successfully
          setError(null);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        setError('Failed to load form data. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFormData();
  }, [formToken, updateBranding]);
  
  const handleApiKeyFormSuccess = () => {
    setIsApiKeyFormCompleted(true);
    
    // Scroll to user form
    setTimeout(() => {
      userFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  };
  
  useEffect(() => {
    // Add keyboard handler for debug panel toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 neutral-loading">
        <div className="mb-8 h-32 flex items-center justify-center">
          {isBrandingLoaded ? 
            <img 
              src={branding.company.logo} 
              alt={`${branding.company.name} Logo`} 
              className="h-full" 
              onError={(e) => {
                console.error('Logo failed to load:', e);
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            /> : 
            <div className="h-full w-32 bg-gray-300 animate-pulse rounded-md"></div>
          }
        </div>
        <LoadingSpinner size="lg" />
        <p className="mt-6 text-xl animate-pulse" style={{ color: 'var(--color-text-secondary, #eee)' }}>Preparing user...</p>
        
        {/* Debug panel */}
        <DebugPanel formData={formData} isVisible={showDebug} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="mb-8 h-32 flex items-center justify-center">
          {isBrandingLoaded ? 
            <img 
              src={branding.company.logo} 
              alt={`${branding.company.name} Logo`} 
              className="h-full" 
              onError={(e) => {
                console.error('Logo failed to load:', e);
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            /> : 
            <div className="h-full w-32 bg-gray-300 animate-pulse rounded-md"></div>
          }
        </div>
        <div className="glass-card p-8 max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Error</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
        </div>
        
        {/* Debug panel */}
        <DebugPanel formData={formData} isVisible={showDebug} />
      </div>
    );
  }
  
  // Only render the forms if we have valid form data
  if (!formData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="mb-8 h-32 flex items-center justify-center">
          {isBrandingLoaded ? 
            <img 
              src={branding.company.logo} 
              alt={`${branding.company.name} Logo`} 
              className="h-full" 
              onError={(e) => {
                console.error('Logo failed to load:', e);
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            /> : 
            <div className="h-full w-32 bg-gray-300 animate-pulse rounded-md"></div>
          }
        </div>
        <LoadingSpinner size="lg" />
        <p className="mt-6 text-xl animate-pulse" style={{ color: 'var(--color-text-secondary, #eee)' }}>Preparing user...</p>
        
        {/* Debug panel */}
        <DebugPanel formData={formData} isVisible={showDebug} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mb-8 h-32 flex items-center justify-center">
            <img 
              src={branding.company.logo} 
              alt={`${branding.company.name} Logo`} 
              className="h-full max-h-32 mx-auto" 
              onError={(e) => {
                console.error('Logo failed to load:', e);
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Welcome to the API Integration Form
          </h1>
          {formData?.name && (
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Hello, <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{formData.name}</span>
            </p>
          )}
        </div>
        
        <div className="space-y-16">
          {(!formData?.submitted && !isApiKeyFormCompleted) && (
            <div className="form-container animate-fade-in">
              <ApiKeyForm
                formToken={formToken}
                name={formData?.name}
                paymentEmail={formData?.paymentemail}
                onSubmitSuccess={handleApiKeyFormSuccess}
              />
            </div>
          )}
          
          <div ref={userFormRef} className={`form-container transition-opacity duration-500 ${(!isApiKeyFormCompleted && !formData?.submitted) ? 'opacity-50' : 'opacity-100'}`}>
            {formData && (
              <UserInvitationForm
                formToken={formToken}
                availableUsers={formData.availableUsers}
                activeUsers={formData.activeUsers}
                existingEmails={formData.emails}
              />
            )}
          </div>
          
          <div className="text-center text-xs py-8" style={{ color: 'var(--color-text-secondary)' }}>
            &copy; {new Date().getFullYear()} | All rights reserved
          </div>
        </div>
      </div>
      
      {/* Debug panel */}
      <DebugPanel formData={formData} isVisible={showDebug} />
    </div>
  );
};

export default Index;
