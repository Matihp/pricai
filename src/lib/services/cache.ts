import { type CacheItem, type ServiceCache } from './types';

export const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

// Cache principal para consultas
export const cache = new Map<string, CacheItem<any>>();

// Cache específico para todos los servicios
export let allServicesCache: ServiceCache = null;

// Actualizar el cache de servicios
export function updateAllServicesCache(services: any[]): void {
  allServicesCache = {
    data: services,
    timestamp: Date.now()
  };
}

// Verificar si un elemento del caché es válido
export function isCacheValid<T>(cachedItem: CacheItem<T> | undefined): boolean {
  if (!cachedItem) return false;
  return Date.now() - cachedItem.timestamp < CACHE_TTL;
}

// Guardar en caché
export function setCacheItem<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Función para obtener del cache
export function getCacheItem<T>(key: string): T | null {
  const item = cache.get(key);
  if (item && isCacheValid(item)) {
    return item.data as T;
  }
  return null;
}