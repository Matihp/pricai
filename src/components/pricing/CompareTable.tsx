import { useEffect, useState } from "react";
import { useCompareContext } from "../../contexts/CompareContext";
import { getTranslation, type SupportedLocale } from "../../utils/i18n";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { AIService } from "@/data/ai-data";

interface CompareTableProps {
  locale: SupportedLocale;
  initialServices?: AIService[];
}

export default function CompareTable({ locale, initialServices = [] }: CompareTableProps) {
  const { compareList, removeFromCompare } = useCompareContext();
  const [isClient, setIsClient] = useState(false);
  const t = getTranslation(locale);

  const displayList = initialServices.length > 0 ? initialServices : compareList;

  useEffect(() => {
    setIsClient(true);
  }, [initialServices]);

  // Mostrar spinner mientras carga
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (displayList.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-8 border border-border text-center">
        <h2 className="text-xl font-semibold mb-4">{t("compare.noServices")}</h2>
        <p className="text-muted-foreground mb-6">{t("compare.addServices")}</p>
        <Button onClick={() => window.location.href = `/${locale}/`}>
          {t("nav.backToHome")}
        </Button>
      </div>
    );
  }

  // Definir las características a comparar
  const comparisonFeatures = [
    { id: "price", label: t("service.pricing") },
    { id: "rating", label: t("service.rating") },
    { id: "releaseYear", label: t("service.releaseYear") },
    { id: "hasFree", label: t("pricing.tier.free") },
    { id: "hasAPI", label: t("service.apiAccess") },
    { id: "commercialUse", label: t("service.commercialUse") },
    { id: "customModels", label: t("service.customModels") },
    { id: "features", label: t("service.keyFeatures") },
  ];

  const renderFeatureValue = (service: AIService, featureId: string) => {
    switch (featureId) {
      case "price":
        return (
          <div>
            <div className="font-bold">{service.price}</div>
            <div className="text-sm text-muted-foreground">{service.priceDetails}</div>
          </div>
        );
      case "rating":
        return (
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400 mr-1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>{service.rating.toFixed(1)}</span>
          </div>
        );
      case "releaseYear":
        return <span>{service.releaseYear}</span>;
      case "hasFree":
      case "hasAPI":
      case "commercialUse":
      case "customModels":
        return service[featureId] ? (
          <Check className="h-5 w-5 text-green-500 mx-auto" />
        ) : (
          <X className="h-5 w-5 text-red-500 mx-auto" />
        );
      case "features":
        const features = Array.isArray(service.features)
          ? service.features
          : service.features[locale] || service.features["en"];
        return (
          <ul className="list-disc pl-5 text-sm">
            {features.slice(0, 3).map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
            {features.length > 3 && (
              <li className="text-muted-foreground">
                +{features.length - 3} {t("compare.more")}
              </li>
            )}
          </ul>
        );
      default:
        return <span>-</span>;
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-4 text-left font-medium text-muted-foreground w-[200px]">
                {t("service.name")}
              </th>
              {displayList.map((service) => (
                <th key={service.id} className="p-4 min-w-[250px]">
                  <div className="flex flex-col items-center">
                    <div className="flex justify-between items-center w-full mb-2">
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <button
                        onClick={() => {
                          // For URL-based services, redirect to a new URL without this service
                          if (initialServices.length > 0) {
                            const newServices = displayList.filter(s => s.id !== service.id);
                            const params = new URLSearchParams();
                            newServices.forEach(s => {
                              params.append('ids', `${s.type}:${s.id}`);
                            });
                            window.location.href = `/${locale}/compare?${params.toString()}`;
                          } else {
                            removeFromCompare(service.id);
                          }
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={t("compare.remove")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {/* <div className="flex gap-1 flex-wrap justify-center">
                      {service.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                        >
                          {category}
                        </span>
                      ))}
                      {service.categories.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          +{service.categories.length - 2}
                        </span>
                      )}
                    </div> */}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((feature, index) => (
              <tr
                key={feature.id}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
              >
                <td className="p-4 font-medium border-t border-border">
                  {feature.label}
                </td>
                {displayList.map((service) => (
                  <td
                    key={`${service.id}-${feature.id}`}
                    className="p-4 text-center border-t border-border"
                  >
                    {renderFeatureValue(service, feature.id)} 
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-border flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {displayList.length} {t("compare.servicesCompared")}
        </span>
      </div>
    </div>
  );
}