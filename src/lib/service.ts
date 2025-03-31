import { db } from './db';
import type { AIService } from '@/data/ai-data';
import { performance } from 'perf_hooks';

// Add a simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function getAIServices(type?: string): Promise<AIService[]> {
  const cacheKey = `services:${type || 'all'}`;
  const now = Date.now();
  
  const cachedData = cache.get(cacheKey);
  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    console.log(`Cache hit for getAIServices(${type || 'all'})`);
    return cachedData.data;
  }
  
  const startTime = performance.now();
  
  try {
    // 1. Obtener todos los servicios en una sola consulta
    const servicesQuery = `
      SELECT 
        s.id, s.name, s.description_es, s.description_en, s.price, s.price_details, 
        s.type, s.rating, s.has_free, s.has_api, s.commercial_use, s.custom_models, s.is_new, s.release_year
      FROM ai_services s
      ${type ? 'WHERE s.type = ?' : ''}
    `;
    
    const servicesResult = await db.execute({
      sql: servicesQuery,
      args: type ? [type] : []
    });
    
    if (servicesResult.rows.length === 0) {
      return [];
    }
    
    // 2. Obtener todas las categorías y características en consultas paralelas
    const serviceIds = servicesResult.rows.map(row => row.id);
    
    const [categoriesResult, featuresResult] = await Promise.all([
      db.execute(`
        SELECT sc.service_id, c.name
        FROM service_categories sc
        JOIN categories c ON sc.category_id = c.id
        WHERE sc.service_id IN (${serviceIds.map(() => '?').join(',')})
      `, serviceIds),
      
      db.execute(`
        SELECT service_id, feature_es, feature_en
        FROM features
        WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
      `, serviceIds)
    ]);
    
    console.log(`Categorías y características obtenidas en ${performance.now() - startTime}ms`);
    
    // 3. Crear mapas para un acceso más rápido
    const categoriesMap = new Map<string, string[]>();
    const featuresMap = new Map<string, { es: string[], en: string[] }>();
    
    // Procesar categorías
    for (const row of categoriesResult.rows) {
      const serviceId = row.service_id as string;
      const categoryName = row.name as string;
      
      if (!categoriesMap.has(serviceId)) {
        categoriesMap.set(serviceId, []);
      }
      
      categoriesMap.get(serviceId)!.push(categoryName);
    }
    
    // Procesar características
    for (const row of featuresResult.rows) {
      const serviceId = row.service_id as string;
      const featureEs = row.feature_es as string;
      const featureEn = row.feature_en as string;
      
      if (!featuresMap.has(serviceId)) {
        featuresMap.set(serviceId, { es: [], en: [] });
      }
      
      featuresMap.get(serviceId)!.es.push(featureEs);
      featuresMap.get(serviceId)!.en.push(featureEn);
    }
    
    // 4. Construir objetos de servicio
    const services: AIService[] = servicesResult.rows.map(row => {
      const serviceId = row.id as string;
      
      return {
        id: serviceId,
        name: row.name as string,
        description: {
          es: row.description_es as string,
          en: row.description_en as string
        },
        price: row.price as string,
        priceDetails: row.price_details as string,
        categories: categoriesMap.get(serviceId) || [],
        type: row.type as "api" | "individual" | "code-editor",
        features: featuresMap.get(serviceId) || { es: [], en: [] },
        rating: row.rating as number,
        hasFree: Boolean(row.has_free),
        hasAPI: Boolean(row.has_api),
        commercialUse: Boolean(row.commercial_use),
        customModels: Boolean(row.custom_models),
        isNew: Boolean(row.is_new),
        releaseYear: row.release_year as number
      };
    });
    
    const endTime = performance.now();
    
    cache.set(cacheKey, { data: services, timestamp: now });
    
    return services;
  } catch (error) {
    console.error('Error en getAIServices:', error);
    throw error;
  }
}

export async function getCategories(): Promise<string[]> {
  const result = await db.execute('SELECT name FROM categories ORDER BY name');
  return result.rows.map(row => row.name as string);
}