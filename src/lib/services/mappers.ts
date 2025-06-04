import { type AIService, type AIModel, type Description } from './types';

// Mapear los resultados de la base de datos a objetos de servicio
export function mapServiceFromDB(row: any): Partial<AIService> {
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
    id: row.id as string,
    name: row.name as string,
    description: Object.keys(description).length ? description : "",
    priceDetails: row.price_details as string,
    hasFree: Boolean(row.has_free),
    hasAPI: Boolean(row.has_api),
    commercialUse: Boolean(row.commercial_use),
    customModels: Boolean(row.custom_models),
    isNew: Boolean(row.is_new),
    releaseYear: row.release_year as number,
    security: Object.keys(security).length ? security : undefined,
    support: Object.keys(support).length ? support : undefined,
    integrations: Object.keys(integrations).length ? integrations : undefined
  };
}

// Mapear los resultados de la base de datos a objetos de modelo
export function mapModelFromDB(row: any): AIModel {
  const priceData: Record<string, string> = {};
  if (row.price_input) priceData.input = row.price_input as string;
  if (row.price_cached_input) priceData.cached_input = row.price_cached_input as string;
  if (row.price_output) priceData.output = row.price_output as string;

  const additionalPriceData = row.additional_price_data ? 
    JSON.parse(row.additional_price_data as string) : {};
  Object.assign(priceData, additionalPriceData);
  
  return {
    name: row.name as string,
    description: {
      es: row.description_es as string,
      en: row.description_en as string
    },
    price: priceData,
    context_length: row.context_length as string,
    rating: row.rating as number
  };
}