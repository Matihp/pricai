import type { AIService } from '@/lib/services';

// Función para filtrar servicios por tipos
export function filterServicesByTypes(
  services: AIService[], 
  types: string[]
): AIService[] {
  if (!types || types.length === 0) return services;
  
  return services.filter(service => 
    types.some(t => service.types.includes(t as "api" | "individual" | "code-editor"))
  );
}

// Función para filtrar servicios por termino de búsqueda
export function filterServicesBySearchTerm(
  services: AIService[], 
  searchTerm: string | null
): AIService[] {
  if (!searchTerm) return services;
  
  const term = searchTerm.toLowerCase();
  return services.filter(service => {
    const nameMatch = service.name.toLowerCase().includes(term);

    let descMatch = false;
    if (typeof service.description === 'object') {
      descMatch = (
        ((service.description.es?.toLowerCase() || '').includes(term)) || 
        ((service.description.en?.toLowerCase() || '').includes(term))
      );
    } else if (typeof service.description === 'string') {
      descMatch = service.description.toLowerCase().includes(term);
    }
    
    // Buscar en los modelos
    const modelMatch = service.models.some(model => {
      const modelNameMatch = model.name.toLowerCase().includes(term);
      
      let modelDescMatch = false;
      if (typeof model.description === 'object') {
        modelDescMatch = (
          ((model.description.es?.toLowerCase() || '').includes(term)) || 
          ((model.description.en?.toLowerCase() || '').includes(term))
        );
      } else if (typeof model.description === 'string') {
        modelDescMatch = model.description.toLowerCase().includes(term);
      }
      
      return modelNameMatch || modelDescMatch;
    });
    
    // Buscar en características
    const featureMatch = (
      service.features.es.some(feature => feature.toLowerCase().includes(term)) ||
      service.features.en.some(feature => feature.toLowerCase().includes(term))
    );

    // Buscar en casos de uso
    const useCaseMatch = service.useCases ? (
      service.useCases.es.some(useCase => useCase.toLowerCase().includes(term)) ||
      service.useCases.en.some(useCase => useCase.toLowerCase().includes(term))
    ) : false;
    
    return nameMatch || descMatch || modelMatch || featureMatch || useCaseMatch;
  });
}