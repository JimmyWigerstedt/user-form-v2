
import React, { useState, useEffect, useRef } from 'react';
import { useUrlParams } from '../hooks/useUrlParams';
import { fetchFormData } from '../services/api';
import ApiKeyForm from '../components/ApiKeyForm';
import UserInvitationForm from '../components/UserInvitationForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { clientConfig } from '../config/clientConfig';

interface FormData {
  name?: string;
  availableUsers?: number;
  activeUsers?: number;
  emails?: string;
  paymentemail?: string;
  submitted?: boolean;
}

const Index = () => {
  const { formToken = '' } = useUrlParams<{ formToken: string }>();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyFormCompleted, setIsApiKeyFormCompleted] = useState(false);
  const userFormRef = useRef<HTMLDivElement>(null);
  
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
          setFormData(data);
          
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
  }, [formToken]);
  
  const handleApiKeyFormSuccess = () => {
    setIsApiKeyFormCompleted(true);
    
    // Scroll to user form
    setTimeout(() => {
      userFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <img src={clientConfig.company.logo} alt="Logo" className="h-32 mb-8" />
        <LoadingSpinner size="lg" />
        <p className="text-zinc-300 mt-6 text-xl animate-pulse">Preparing user...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <img src={clientConfig.company.logo} alt="Logo" className="h-32 mb-8" />
        <div className="glass-card p-8 max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4 text-white">Error</h2>
          <p className="text-zinc-300">{error}</p>
        </div>
      </div>
    );
  }
  
  // Only render the forms if we have valid form data
  if (!formData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <img src={clientConfig.company.logo} alt="Logo" className="h-32 mb-8" />
        <LoadingSpinner size="lg" />
        <p className="text-zinc-300 mt-6 text-xl animate-pulse">Preparing user...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img src={clientConfig.company.logo} alt="Logo" className="h-32 mx-auto mb-8" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Welcome to the API Integration Form</h1>
          {formData?.name && (
            <p className="text-lg text-zinc-300">
              Hello, <span className="text-brand font-medium">{formData.name}</span>
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
          
          <div className="text-center text-xs text-zinc-500 py-8">
            &copy; {new Date().getFullYear()} | All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
