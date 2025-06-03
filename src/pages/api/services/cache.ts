import type { AIService } from '@/lib/services';

export const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

// Tipo para los elementos en caché
export type CachedResult = { 
  data: AIService[], 
  total: number, 
  timestamp: number 
};

// Caché principal para consultas de API
export const cache = new Map<string, CachedResult>();

// Verificar si un elemento en caché es válido
export function isCacheValid(key: string): boolean {
  const cachedItem = cache.get(key);
  if (!cachedItem) return false;
  
  const now = Date.now();
  return now - cachedItem.timestamp < CACHE_TTL;
}

// Obtener un elemento del caché
export function getCachedItem(key: string): CachedResult | undefined {
  if (!isCacheValid(key)) return undefined;
  return cache.get(key);
}

// Guardar un elemento en el caché
export function setCacheItem(key: string, data: AIService[], total: number): void {
  cache.set(key, {
    data,
    total,
    timestamp: Date.now()
  });
}