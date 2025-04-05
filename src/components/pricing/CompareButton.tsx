import { useCompareContext } from "../../contexts/CompareContext";
import { getTranslation, type SupportedLocale } from "../../utils/i18n";
import type { AIService } from "@/data/ai-data";

interface CompareButtonProps {
  service: AIService;
  locale: SupportedLocale;
}

export default function CompareButton({ service, locale }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompareList } = useCompareContext();
  const t = getTranslation(locale);
  const isCompared = isInCompareList(service.id);

  return (
    <button 
      onClick={() => isCompared ? removeFromCompare(service.id) : addToCompare(service)}
      className={`inline-flex items-center justify-center w-full px-4 py-2 rounded-md font-medium transition-colors ${
        isCompared 
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
      }`}
    >
      {isCompared ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          {t('button.removeCompare')}
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="22" y1="11" x2="16" y2="11"></line>
          </svg>
          {t('button.addCompare')}
        </>
      )}
    </button>
  );
}