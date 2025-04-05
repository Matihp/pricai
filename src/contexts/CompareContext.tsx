import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AIService } from '@/data/ai-data';

interface CompareContextType {
  compareList: AIService[];
  addToCompare: (service: AIService) => void;
  removeFromCompare: (serviceId: string) => void;
  clearCompareList: () => void;
  isInCompareList: (serviceId: string) => boolean;
}

// Proporcionar un valor por defecto al contexto para evitar errores cuando se usa fuera del Provider
const defaultContextValue: CompareContextType = {
  compareList: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompareList: () => {},
  isInCompareList: () => false,
};

const CompareContext = createContext<CompareContextType>(defaultContextValue);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<AIService[]>([]);

  // Cargar la lista de comparación desde localStorage al iniciar
  useEffect(() => {
    // Verificar que estamos en el navegador antes de acceder a localStorage
    if (typeof window !== 'undefined') {
      const savedList = localStorage.getItem('compareList');
      if (savedList) {
        try {
          setCompareList(JSON.parse(savedList));
        } catch (e) {
          console.error('Error loading compare list from localStorage', e);
        }
      }
    }
  }, []);

  // Guardar la lista de comparación en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('compareList', JSON.stringify(compareList));
    }
  }, [compareList]);

  const addToCompare = (service: AIService) => {
    if (compareList.length >= 4) {
      alert('No puedes comparar más de 4 servicios a la vez');
      return;
    }
    if (!compareList.some(item => item.id === service.id)) {
      setCompareList([...compareList, service]);
    }
  };

  const removeFromCompare = (serviceId: string) => {
    setCompareList(compareList.filter(service => service.id !== serviceId));
  };

  const clearCompareList = () => {
    setCompareList([]);
  };

  const isInCompareList = (serviceId: string) => {
    return compareList.some(service => service.id === serviceId);
  };

  return (
    <CompareContext.Provider value={{ 
      compareList, 
      addToCompare, 
      removeFromCompare, 
      clearCompareList,
      isInCompareList
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompareContext() {
  const context = useContext(CompareContext);
  return context;
}