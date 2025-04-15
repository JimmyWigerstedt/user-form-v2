
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function useUrlParams<T extends Record<string, string>>(): T {
  const [params, setParams] = useState<T>({} as T);
  const location = useLocation();

  useEffect(() => {
    // Process query parameters
    const searchParams = new URLSearchParams(location.search);
    const urlParams: Record<string, string> = {};
    
    for (const [key, value] of searchParams.entries()) {
      urlParams[key] = value;
      console.log(`URL param found: ${key}=${value}`);
    }
    
    // Also check for hash parameters (some systems might use hash fragments)
    if (location.hash) {
      try {
        // First try treating the hash as a search param format
        console.log('Processing hash fragment:', location.hash);
        // Remove the leading # and parse as search params
        const hashParams = new URLSearchParams(location.hash.substring(1));
        for (const [key, value] of hashParams.entries()) {
          urlParams[key] = value;
          console.log(`Hash param found: ${key}=${value}`);
        }
      } catch (error) {
        console.error('Error parsing hash params:', error);
      }
    }
    
    // Look for specific pattern in URL path if formToken is not found
    if (!urlParams.formToken && location.pathname) {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      // Check the last segment as a potential token
      if (pathSegments.length > 0) {
        const potentialToken = pathSegments[pathSegments.length - 1];
        if (potentialToken && potentialToken.length > 8) {
          console.log('Found potential token in path:', potentialToken);
          urlParams.formToken = potentialToken;
        }
      }
    }
    
    // Log for debugging
    console.log('URL Parameters extracted:', urlParams);
    
    setParams(urlParams as T);
  }, [location.search, location.hash, location.pathname]);

  return params;
}
