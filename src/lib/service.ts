import { db } from './db';
import type { AIService, AIModel, Description } from '@/data/ai-data';

const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; 

let allServicesCache: { data: AIService[], timestamp: number } | null = null;

// Función para precarga de datos comunes
export async function preloadCommonData(): Promise<void> {
  try {
    // Precargar categorías
    const categoriesKey = 'categories:all';
    if (!cache.has(categoriesKey)) {
      const categories = await getCategories();
      cache.set(categoriesKey, { 
        data: categories, 
        timestamp: Date.now() 
      });
    }
    
    // Precargar servicios populares (primeros 20)
    const popularServicesKey = 'services:popular';
    if (!cache.has(popularServicesKey)) {
      const result = await getAIServices(undefined, 1, 20);
      cache.set(popularServicesKey, { 
        data: result.services, 
        timestamp: Date.now() 
      });
      
      // Actualizar el caché compartido
      allServicesCache = {
        data: result.services,
        timestamp: Date.now()
      };
    }
    
    console.log('Datos comunes precargados correctamente');
  } catch (error) {
    console.error('Error al precargar datos comunes:', error);
  }
}

// Llamar a la precarga al inicializar el módulo
preloadCommonData().catch(console.error);

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
    releaseYear?: number,
    searchTerm?: string
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
    // Modificado para buscar en los tipos (ahora es un array)
    let whereClause = type ? 'WHERE st.type = ?' : 'WHERE 1=1';
    let queryParams: any[] = type ? [type] : [];
    
    // Añadir filtros adicionales si están presentes
    if (filters) {
      
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
      
      if (filters.searchTerm) {
        whereClause += ' AND (s.name LIKE ? OR s.description_es LIKE ? OR s.description_en LIKE ?)';
        const searchPattern = `%${filters.searchTerm}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }
    }
    
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM ai_services s
      LEFT JOIN service_types st ON s.id = st.service_id
      ${whereClause}
    `;
    
    const countResult = await db.execute({
      sql: countQuery,
      args: queryParams
    });
    
    const total = parseInt(countResult.rows[0].total as string);
    
    let servicesQuery = `
      SELECT DISTINCT 
        s.id, s.name, s.description_es, s.description_en, s.price_details, 
        s.has_free, s.has_api, s.commercial_use, s.custom_models, s.is_new, s.release_year,
        s.security_es, s.security_en, s.support_es, s.support_en, s.integrations_es, s.integrations_en
      FROM ai_services s
      LEFT JOIN service_types st ON s.id = st.service_id
      ${whereClause}
    `;

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

    const [
      categoriesResult, 
      typesResult, 
      featuresResult, 
      modelsResult, 
      useCasesResult, 
      toolsResult
    ] = await Promise.all([
      db.execute(`
        SELECT sc.service_id, c.name
        FROM service_categories sc
        JOIN categories c ON sc.category_id = c.id
        WHERE sc.service_id IN (${serviceIds.map(() => '?').join(',')})
      `, serviceIds),
      
      db.execute(`
        SELECT service_id, type
        FROM service_types
        WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
      `, serviceIds),
      
      db.execute(`
        SELECT service_id, feature_es, feature_en
        FROM features
        WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
      `, serviceIds),
      
      db.execute(`
        SELECT 
          m.service_id, m.name, m.description_es, m.description_en, 
          m.price_input, m.price_cached_input, m.price_output, 
          m.context_length, m.rating, m.additional_price_data
        FROM models m
        WHERE m.service_id IN (${serviceIds.map(() => '?').join(',')})
      `, serviceIds),
      
      db.execute(`
        SELECT service_id, use_case_es, use_case_en
        FROM use_cases
        WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
      `, serviceIds),
      
      db.execute(`
        SELECT service_id, tool_name, tool_data
        FROM tools
        WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
      `, serviceIds)
    ]);

    console.log(`Data fetched in ${Date.now() - startTime}ms`);

    const categoriesMap = new Map<string, string[]>();
    const typesMap = new Map<string, ("api" | "individual" | "code-editor")[]>();
    const featuresMap = new Map<string, { es: string[], en: string[] }>();
    const modelsMap = new Map<string, AIModel[]>();
    const useCasesMap = new Map<string, { es: string[], en: string[] }>();
    const toolsMap = new Map<string, Record<string, any>>();

    for (const row of categoriesResult.rows) {
      const serviceId = row.service_id as string;
      const categoryName = row.name as string;
      if (!categoriesMap.has(serviceId)) {
        categoriesMap.set(serviceId, []);
      }
      categoriesMap.get(serviceId)!.push(categoryName);
    }

    for (const row of typesResult.rows) {
      const serviceId = row.service_id as string;
      const type = row.type as "api" | "individual" | "code-editor";
      if (!typesMap.has(serviceId)) {
        typesMap.set(serviceId, []);
      }
      typesMap.get(serviceId)!.push(type);
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

    for (const row of modelsResult.rows) {
      const serviceId = row.service_id as string;
      if (!modelsMap.has(serviceId)) {
        modelsMap.set(serviceId, []);
      }
      
      const priceData: Record<string, string> = {};
      if (row.price_input) priceData.input = row.price_input as string;
      if (row.price_cached_input) priceData.cached_input = row.price_cached_input as string;
      if (row.price_output) priceData.output = row.price_output as string;

      const additionalPriceData = row.additional_price_data ? 
        JSON.parse(row.additional_price_data as string) : {};
      Object.assign(priceData, additionalPriceData);
      
      const model: AIModel = {
        name: row.name as string,
        description: {
          es: row.description_es as string,
          en: row.description_en as string
        },
        price: priceData,
        context_length: row.context_length as string,
        rating: row.rating as number
      };
      
      modelsMap.get(serviceId)!.push(model);
    }

    for (const row of useCasesResult.rows) {
      const serviceId = row.service_id as string;
      const useCaseEs = row.use_case_es as string;
      const useCaseEn = row.use_case_en as string;
      if (!useCasesMap.has(serviceId)) {
        useCasesMap.set(serviceId, { es: [], en: [] });
      }
      useCasesMap.get(serviceId)!.es.push(useCaseEs);
      useCasesMap.get(serviceId)!.en.push(useCaseEn);
    }

    for (const row of toolsResult.rows) {
      const serviceId = row.service_id as string;
      const toolName = row.tool_name as string;
      const toolData = JSON.parse(row.tool_data as string);
      if (!toolsMap.has(serviceId)) {
        toolsMap.set(serviceId, {});
      }
      toolsMap.get(serviceId)![toolName] = toolData;
    }

    const services: AIService[] = servicesResult.rows.map(row => {
      const serviceId = row.id as string;

      const description: Description = {};
      if (row.description_es) description.es = row.description_es as string;
      if (row.description_en) description.en = row.description_en as string;

      const security: Description = {};
      if (row.security_es) security.es = row.security_es as string;
      if (row.security_en) security.en = row.security_en as string;

      const support: Description = {};
      if (row.support_es) support.es = row.support_es as string;
      if (row.support_en) support.en = row.support_en as string;

      const integrations: Description = {};
      if (row.integrations_es) integrations.es = row.integrations_es as string;
      if (row.integrations_en) integrations.en = row.integrations_en as string;

      return {
        id: serviceId,
        name: row.name as string,
        description: Object.keys(description).length ? description : "",
        models: modelsMap.get(serviceId) || [],
        priceDetails: row.price_details as string,
        categories: categoriesMap.get(serviceId) || [],
        types: typesMap.get(serviceId) || [],
        features: featuresMap.get(serviceId) || { es: [], en: [] },
        tools: toolsMap.get(serviceId),
        hasFree: Boolean(row.has_free),
        hasAPI: Boolean(row.has_api),
        commercialUse: Boolean(row.commercial_use),
        customModels: Boolean(row.custom_models),
        isNew: Boolean(row.is_new),
        releaseYear: row.release_year as number,
        security: Object.keys(security).length ? security : undefined,
        support: Object.keys(support).length ? support : undefined,
        useCases: useCasesMap.get(serviceId) || { es: [], en: [] },
        integrations: Object.keys(integrations).length ? integrations : undefined
      };
    });

    let filteredServices = services;

    if (filters?.categories && filters.categories.length > 0) {
      filteredServices = filteredServices.filter(service => 
        filters.categories!.some(cat => service.categories.includes(cat))
      );
    }

    if (filters?.minRating) {
      filteredServices = filteredServices.filter(service => 
        service.models.some(model => model.rating >= filters.minRating!)
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
    return cachedData.data;
  }

  if (allServicesCache && now - allServicesCache.timestamp < CACHE_TTL) {
    const service = allServicesCache.data.find(s => s.id === id);
    if (service) {
      cache.set(cacheKey, { data: service, timestamp: now });
      return service;
    }
  }
  
  try {
    const serviceQuery = `
      SELECT 
        s.id, s.name, s.description_es, s.description_en, s.price_details, 
        s.has_free, s.has_api, s.commercial_use, s.custom_models, s.is_new, s.release_year,
        s.security_es, s.security_en, s.support_es, s.support_en, s.integrations_es, s.integrations_en
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

    const [
      categoriesResult, 
      typesResult, 
      featuresResult, 
      modelsResult, 
      useCasesResult, 
      toolsResult
    ] = await Promise.all([
      db.execute(`
        SELECT sc.service_id, c.name
        FROM service_categories sc
        JOIN categories c ON sc.category_id = c.id
        WHERE sc.service_id = ?
      `, [id]),
      
      db.execute(`
        SELECT service_id, type
        FROM service_types
        WHERE service_id = ?
      `, [id]),
      
      db.execute(`
        SELECT service_id, feature_es, feature_en
        FROM features
        WHERE service_id = ?
      `, [id]),
      
      db.execute(`
        SELECT 
          m.service_id, m.name, m.description_es, m.description_en, 
          m.price_input, m.price_cached_input, m.price_output, 
          m.context_length, m.rating, m.additional_price_data
        FROM models m
        WHERE m.service_id = ?
      `, [id]),
      
      db.execute(`
        SELECT service_id, use_case_es, use_case_en
        FROM use_cases
        WHERE service_id = ?
      `, [id]),
      
      db.execute(`
        SELECT service_id, tool_name, tool_data
        FROM tools
        WHERE service_id = ?
      `, [id])
    ]);

    const categories: string[] = categoriesResult.rows.map(row => row.name as string);
    
    const types: ("api" | "individual" | "code-editor")[] = typesResult.rows.map(
      row => row.type as "api" | "individual" | "code-editor"
    );
    
    const features = { es: [], en: [] } as { es: string[], en: string[] };
    for (const row of featuresResult.rows) {
      features.es.push(row.feature_es as string);
      features.en.push(row.feature_en as string);
    }
    
    const models: AIModel[] = [];
    for (const row of modelsResult.rows) {
      const priceData: Record<string, string> = {};
      if (row.price_input) priceData.input = row.price_input as string;
      if (row.price_cached_input) priceData.cached_input = row.price_cached_input as string;
      if (row.price_output) priceData.output = row.price_output as string;

      const additionalPriceData = row.additional_price_data ? 
        JSON.parse(row.additional_price_data as string) : {};
      Object.assign(priceData, additionalPriceData);
      
      models.push({
        name: row.name as string,
        description: {
          es: row.description_es as string,
          en: row.description_en as string
        },
        price: priceData,
        context_length: row.context_length as string,
        rating: row.rating as number
      });
    }
    
    const useCases = { es: [], en: [] } as { es: string[], en: string[] };
    for (const row of useCasesResult.rows) {
      useCases.es.push(row.use_case_es as string);
      useCases.en.push(row.use_case_en as string);
    }
    
    const tools: Record<string, any> = {};
    for (const row of toolsResult.rows) {
      tools[row.tool_name as string] = JSON.parse(row.tool_data as string);
    }

    const row = serviceResult.rows[0];

    const description: Description = {};
    if (row.description_es) description.es = row.description_es as string;
    if (row.description_en) description.en = row.description_en as string;

    const security: Description = {};
    if (row.security_es) security.es = row.security_es as string;
    if (row.security_en) security.en = row.security_en as string;

    const support: Description = {};
    if (row.support_es) support.es = row.support_es as string;
    if (row.support_en) support.en = row.support_en as string;

    const integrations: Description = {};
    if (row.integrations_es) integrations.es = row.integrations_es as string;
    if (row.integrations_en) integrations.en = row.integrations_en as string;
    
    const service: AIService = {
      id: row.id as string,
      name: row.name as string,
      description: Object.keys(description).length ? description : "",
      models,
      priceDetails: row.price_details as string,
      categories,
      types,
      features,
      tools: Object.keys(tools).length ? tools : undefined,
      hasFree: Boolean(row.has_free),
      hasAPI: Boolean(row.has_api),
      commercialUse: Boolean(row.commercial_use),
      customModels: Boolean(row.custom_models),
      isNew: Boolean(row.is_new),
      releaseYear: row.release_year as number,
      security: Object.keys(security).length ? security : undefined,
      support: Object.keys(support).length ? support : undefined,
      useCases,
      integrations: Object.keys(integrations).length ? integrations : undefined
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
  
  // Si no hay caché, hacemos una consulta específica para servicios relacionados
  // en lugar de obtener todos los servicios
  const categoryPlaceholders = categories.map(() => '?').join(',');
  
  const query = `
    SELECT DISTINCT s.id
    FROM ai_services s
    JOIN service_categories sc ON s.id = sc.service_id
    JOIN categories c ON sc.category_id = c.id
    WHERE s.id != ? 
    AND c.name IN (${categoryPlaceholders})
    LIMIT ?
  `;
  
  const params = [serviceId, ...categories, limit];
  
  try {
    const result = await db.execute({
      sql: query,
      args: params
    });
    
    if (result.rows.length === 0) {
      return [];
    }
    
    // Obtener los detalles completos de los servicios relacionados
    const relatedIds = result.rows.map(row => row.id as string);
    const relatedServices = await Promise.all(
      relatedIds.map(id => getServiceById(id))
    );
    
    return relatedServices.filter(Boolean) as AIService[];
  } catch (error) {
    console.error('Error al obtener servicios relacionados:', error);
    
    // Fallback a la implementación anterior si hay un error
    const result = await getAIServices();
    return result.services
      .filter(s => 
        s.id !== serviceId && 
        s.categories.some(cat => categories.includes(cat))
      )
      .slice(0, limit);
  }
}
