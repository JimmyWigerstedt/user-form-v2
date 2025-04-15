
import React, { useState } from 'react';
import { verifyApiKeys, submitApiKeyForm } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { Check, X, Eye, EyeOff } from 'lucide-react';

interface ApiKeyFormProps {
  formToken: string;
  name?: string;
  paymentEmail?: string;
  onSubmitSuccess: () => void;
}

interface FormData {
  firstName: string;
  companyName: string;
  slackEmail: string;
  usePaymentEmail: boolean;
  openRouterApiKey: string;
  fluxApiKey: string;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ 
  formToken, 
  name = '', 
  paymentEmail = '',
  onSubmitSuccess 
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: name,
    companyName: '',
    slackEmail: paymentEmail || '',
    usePaymentEmail: Boolean(paymentEmail), // Set to true if paymentEmail exists
    openRouterApiKey: '',
    fluxApiKey: ''
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showFluxKey, setShowFluxKey] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    openRouter: 'idle' | 'pass' | 'fail';
    flux: 'idle' | 'pass' | 'fail';
  }>({
    openRouter: 'idle',
    flux: 'idle'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        // If usePaymentEmail is checked, update slackEmail with paymentEmail
        ...(name === 'usePaymentEmail' && checked ? { slackEmail: paymentEmail } : {})
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationStatus({ openRouter: 'idle', flux: 'idle' });

    try {
      const result = await verifyApiKeys(formData.openRouterApiKey, formData.fluxApiKey);
      
      setVerificationStatus({
        openRouter: result.openRouterPass,
        flux: result.fluxPass
      });

      // Both keys passed verification
      if (result.openRouterPass === 'pass' && result.fluxPass === 'pass') {
        await handleSubmit(true);
        onSubmitSuccess();
      } else {
        // Submit with failed keys
        await handleSubmit(false);
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (keysPassed: boolean) => {
    setIsSubmitting(true);
    
    // Smart payload logic for email
    let slackEmailToUse = formData.slackEmail;
    
    // If usePaymentEmail is true, use paymentEmail
    if (formData.usePaymentEmail && paymentEmail) {
      slackEmailToUse = paymentEmail;
    }
    
    // If still empty and we have a payment email, use that
    if (!slackEmailToUse && paymentEmail) {
      slackEmailToUse = paymentEmail;
    }
    
    try {
      await submitApiKeyForm({
        answers: {
          company_name: formData.companyName,
          firstName: formData.firstName,
          openRouterApiKey: formData.openRouterApiKey,
          fluxApiKey: formData.fluxApiKey,
          apikeyspassed: keysPassed,
          slackEmailIsFine: formData.usePaymentEmail,
          formToken: formToken,
          prefered_email_addressSlack: slackEmailToUse
        }
      });
      
      // Don't trigger success callback if keys didn't pass
      if (!keysPassed) {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-8 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6 text-center text-white">API Keys Submission</h2>
      
      <div className="text-zinc-300 mb-6 text-center">
        Please enter your details and API keys below. Your API keys will be verified before proceeding.
      </div>
      
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300 mb-1">
              Your Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="input-field w-full"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-zinc-300 mb-1">
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="input-field w-full"
              placeholder="Acme Inc."
            />
          </div>
          
          <div>
            <label htmlFor="slackEmail" className="block text-sm font-medium text-zinc-300 mb-1">
              Email to invite into Slack
            </label>
            <div className="mb-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="usePaymentEmail"
                  checked={formData.usePaymentEmail}
                  onChange={handleInputChange}
                  className="checkbox-field"
                  disabled={!paymentEmail}
                />
                <span className="ml-2 text-sm text-zinc-300">
                  {paymentEmail ? `"${paymentEmail}" is fine` : "No payment email available"}
                </span>
              </label>
            </div>
            {!formData.usePaymentEmail && (
              <input
                id="slackEmail"
                name="slackEmail"
                type="email"
                value={formData.slackEmail}
                onChange={handleInputChange}
                required
                className="input-field w-full"
                placeholder="your@email.com"
              />
            )}
          </div>
          
          <div>
            <label htmlFor="openRouterApiKey" className="block text-sm font-medium text-zinc-300 mb-1">
              OpenRouter API Key
              {verificationStatus.openRouter !== 'idle' && (
                <span className="ml-2">
                  {verificationStatus.openRouter === 'pass' ? (
                    <Check size={16} className="inline text-green-500" />
                  ) : (
                    <X size={16} className="inline text-red-500" />
                  )}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="openRouterApiKey"
                name="openRouterApiKey"
                type={showOpenRouterKey ? "text" : "password"}
                value={formData.openRouterApiKey}
                onChange={handleInputChange}
                required
                className={`input-field w-full pr-10 ${
                  verificationStatus.openRouter === 'pass' ? 'ring-2 ring-green-500' :
                  verificationStatus.openRouter === 'fail' ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="sk-or-..."
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
              >
                {showOpenRouterKey ? (
                  <EyeOff size={18} className="text-zinc-400 hover:text-zinc-300" />
                ) : (
                  <Eye size={18} className="text-zinc-400 hover:text-zinc-300" />
                )}
              </button>
            </div>
            {verificationStatus.openRouter === 'fail' && (
              <p className="text-red-500 text-sm mt-1">Invalid OpenRouter API key</p>
            )}
          </div>
          
          <div>
            <label htmlFor="fluxApiKey" className="block text-sm font-medium text-zinc-300 mb-1">
              Black Forest Labs API Key
              {verificationStatus.flux !== 'idle' && (
                <span className="ml-2">
                  {verificationStatus.flux === 'pass' ? (
                    <Check size={16} className="inline text-green-500" />
                  ) : (
                    <X size={16} className="inline text-red-500" />
                  )}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="fluxApiKey"
                name="fluxApiKey"
                type={showFluxKey ? "text" : "password"}
                value={formData.fluxApiKey}
                onChange={handleInputChange}
                required
                className={`input-field w-full pr-10 ${
                  verificationStatus.flux === 'pass' ? 'ring-2 ring-green-500' :
                  verificationStatus.flux === 'fail' ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="Enter your BFL API key"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowFluxKey(!showFluxKey)}
              >
                {showFluxKey ? (
                  <EyeOff size={18} className="text-zinc-400 hover:text-zinc-300" />
                ) : (
                  <Eye size={18} className="text-zinc-400 hover:text-zinc-300" />
                )}
              </button>
            </div>
            {verificationStatus.flux === 'fail' && (
              <p className="text-red-500 text-sm mt-1">Invalid Black Forest Labs API key</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isVerifying || isSubmitting}
            className="btn-primary w-full sm:w-auto flex items-center justify-center"
          >
            {isVerifying ? (
              <>
                <LoadingSpinner size="sm" color="border-white" />
                <span className="ml-2">Verifying...</span>
              </>
            ) : isSubmitting ? (
              <>
                <LoadingSpinner size="sm" color="border-white" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Verify & Submit'
            )}
          </button>
        </div>
        
        {(verificationStatus.openRouter === 'fail' || verificationStatus.flux === 'fail') && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-md text-sm text-zinc-200">
            <p className="font-medium">Please correct the following issues:</p>
            <ul className="list-disc list-inside mt-2">
              {verificationStatus.openRouter === 'fail' && (
                <li>The OpenRouter API key is invalid</li>
              )}
              {verificationStatus.flux === 'fail' && (
                <li>The Black Forest Labs API key is invalid</li>
              )}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default ApiKeyForm;
