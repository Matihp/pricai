import type { APIRoute } from 'astro';
import type { AIService } from '@/data/ai-data';
import { getAIServices } from '../../lib/service';

const cache = new Map<string, { data: AIService[], timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchServicesWithRetry(
  queryString: string, 
  fetchFn: () => Promise<AIService[]>, 
  retries = MAX_RETRIES
): Promise<AIService[]> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry attempt ${MAX_RETRIES - retries + 1} for query: ${queryString}`);
      await wait(RETRY_DELAY);
      return fetchServicesWithRetry(queryString, fetchFn, retries - 1);
    }
    throw error;
  }
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const queryString = url.searchParams.toString();
  
  const now = Date.now();
  const cachedResult = cache.get(queryString);
  
  if (cachedResult && now - cachedResult.timestamp < CACHE_TTL) {
    console.log('Cache hit for API query:', queryString);
    return new Response(JSON.stringify(cachedResult.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }
  
  const type = url.searchParams.get('type');
  const categories = url.searchParams.getAll('category');
  const minRating = url.searchParams.get('minRating');
  const hasFree = url.searchParams.get('hasFree');
  const hasAPI = url.searchParams.get('hasAPI');
  const commercialUse = url.searchParams.get('commercialUse');
  const customModels = url.searchParams.get('customModels');
  const isNew = url.searchParams.get('isNew');
  const releaseYear = url.searchParams.get('releaseYear');
  
  try {
    
    const services = await fetchServicesWithRetry(queryString, async () => {

      const allServices = await getAIServices(type ?? undefined);
      
      let filteredServices = [...allServices];
      
      if (categories.length > 0) {
        filteredServices = filteredServices.filter(service => 
          categories.some(cat => service.categories.includes(cat))
        );
      }
      
      if (minRating) {
        const rating = parseFloat(minRating);
        filteredServices = filteredServices.filter(service => service.rating >= rating);
      }
      
      if (hasFree === 'true') {
        filteredServices = filteredServices.filter(service => service.hasFree);
      }
      
      if (hasAPI === 'true') {
        filteredServices = filteredServices.filter(service => service.hasAPI);
      }
      
      if (commercialUse === 'true') {
        filteredServices = filteredServices.filter(service => service.commercialUse);
      }
      
      if (customModels === 'true') {
        filteredServices = filteredServices.filter(service => service.customModels);
      }
      
      if (isNew === 'true') {
        filteredServices = filteredServices.filter(service => service.isNew);
      }
      
      if (releaseYear) {
        const year = parseInt(releaseYear);
        filteredServices = filteredServices.filter(service => service.releaseYear === year);
      }
      
      return filteredServices;
    });
    
    cache.set(queryString, { data: services, timestamp: now });
    
    return new Response(JSON.stringify(services), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    
    const fallbackData = cache.get(queryString) || cache.get(`services:${type || 'all'}`);
    
    if (fallbackData) {
      console.log('Using fallback data from cache');
      return new Response(JSON.stringify(fallbackData.data), {
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