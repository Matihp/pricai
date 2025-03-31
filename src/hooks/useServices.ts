import { useState, useEffect, useRef } from 'react';
import type { AIService } from '@/data/ai-data';

interface UseServicesOptions {
  type?: string;
  categories?: string[];
  minRating?: number;
  hasFree?: boolean;
  hasAPI?: boolean;
  commercialUse?: boolean;
  customModels?: boolean;
  isNew?: boolean;
  releaseYear?: number;
  skipInitialCall?: boolean;
}

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useServices(options: UseServicesOptions = {}) {
  const [services, setServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const previousOptionsRef = useRef<string>('');
  const initialLoadRef = useRef<boolean>(true);
  const retryCountRef = useRef<number>(0);

  const fetchWithRetry = async (url: string, retries = MAX_RETRIES): Promise<Response> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener servicios: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      if (retries > 0) {
        console.log(`Retry attempt ${MAX_RETRIES - retries + 1} for: ${url}`);
        retryCountRef.current += 1;
        await wait(RETRY_DELAY);
        return fetchWithRetry(url, retries - 1);
      }
      throw err;
    }
  };

  useEffect(() => {
    const optionsString = JSON.stringify(options);

    if (initialLoadRef.current && options.skipInitialCall) {
      initialLoadRef.current = false;
      setLoading(false);
      return;
    }

    if (optionsString === previousOptionsRef.current && !initialLoadRef.current) {
      return;
    }

    previousOptionsRef.current = optionsString;

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
    }
    retryCountRef.current = 0;
    
    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        
        if (options.type) {
          params.append('type', options.type);
        }
        
        if (options.categories && options.categories.length > 0) {
          options.categories.forEach(category => {
            params.append('category', category);
          });
        }
        
        if (options.minRating) {
          params.append('minRating', options.minRating.toString());
        }
        
        if (options.hasFree !== undefined) {
          params.append('hasFree', options.hasFree.toString());
        }
        
        if (options.hasAPI !== undefined) {
          params.append('hasAPI', options.hasAPI.toString());
        }
        
        if (options.commercialUse !== undefined) {
          params.append('commercialUse', options.commercialUse.toString());
        }
        
        if (options.customModels !== undefined) {
          params.append('customModels', options.customModels.toString());
        }
        
        if (options.isNew !== undefined) {
          params.append('isNew', options.isNew.toString());
        }
        
        if (options.releaseYear) {
          params.append('releaseYear', options.releaseYear.toString());
        }
        
        const url = `/api/services?${params.toString()}`;

        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        if (response.headers.get('X-Error-Fallback') === 'true') {
          console.log('Using fallback data due to server error');
        }
        
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));

      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchServices();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [
    options.type,
    options.categories,
    options.minRating,
    options.hasFree,
    options.hasAPI,
    options.commercialUse,
    options.customModels,
    options.isNew,
    options.releaseYear,
    options.skipInitialCall
  ]);
  
  return { services, loading, error, retryCount: retryCountRef.current };
}