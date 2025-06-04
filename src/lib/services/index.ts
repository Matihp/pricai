export * from './types';

// Exportar funciones principales
export { getAIServices, getServiceById, getRelatedServices, getCategories } from './service-data';

// Exportar función de precarga
export { preloadCommonData } from './preload';

// Iniciar precarga al importar el módulo
import { preloadCommonData } from './preload';
preloadCommonData().catch(console.error);