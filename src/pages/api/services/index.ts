import type { APIRoute } from 'astro';
import { getAIServices, type ServiceFilters } from '@/lib/services';
import { getCachedItem, setCacheItem } from './cache';
import { fetchWithRetry } from './retry';
import { filterServicesByTypes } from './filters';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const queryString = url.searchParams.toString();
  
  // Verificar caché
  const cachedResult = getCachedItem(queryString);
  if (cachedResult) {
    return new Response(JSON.stringify({
      services: cachedResult.data,
      total: cachedResult.total
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutos
      }
    });
  }
  
  // Extraer parámetros de la URL
  const searchTerm = url.searchParams.get('search');
  const type = url.searchParams.get('type');
  const types = url.searchParams.getAll('types');
  const categories = url.searchParams.getAll('category');
  const minRating = url.searchParams.get('minRating');
  const hasFree = url.searchParams.get('hasFree');
  const hasAPI = url.searchParams.get('hasAPI');
  const commercialUse = url.searchParams.get('commercialUse');
  const customModels = url.searchParams.get('customModels');
  const isNew = url.searchParams.get('isNew');
  const releaseYear = url.searchParams.get('releaseYear');
  
  const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 9;
  
  try {  
    // Crear filtros para la consulta
    const filters: ServiceFilters = {
      categories: categories.length > 0 ? categories : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      hasFree: hasFree === 'true',
      hasAPI: hasAPI === 'true',
      commercialUse: commercialUse === 'true',
      customModels: customModels === 'true',
      isNew: isNew === 'true',
      releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      searchTerm: searchTerm ?? undefined
    };

    // Obtener servicios con reintentos
    const result = await fetchWithRetry(
      queryString, 
      async () => {
        // Determinar si usar query genérica para múltiples tipos
        const useGenericQuery = types && types.length > 0;
        
        return await getAIServices(
          useGenericQuery ? undefined : (type ?? undefined),
          page,
          limit,
          filters
        );
      }
    );

    // filtros adicionales
    let filteredServices = result.services;
    
    // Filtrar por múltiples tipos si están presentes
    filteredServices = filterServicesByTypes(filteredServices, types);
    
    // Guardar en cache
    setCacheItem(queryString, filteredServices, filteredServices.length);
    
    return new Response(JSON.stringify({
      services: filteredServices,
      total: filteredServices.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    
    // Intentar usar datos en caché como fallback
    const fallbackData = getCachedItem(queryString) || getCachedItem(`services:${type || 'all'}`);
    
    if (fallbackData) {
      return new Response(JSON.stringify({
        services: fallbackData.data,
        total: fallbackData.total
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Error-Fallback': 'true'
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Error al obtener servicios', 
      message: 'Por favor, intenta nuevamente en unos momentos'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};