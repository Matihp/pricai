import { db } from '../db';
import { type ServiceFilters } from './types';

// Función para construir el WHERE y los parámetros de consulta
export function buildWhereClause(type?: string, filters?: ServiceFilters): {
  whereClause: string;
  queryParams: any[];
} {
  let whereClause = type ? 'WHERE st.type = ?' : 'WHERE 1=1';
  let queryParams: any[] = type ? [type] : [];
  
  if (!filters) return { whereClause, queryParams };
  
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

  return { whereClause, queryParams };
}

// Consulta para contar servicios
export async function countServices(whereClause: string, queryParams: any[]): Promise<number> {
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
  
  return parseInt(countResult.rows[0].total as string);
}

// Obtener servicios básicos
export async function fetchServices(
  whereClause: string, 
  queryParams: any[], 
  page?: number, 
  limit?: number
): Promise<any[]> {
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

  return servicesResult.rows;
}

// Obtener categorías de servicios
export async function fetchServiceCategories(serviceIds: string[]): Promise<any[]> {
  const result = await db.execute(`
    SELECT sc.service_id, c.name
    FROM service_categories sc
    JOIN categories c ON sc.category_id = c.id
    WHERE sc.service_id IN (${serviceIds.map(() => '?').join(',')})
  `, serviceIds);
  
  return result.rows;
}

// Obtener tipos de servicios
export async function fetchServiceTypes(serviceIds: string[]): Promise<any[]> {
  const result = await db.execute(`
    SELECT service_id, type
    FROM service_types
    WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
  `, serviceIds);
  
  return result.rows;
}

// Obtener características de servicios
export async function fetchServiceFeatures(serviceIds: string[]): Promise<any[]> {
  const result = await db.execute(`
    SELECT service_id, feature_es, feature_en
    FROM features
    WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
  `, serviceIds);
  
  return result.rows;
}

// Obtener modelos de servicios
export async function fetchServiceModels(serviceIds: string[]): Promise<any[]> {
  const result = await db.execute(`
    SELECT 
      m.service_id, m.name, m.description_es, m.description_en, 
      m.price_input, m.price_cached_input, m.price_output, 
      m.context_length, m.rating, m.additional_price_data
    FROM models m
    WHERE m.service_id IN (${serviceIds.map(() => '?').join(',')})
  `, serviceIds);
  
  return result.rows;
}

// Obtener casos de uso de servicios
export async function fetchServiceUseCases(serviceIds: string[]): Promise<any[]> {
  const result = await db.execute(`
    SELECT service_id, use_case_es, use_case_en
    FROM use_cases
    WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
  `, serviceIds);
  
  return result.rows;
}

// Obtener herramientas de servicios
export async function fetchServiceTools(serviceIds: string[]): Promise<any[]> {
  const result = await db.execute(`
    SELECT service_id, tool_name, tool_data
    FROM tools
    WHERE service_id IN (${serviceIds.map(() => '?').join(',')})
  `, serviceIds);
  
  return result.rows;
}

// Obtener todas las categorías
export async function fetchAllCategories(): Promise<string[]> {
  const result = await db.execute('SELECT name FROM categories ORDER BY name');
  return result.rows.map(row => row.name as string);
}