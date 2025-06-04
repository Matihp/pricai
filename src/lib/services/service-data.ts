import { type AIService, type ServiceFilters, type ServicesResult } from './types';
import { allServicesCache, CACHE_TTL, setCacheItem, getCacheItem } from './cache';
import { 
  buildWhereClause, 
  countServices, 
  fetchServices, 
  fetchServiceCategories, 
  fetchServiceTypes, 
  fetchServiceFeatures, 
  fetchServiceModels, 
  fetchServiceUseCases, 
  fetchServiceTools,
  fetchAllCategories
} from './queries';
import { mapServiceFromDB, mapModelFromDB } from './mappers';

// Función para obtener servicios de IA
export async function getAIServices(
  type?: string,
  page?: number,
  limit?: number,
  filters?: ServiceFilters
): Promise<ServicesResult> {
  const filterKey = filters ? JSON.stringify(filters) : '';
  const cacheKey = `services:${type || 'all'}:${page || 1}:${limit || 0}:${filterKey}`;
  
  // Intentar obtener del cache
  const cachedResult = getCacheItem<ServicesResult>(cacheKey);
  if (cachedResult) {
    console.log(`Cache hit for getAIServices(${type || 'all'}, ${page}, ${limit})`);
    return cachedResult;
  }
  
  const startTime = Date.now();

  try {
    // Construir la consulta
    const { whereClause, queryParams } = buildWhereClause(type, filters);
    
    // Obtener el total de servicios
    const total = await countServices(whereClause, queryParams);
    
    // Si no hay resultados, devolver array vacío
    if (total === 0) {
      return { services: [], total: 0 };
    }
    
    // Obtener los servicios básicos
    const servicesRows = await fetchServices(whereClause, queryParams, page, limit);
    
    if (servicesRows.length === 0) {
      return { services: [], total: 0 };
    }

    // Extraer los IDs de los servicios
    const serviceIds = servicesRows.map(row => row.id);

    // Obtener datos relacionados en paralelo
    const [
      categoriesResult, 
      typesResult, 
      featuresResult, 
      modelsResult, 
      useCasesResult, 
      toolsResult
    ] = await Promise.all([
      fetchServiceCategories(serviceIds),
      fetchServiceTypes(serviceIds),
      fetchServiceFeatures(serviceIds),
      fetchServiceModels(serviceIds),
      fetchServiceUseCases(serviceIds),
      fetchServiceTools(serviceIds)
    ]);

    console.log(`Data fetched in ${Date.now() - startTime}ms`);

    // Mapear los resultados a estructuras de datos
    const categoriesMap = new Map<string, string[]>();
    const typesMap = new Map<string, ("api" | "individual" | "code-editor")[]>();
    const featuresMap = new Map<string, { es: string[], en: string[] }>();
    const modelsMap = new Map<string, any[]>();
    const useCasesMap = new Map<string, { es: string[], en: string[] }>();
    const toolsMap = new Map<string, Record<string, any>>();

    // Procesar categorías
    for (const row of categoriesResult) {
      const serviceId = row.service_id as string;
      const categoryName = row.name as string;
      if (!categoriesMap.has(serviceId)) {
        categoriesMap.set(serviceId, []);
      }
      categoriesMap.get(serviceId)!.push(categoryName);
    }

    // Procesar tipos
    for (const row of typesResult) {
      const serviceId = row.service_id as string;
      const type = row.type as "api" | "individual" | "code-editor";
      if (!typesMap.has(serviceId)) {
        typesMap.set(serviceId, []);
      }
      typesMap.get(serviceId)!.push(type);
    }

    // Procesar características
    for (const row of featuresResult) {
      const serviceId = row.service_id as string;
      const featureEs = row.feature_es as string;
      const featureEn = row.feature_en as string;
      if (!featuresMap.has(serviceId)) {
        featuresMap.set(serviceId, { es: [], en: [] });
      }
      featuresMap.get(serviceId)!.es.push(featureEs);
      featuresMap.get(serviceId)!.en.push(featureEn);
    }

    // Procesar modelos
    for (const row of modelsResult) {
      const serviceId = row.service_id as string;
      if (!modelsMap.has(serviceId)) {
        modelsMap.set(serviceId, []);
      }
      
      const model = mapModelFromDB(row);
      modelsMap.get(serviceId)!.push(model);
    }

    // Procesar casos de uso
    for (const row of useCasesResult) {
      const serviceId = row.service_id as string;
      const useCaseEs = row.use_case_es as string;
      const useCaseEn = row.use_case_en as string;
      if (!useCasesMap.has(serviceId)) {
        useCasesMap.set(serviceId, { es: [], en: [] });
      }
      useCasesMap.get(serviceId)!.es.push(useCaseEs);
      useCasesMap.get(serviceId)!.en.push(useCaseEn);
    }

    // Procesar herramientas
    for (const row of toolsResult) {
      const serviceId = row.service_id as string;
      const toolName = row.tool_name as string;
      const toolData = JSON.parse(row.tool_data as string);
      if (!toolsMap.has(serviceId)) {
        toolsMap.set(serviceId, {});
      }
      toolsMap.get(serviceId)![toolName] = toolData;
    }

    // Construir los objetos de servicio completos
    const services: AIService[] = servicesRows.map(row => {
      const serviceId = row.id as string;
      const baseService = mapServiceFromDB(row);

      return {
        ...baseService,
        id: serviceId,
        models: modelsMap.get(serviceId) || [],
        categories: categoriesMap.get(serviceId) || [],
        types: typesMap.get(serviceId) || [],
        features: featuresMap.get(serviceId) || { es: [], en: [] },
        tools: toolsMap.get(serviceId),
        useCases: useCasesMap.get(serviceId) || { es: [], en: [] },
      } as AIService;
    });

    // Aplicar filtros adicionales
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

    // Guardar en caché
    setCacheItem(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error en getAIServices:', error);
    throw error;
  }
}

// Función para obtener un servicio por ID
export async function getServiceById(id: string): Promise<AIService | null> {
  const cacheKey = `service:${id}`;
  const now = Date.now();

  // Intentar obtener del caché
  const cachedService = getCacheItem<AIService>(cacheKey);
  if (cachedService) {
    return cachedService;
  }

  if (allServicesCache && now - allServicesCache.timestamp < CACHE_TTL) {
    const service = allServicesCache.data.find(s => s.id === id);
    if (service) {
      setCacheItem(cacheKey, service);
      return service;
    }
  }
  
  try {
    // Obtener el servicio básico
    const servicesRows = await fetchServices('WHERE s.id = ?', [id]);

    if (servicesRows.length === 0) {
      return null;
    }

    // Obtener datos relacionados en paralelo
    const [
      categoriesResult, 
      typesResult, 
      featuresResult, 
      modelsResult, 
      useCasesResult, 
      toolsResult
    ] = await Promise.all([
      fetchServiceCategories([id]),
      fetchServiceTypes([id]),
      fetchServiceFeatures([id]),
      fetchServiceModels([id]),
      fetchServiceUseCases([id]),
      fetchServiceTools([id])
    ]);

    // Procesar los resultados
    const categories: string[] = categoriesResult.map(row => row.name as string);
    
    const types: ("api" | "individual" | "code-editor")[] = typesResult.map(
      row => row.type as "api" | "individual" | "code-editor"
    );
    
    const features = { es: [], en: [] } as { es: string[], en: string[] };
    for (const row of featuresResult) {
      features.es.push(row.feature_es as string);
      features.en.push(row.feature_en as string);
    }
    
    const models = modelsResult.map(row => mapModelFromDB(row));
    
    const useCases = { es: [], en: [] } as { es: string[], en: string[] };
    for (const row of useCasesResult) {
      useCases.es.push(row.use_case_es as string);
      useCases.en.push(row.use_case_en as string);
    }
    
    const tools: Record<string, any> = {};
    for (const row of toolsResult) {
      tools[row.tool_name as string] = JSON.parse(row.tool_data as string);
    }

    // Construir el objeto de servicio completo
    const baseService = mapServiceFromDB(servicesRows[0]);
    
    const service: AIService = {
      ...baseService,
      models,
      categories,
      types,
      features,
      tools: Object.keys(tools).length ? tools : undefined,
      useCases,
    } as AIService;

    // Guardar en caché
    setCacheItem(cacheKey, service);
    return service;
  } catch (error) {
    console.error('Error en getServiceById:', error);
    throw error;
  }
}

// Función para obtener servicios relacionados
export async function getRelatedServices(
  serviceId: string,
  categories: string[],
  limit: number = 3,
  type?: string
): Promise<AIService[]> {
  try {
    // Obtener todos los servicios que comparten categorías
    const result = await getAIServices(undefined, 1, 50, {
      categories
    });
    
    // Filtrar los servicios para excluir el servicio actual
    let relatedServices = result.services.filter(service => service.id !== serviceId);
    
    // Si se proporciona un tipo, filtrar por ese tipo
    if (type) {
      relatedServices = relatedServices.filter(service => 
        service.types.includes(type as "api" | "individual" | "code-editor")
      );
    }
    
    // Ordenar por relevancia (número de categorías compartidas)
    relatedServices.sort((a, b) => {
      const aMatches = a.categories.filter(cat => categories.includes(cat)).length;
      const bMatches = b.categories.filter(cat => categories.includes(cat)).length;
      return bMatches - aMatches;
    });
    
    // Limitar el número de resultados
    return relatedServices.slice(0, limit);
  } catch (error) {
    console.error('Error al obtener servicios relacionados:', error);
    return [];
  }
}

// Función para obtener todas las categorías
export async function getCategories(): Promise<string[]> {
  const cacheKey = 'categories:all';
  
  // Intentar obtener del caché
  const cachedCategories = getCacheItem<string[]>(cacheKey);
  if (cachedCategories) {
    return cachedCategories;
  }
  
  // Obtener categorías de la base de datos
  const categories = await fetchAllCategories();
  
  // Guardar en caché
  setCacheItem(cacheKey, categories);
  
  return categories;
}