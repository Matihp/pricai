import { db } from './db';
import type { AIService } from '@/data/ai-data';

const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; 

let allServicesCache: { data: AIService[], timestamp: number } | null = null;

export async function getAIServices(
  type?: string,
  page?: number,
  limit?: number,
  filters?: {
    categories?: string[],
    minRating?: number,
    hasFree?: boolean,
    hasAPI?: boolean,
    commercialUse?: boolean,
    customModels?: boolean,
    isNew?: boolean,
    releaseYear?: number
  }
): Promise<{services: AIService[], total: number}> {
  const filterKey = filters ? JSON.stringify(filters) : '';
  const cacheKey = `services:${type || 'all'}:${page || 1}:${limit || 0}:${filterKey}`;
  const now = Date.now();
  
  const cachedData = cache.get(cacheKey);
  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    console.log(`Cache hit for getAIServices(${type || 'all'}, ${page}, ${limit})`);
    return cachedData.data;
  }
  
  const startTime = Date.now();

  try {
    // Construir la consulta base
    let whereClause = type ? 'WHERE s.type = ?' : 'WHERE 1=1';
    let queryParams: any[] = type ? [type] : [];
    
    // Añadir filtros adicionales si están presentes
    if (filters) {
      if (filters.minRating) {
        whereClause += ' AND s.rating >= ?';
        queryParams.push(filters.minRating);
      }
      
      if (filters.hasFree) {
        whereClause += ' AND s.has_free = 1';
      }
      
      if (filters.hasAPI) {
        whereClause += ' AND s.has_api = 1';
      }
      
      if (filters.commercialUse) {
        whereClause += ' AND s.commercial_use = 1';
      }
      
      if (filters.customModels) {
        whereClause += ' AND s.custom_models = 1';
      }
      
      if (filters.isNew) {
        whereClause += ' AND s.is_new = 1';
      }
      
      if (filters.releaseYear) {
        whereClause += ' AND s.release_year = ?';
        queryParams.push(filters.releaseYear);
      }
    }
    
    // Primero obtenemos el total de registros que coinciden con los filtros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ai_services s
      ${whereClause}
    `;
    
    const countResult = await db.execute({
      sql: countQuery,
      args: queryParams
    });
    
    const total = parseInt(countResult.rows[0].total as string);
    
    // Luego obtenemos los servicios paginados
    let servicesQuery = `
      SELECT 
        s.id, s.name, s.description_es, s.description_en, s.price, s.price_details, 
        s.type, s.rating, s.has_free, s.has_api, s.commercial_use, s.custom_models, s.is_new, s.release_year
      FROM ai_services s
      ${whereClause}
    `;
    
    // Añadimos la paginación solo si se especifican los parámetros
    if (page && limit) {
      const offset = (page - 1) * limit;
      servicesQuery += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
    }

    const servicesResult = await db.execute({
      sql: servicesQuery,
      args: queryParams
    });

    if (servicesResult.rows.length === 0) {
      return { services: [], total: 0 };
    }

    const serviceIds = servicesResult.rows.map(row => row.id);

    // Obtener categorías y características para los servicios filtrados
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

    console.log(`Categorías y características obtenidas en ${Date.now() - startTime}ms`);

    const categoriesMap = new Map<string, string[]>();
    const featuresMap = new Map<string, { es: string[], en: string[] }>();

    for (const row of categoriesResult.rows) {
      const serviceId = row.service_id as string;
      const categoryName = row.name as string;
      if (!categoriesMap.has(serviceId)) {
        categoriesMap.set(serviceId, []);
      }
      categoriesMap.get(serviceId)!.push(categoryName);
    }

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

    let filteredServices = services;
    if (filters?.categories && filters.categories.length > 0) {
      filteredServices = filteredServices.filter(service => 
        filters.categories!.some(cat => service.categories.includes(cat))
      );
    }

    const result = { services: filteredServices, total };

    cache.set(cacheKey, { data: result, timestamp: now });
    
    return result;
  } catch (error) {
    console.error('Error en getAIServices:', error);
    throw error;
  }
}

export async function getServiceById(id: string): Promise<AIService | null> {
  const cacheKey = `service:${id}`;
  const now = Date.now();

  const cachedData = cache.get(cacheKey);
  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    console.log(`Cache hit for getServiceById(${id})`);
    return cachedData.data;
  }

  if (allServicesCache && now - allServicesCache.timestamp < CACHE_TTL) {
    const service = allServicesCache.data.find(s => s.id === id);
    if (service) {
      console.log(`Found service ${id} in allServicesCache`);
      cache.set(cacheKey, { data: service, timestamp: now });
      return service;
    }
  }
  
  try {
    const serviceQuery = `
      SELECT 
        s.id, s.name, s.description_es, s.description_en, s.price, s.price_details, 
        s.type, s.rating, s.has_free, s.has_api, s.commercial_use, s.custom_models, s.is_new, s.release_year
      FROM ai_services s
      WHERE s.id = ?
    `;

    const serviceResult = await db.execute({
      sql: serviceQuery,
      args: [id]
    });

    if (serviceResult.rows.length === 0) {
      return null;
    }

    const [categoriesResult, featuresResult] = await Promise.all([
      db.execute(`
        SELECT sc.service_id, c.name
        FROM service_categories sc
        JOIN categories c ON sc.category_id = c.id
        WHERE sc.service_id = ?
      `, [id]),
      
      db.execute(`
        SELECT service_id, feature_es, feature_en
        FROM features
        WHERE service_id = ?
      `, [id])
    ]);

    const categories: string[] = categoriesResult.rows.map(row => row.name as string);
    
    const features = { es: [], en: [] } as { es: string[], en: string[] };
    for (const row of featuresResult.rows) {
      features.es.push(row.feature_es as string);
      features.en.push(row.feature_en as string);
    }

    const row = serviceResult.rows[0];
    const service: AIService = {
      id: row.id as string,
      name: row.name as string,
      description: {
        es: row.description_es as string,
        en: row.description_en as string
      },
      price: row.price as string,
      priceDetails: row.price_details as string,
      categories,
      type: row.type as "api" | "individual" | "code-editor",
      features,
      rating: row.rating as number,
      hasFree: Boolean(row.has_free),
      hasAPI: Boolean(row.has_api),
      commercialUse: Boolean(row.commercial_use),
      customModels: Boolean(row.custom_models),
      isNew: Boolean(row.is_new),
      releaseYear: row.release_year as number
    };

    cache.set(cacheKey, { data: service, timestamp: now });
    return service;
  } catch (error) {
    console.error('Error en getServiceById:', error);
    throw error;
  }
}

export async function getCategories(): Promise<string[]> {
  const result = await db.execute('SELECT name FROM categories ORDER BY name');
  return result.rows.map(row => row.name as string);
}

export async function getRelatedServices(
  serviceId: string, 
  categories: string[], 
  limit: number = 3
): Promise<AIService[]> {
  const now = Date.now();
  
  if (allServicesCache && now - allServicesCache.timestamp < CACHE_TTL) {
    return allServicesCache.data
      .filter(s => 
        s.id !== serviceId && 
        s.categories.some(cat => categories.includes(cat))
      )
      .slice(0, limit);
  }
  
  const result = await getAIServices();
  
  return result.services
    .filter(s => 
      s.id !== serviceId && 
      s.categories.some(cat => categories.includes(cat))
    )
    .slice(0, limit);
}
