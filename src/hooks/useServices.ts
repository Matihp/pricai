import { useState, useEffect, useRef } from 'react';
import type { AIService } from '@/data/ai-data';
export const prerender = false;

interface UseServicesOptions {
  type?: string;
  types?: ("api" | "individual" | "code-editor")[]; // Nueva propiedad para filtrar por múltiples tipos
  categories?: string[];
  minRating?: number;
  hasFree?: boolean;
  hasAPI?: boolean;
  commercialUse?: boolean;
  customModels?: boolean;
  isNew?: boolean;
  releaseYear?: number;
  page?: number;
  limit?: number;
  skipInitialCall?: boolean;
  searchTerm?: string;
}

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useServices(options: UseServicesOptions = {}) {
  const [services, setServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(false); // Iniciar como false para evitar carga inicial innecesaria
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const previousOptionsRef = useRef<string>('');
  const initialLoadRef = useRef<boolean>(true);
  const retryCountRef = useRef<number>(0);
  const optionsRef = useRef(options); // Referencia para evitar dependencias circulares

  const fetchWithRetry = async (url: string, retries = MAX_RETRIES): Promise<Response> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener servicios: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      if (retries > 0) {
        retryCountRef.current += 1;
        await wait(RETRY_DELAY);
        return fetchWithRetry(url, retries - 1);
      }
      throw err;
    }
  };

  // Actualizar la referencia cuando cambian las opciones
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    // Función para obtener servicios
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        const currentOptions = optionsRef.current;
        
        // Mantener compatibilidad con el parámetro type
        if (currentOptions.type) {
          params.append('type', currentOptions.type);
        }
        
        // Añadir soporte para múltiples tipos
        if (currentOptions.types && currentOptions.types.length > 0) {
          currentOptions.types.forEach(type => {
            params.append('types', type);
          });
        }
        
        if (currentOptions.categories && currentOptions.categories.length > 0) {
          currentOptions.categories.forEach(category => {
            params.append('category', category);
          });
        }
        
        if (currentOptions.minRating) {
          params.append('minRating', currentOptions.minRating.toString());
        }
        
        if (currentOptions.hasFree !== undefined) {
          params.append('hasFree', currentOptions.hasFree.toString());
        }
        
        if (currentOptions.hasAPI !== undefined) {
          params.append('hasAPI', currentOptions.hasAPI.toString());
        }
        
        if (currentOptions.commercialUse !== undefined) {
          params.append('commercialUse', currentOptions.commercialUse.toString());
        }
        
        if (currentOptions.customModels !== undefined) {
          params.append('customModels', currentOptions.customModels.toString());
        }
        
        if (currentOptions.isNew !== undefined) {
          params.append('isNew', currentOptions.isNew.toString());
        }
        
        if (currentOptions.releaseYear) {
          params.append('releaseYear', currentOptions.releaseYear.toString());
        }
        
        if (currentOptions.searchTerm) {
          params.append('search', currentOptions.searchTerm);
        }
        
        // Añadir parámetros de paginación
        if (currentOptions.page) {
          params.append('page', currentOptions.page.toString());
        }
        
        if (currentOptions.limit) {
          params.append('limit', currentOptions.limit.toString());
        }
        
        const url = `/api/services?${params.toString()}`;
    
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        if (response.headers.get('X-Error-Fallback') === 'true') {
          console.log('Using fallback data due to server error');
        }
        
        if (data && typeof data === 'object' && 'services' in data && Array.isArray((data as any).services)) {
          setServices((data as {services: AIService[], total: number}).services);
          setTotal((data as {services: AIService[], total: number}).total || 0);
        } else {
          // Mantener compatibilidad con el formato anterior
          setServices(Array.isArray(data) ? (data as AIService[]) : []);
          setTotal(Array.isArray(data) ? (data as AIService[]).length : 0);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    const optionsString = JSON.stringify(options);

    // Manejar el caso de skipInitialCall
    if (initialLoadRef.current && options.skipInitialCall) {
      initialLoadRef.current = false;
      return;
    }

    // Evitar solicitudes duplicadas
    if (optionsString === previousOptionsRef.current && !initialLoadRef.current) {
      return;
    }

    previousOptionsRef.current = optionsString;
    initialLoadRef.current = false;
    retryCountRef.current = 0;
    
    // Ejecutar la solicitud
    fetchServices();
    
  }, [
    // Simplificar las dependencias para evitar ciclos
    JSON.stringify(options)
  ]);
  
  return { services, loading, error, total, retryCount: retryCountRef.current };
}