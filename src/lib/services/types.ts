import type { AIService, AIModel, Description } from '@/data/ai-data';

// Exportar los tipos para que estén disponibles en todo el módulo de servicios
export type { AIService, AIModel, Description };

export type CacheItem<T> = { data: T, timestamp: number };
export type ServiceCache = { data: AIService[], timestamp: number } | null;

export interface ServiceFilters {
  categories?: string[];
  minRating?: number;
  hasFree?: boolean;
  hasAPI?: boolean;
  commercialUse?: boolean;
  customModels?: boolean;
  isNew?: boolean;
  releaseYear?: number;
  searchTerm?: string;
}

// Tipo para el resultado de getAIServices
export interface ServicesResult {
  services: AIService[];
  total: number;
}