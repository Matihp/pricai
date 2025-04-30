import { Plus, SquarePlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AIService } from "@/data/ai-data";
import { type SupportedLocale, getTranslation } from "../../utils/i18n";
import { useCompareContext } from "@/contexts/CompareContext";
export const prerender = false;

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
};

interface ServiceCardProps {
  service: AIService;
  locale?: SupportedLocale;
  activeType?: "api" | "individual" | "code-editor"; // Tipo específico en lugar de string
}

export default function ServiceCard({
  service,
  locale = "es",
  activeType, // Valor que viene de la pestaña activa
}: ServiceCardProps) {
  const t = getTranslation(locale);
  const { addToCompare, removeFromCompare, isInCompareList } = useCompareContext();
  const isCompared = isInCompareList(service.id);
  
  // Determinar qué tipo de servicio usar para la redirección
  const serviceType = activeType && service.types.includes(activeType) 
    ? activeType 
    : service.types[0];
  
  const description =
    typeof service.description === "object"
      ? service.description[locale]
      : service.description;

  const features = Array.isArray(service.features)
    ? service.features
    : service.features[locale] || service.features["en"];
    
  const logoColor = stringToColor(service.name);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full relative">
      {service.isNew && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-bl-md z-10">
          {t("service.new")}
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
            style={{
              backgroundColor: `${logoColor}20`,
              borderColor: `${logoColor}40`,
              border: `1px outset rgba(255, 255, 255, 0.2)`
            }}
          >
            <span className="text-lg font-bold" style={{ color: logoColor }}>
              {service.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <CardTitle className="line-clamp-1 text-xl">{service.name}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="flex flex-wrap gap-1 mb-4 min-h-[28px]">
          {service.categories.map((category) => (
            <Badge key={category} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>
        <div className="mb-4">
          {/* <div className="text-2xl font-bold">{service.price}</div> */}
          <div className="text-sm text-muted-foreground">
            {service.priceDetails}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between lg:gap-2 border-t pt-4 pb-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="cursor-pointer w-[45%] lg:w-[50%]"
              style={{
                height: "35px",
              }} 
              variant="outline">
              {t("button.features")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${logoColor}20` }}
                >
                  <span className="text-lg font-bold" style={{ color: logoColor }}>
                    {service.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <DialogTitle>{service.name}</DialogTitle>
              </div>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium mb-2">{t("service.pricing")}</h4>
                {/* <div className="text-2xl font-bold">{service.price}</div> */}
                <div className="text-sm text-muted-foreground">
                  {service.priceDetails}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("service.keyFeatures")}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {features.map((feature, index) => (
                    <li key={index} className="text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end">
            <Button
                className="cursor-pointer"
                variant="default"
                onClick={() =>
                  (window.location.href = `/${locale}/${serviceType}/${service.id}`)
                }
              >
                {t("button.details")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2 w-[45%] lg:w-[45%]">
          <Button
            className="cursor-pointer flex-1"
            style={{
              height: "35px",
            }}
            variant="default"
            onClick={() => (window.location.href = `/${locale}/${serviceType}/${service.id}`)}
          >
            {t("button.details")}
          </Button>
          
          <Button
            className="cursor-pointer w-9 h-[35px] p-0 flex items-center justify-center"
            variant={isCompared ? "destructive" : "outline"}
            onClick={(e) => {
              e.preventDefault();
              isCompared ? removeFromCompare(service.id) : addToCompare(service);
            }}
            title={isCompared ? t("button.removeCompare") : t("button.addCompare")}
          >
            {isCompared ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <Plus strokeWidth={3}/>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
