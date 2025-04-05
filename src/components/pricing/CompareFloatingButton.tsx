import { useCompareContext } from "../../contexts/CompareContext";
import { getTranslation, type SupportedLocale } from "../../utils/i18n";
import { Button } from "@/components/ui/button";

interface CompareFloatingButtonProps {
  locale: SupportedLocale;
}

export default function CompareFloatingButton({ locale }: CompareFloatingButtonProps) {
  const { compareList, clearCompareList } = useCompareContext();
  const t = getTranslation(locale);

  if (compareList.length === 0) return null;

  const createCompareUrl = () => {
    const params = new URLSearchParams();
    compareList.forEach(service => {
      params.append('ids', `${service.type}:${service.id}`);
    });
    return `/${locale}/compare?${params.toString()}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      <div className="bg-card rounded-lg shadow-lg border border-border p-4 flex flex-col gap-3 max-w-[300px]">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">
            {t("compare.selected")} ({compareList.length}/4)
          </h3>
          <button 
            onClick={clearCompareList}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t("compare.clear")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {compareList.map(service => (
            <div key={service.id} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
              {service.name}
            </div>
          ))}
        </div>
        
        <Button 
          onClick={() => window.location.href = createCompareUrl()}
          className="w-full"
          disabled={compareList.length < 2}
        >
          {t("compare.viewComparison")}
        </Button>
      </div>
    </div>
  );
}