import { getCategories, getAIServices } from './service-data';
import { setCacheItem, updateAllServicesCache } from './cache';

export async function preloadCommonData(): Promise<void> {
  try {
    // Precargar categorías
    const categoriesKey = 'categories:all';
    const categories = await getCategories();
    setCacheItem(categoriesKey, categories);
    
    // Precargar servicios populares (primeros 20)
    const popularServicesKey = 'services:popular';
    const result = await getAIServices(undefined, 1, 20);
    setCacheItem(popularServicesKey, result.services);
    
    // Actualizar el caché compartido usando la función
    updateAllServicesCache(result.services);
    
    console.log('Datos comunes precargados correctamente');
  } catch (error) {
    console.error('Error al precargar datos comunes:', error);
  }
}