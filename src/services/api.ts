import { toast } from 'sonner';
import { clientConfig } from '../config/clientConfig';

const API_BASE_URL = clientConfig.api.baseUrl;

interface PageLoadResponse {
  name?: string;
  availableUsers?: number;
  activeUsers?: number;
  emails?: string;
  paymentemail?: string;
  submitted?: boolean;
}

interface KeyVerificationResponse {
  openRouterPass: 'pass' | 'fail';
  fluxPass: 'pass' | 'fail';
}

interface ApiKeySubmissionPayload {
  answers: {
    company_name: string;
    firstName: string;
    openRouterApiKey: string;
    fluxApiKey: string;
    apikeyspassed: boolean;
    slackEmailIsFine: boolean;
    formToken: string;
    prefered_email_addressSlack: string;
  }
}

interface User {
  name: string;
  email: string;
}

interface UserSubmissionPayload {
  formToken: string;
  users: User[];
}

// Longer timeout for API calls
const API_TIMEOUT = clientConfig.api.timeout;

// Helper function to create a promise that rejects after a timeout
const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

export const fetchFormData = async (formToken: string): Promise<PageLoadResponse> => {
  try {
    console.log('Fetching form data with token:', formToken);
    
    if (!formToken) {
      console.warn('fetchFormData called with empty token');
      return {};
    }
    
    // Race the fetch against a timeout
    const response = await Promise.race([
      fetch(`${API_BASE_URL}/pageload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ formToken }),
      }),
      timeoutPromise(API_TIMEOUT)
    ]) as Response;

    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching form data:', error);
    if ((error as Error).message.includes('timed out')) {
      toast.error('API request timed out. The server might be busy. Please try again.');
    } else {
      toast.error('Failed to load form data. Please refresh and try again.');
    }
    return {};
  }
};

export const verifyApiKeys = async (openRouterApiKey: string, fluxApiKey: string): Promise<KeyVerificationResponse> => {
  try {
    const response = await Promise.race([
      fetch(`${API_BASE_URL}/keyveriffy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          openRouterApiKey,
          fluxApiKey,
        }),
      }),
      timeoutPromise(API_TIMEOUT)
    ]) as Response;

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying API keys:', error);
    if ((error as Error).message.includes('timed out')) {
      toast.error('API key verification timed out. The server might be busy. Please try again.');
    } else {
      toast.error('Failed to verify API keys. Please try again.');
    }
    return { openRouterPass: 'fail', fluxPass: 'fail' };
  }
};

export const submitApiKeyForm = async (payload: ApiKeySubmissionPayload): Promise<void> => {
  try {
    const response = await Promise.race([
      fetch(`${API_BASE_URL}/submitanswers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      }),
      timeoutPromise(API_TIMEOUT)
    ]) as Response;

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    await response.json();
    
    if (payload.answers.apikeyspassed) {
      toast.success('Form submitted successfully!');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    if ((error as Error).message.includes('timed out')) {
      toast.error('Form submission timed out. The server might be busy. Please try again.');
    } else {
      toast.error('Failed to submit form. Please try again.');
    }
  }
};

export const submitUserInvitations = async (payload: UserSubmissionPayload): Promise<void> => {
  try {
    const response = await Promise.race([
      fetch(`${API_BASE_URL}/submitusers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      }),
      timeoutPromise(API_TIMEOUT)
    ]) as Response;

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    await response.json();
    toast.success('Users invited successfully!');
  } catch (error) {
    console.error('Error inviting users:', error);
    if ((error as Error).message.includes('timed out')) {
      toast.error('User invitation submission timed out. The server might be busy. Please try again.');
    } else {
      toast.error('Failed to invite users. Please try again.');
    }
  }
};
