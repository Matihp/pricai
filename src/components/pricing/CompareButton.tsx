import { useCompareContext } from "../../contexts/CompareContext";
import { getTranslation, type SupportedLocale } from "../../utils/i18n";
import { Button } from "@/components/ui/button";
import type { AIService } from "@/data/ai-data";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface CompareButtonProps {
  service: AIService;
  locale: SupportedLocale;
  redirectToHome?: boolean;
}

export default function CompareButton({ service, locale, redirectToHome = false }: CompareButtonProps) {
  const { compareList, addToCompare, removeFromCompare, isInCompareList } = useCompareContext();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const t = getTranslation(locale);

  // Función para verificar si el servicio está en la lista de comparación
  const checkIfServiceIsAdded = () => {
    const inContextList = isInCompareList(service.id);
    
    // Verificar en localStorage directamente
    let inLocalStorage = false;
    if (typeof window !== 'undefined') {
      try {
        const savedList = JSON.parse(localStorage.getItem('compareList') || '[]');
        inLocalStorage = savedList.some((item: any) => item.id === service.id);
      } catch (e) {
        console.error('Error checking localStorage:', e);
      }
    }
    
    return inContextList || inLocalStorage;
  };

  // Verificar al cargar el componente y cuando cambie la lista de comparación
  useEffect(() => {
    const isServiceAdded = checkIfServiceIsAdded();
    setIsAdded(isServiceAdded);
  }, [compareList, service.id]);

  useEffect(() => {
    // Pequeño retraso para asegurar que localStorage esté disponible
    const timer = setTimeout(() => {
      const isServiceAdded = checkIfServiceIsAdded();
      setIsAdded(isServiceAdded);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (isAdded) {
      removeFromCompare(service.id);
      setIsAdded(false);
      if (typeof window !== 'undefined') {
        try {
          const savedList = JSON.parse(localStorage.getItem('compareList') || '[]');
          const updatedList = savedList.filter((item: any) => item.id !== service.id);
          localStorage.setItem('compareList', JSON.stringify(updatedList));    
          window.location.reload();
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
      }
    } else {
      addToCompare(service);
      setIsAdded(true);    
      if (typeof window !== 'undefined') {
        // Actualizar localStorage manualmente para asegurar que se guarde antes de recargar
        const currentList = JSON.parse(localStorage.getItem('compareList') || '[]');
        if (!currentList.some((item: AIService) => item.id === service.id)) {
          const updatedList = [...currentList, service];
          localStorage.setItem('compareList', JSON.stringify(updatedList));
        }
        window.location.reload();
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={isAdded ? "outline" : "secondary"}
      className={`w-full cursor-pointer ${
        isAdded 
          ? isHovered 
            ? 'border-red-500 text-red-500 hover:bg-red-500/10' 
            : 'border-green-500 text-green-500 hover:bg-green-500/10'
          : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isAdded ? (
        <span className="flex items-center justify-center">
          {isHovered ? (
            <>
              <X className="w-4 h-4 mr-2" />
              {t("compare.remove")}
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              {t("compare.alreadyAdded")}
            </>
          )}
        </span>
      ) : (
        t("compare.add")
      )}
    </Button>
  );
}