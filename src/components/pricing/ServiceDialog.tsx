import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AIService } from "@/data/ai-data";
import { getTranslation, type SupportedLocale } from "../../utils/i18n";
export const prerender = false;

interface ServiceDialogProps {
  service: AIService;
  locale?: SupportedLocale;
}

export default function ServiceDialog({ service, locale = 'es' }: ServiceDialogProps) {
  const t = getTranslation(locale);

  const description = typeof service.description === 'object' 
    ? service.description[locale] 
    : service.description;
  
  const features = Array.isArray(service.features) 
    ? service.features 
    : (service.features[locale] || service.features['en']);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("button.preview")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium mb-2">{t("service.pricing")}</h4>
            <div className="text-2xl font-bold">{service.price}</div>
            <div className="text-sm text-muted-foreground">{service.priceDetails}</div>
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
          <Button onClick={() => window.location.href = `/${locale}/${service.type}/${service.id}`}>
            {t("button.viewFullDetails")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}