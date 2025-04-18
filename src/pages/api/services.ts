import type { APIRoute } from 'astro';
import type { AIService } from '@/data/ai-data';
import { getAIServices } from '../../lib/service';

const cache = new Map<string, { data: AIService[], total: number, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; 

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 segundo

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchServicesWithRetry(
  queryString: string, 
  fetchFn: () => Promise<{services: AIService[], total: number}>, 
  retries = MAX_RETRIES
): Promise<{services: AIService[], total: number}> {
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
  
  const type = url.searchParams.get('type');
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
    const result = await fetchServicesWithRetry(queryString, async () => {
      const result = await getAIServices(
        type ?? undefined,
        page,
        limit,
        {
          categories: categories.length > 0 ? categories : undefined,
          minRating: minRating ? parseFloat(minRating) : undefined,
          hasFree: hasFree === 'true',
          hasAPI: hasAPI === 'true',
          commercialUse: commercialUse === 'true',
          customModels: customModels === 'true',
          isNew: isNew === 'true',
          releaseYear: releaseYear ? parseInt(releaseYear) : undefined
        }
      );
      
      return result;
    });

    cache.set(queryString, { 
      data: result.services, 
      total: result.total,
      timestamp: now 
    });
    
    return new Response(JSON.stringify({
      services: result.services,
      total: result.total
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    
    const fallbackData = cache.get(queryString) || cache.get(`services:${type || 'all'}`);
    
    if (fallbackData) {
      console.log('Using fallback data from cache');
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