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
import { type SupportedLocale } from "../../utils/i18n";

interface ServiceDialogProps {
  service: AIService;
  locale?: SupportedLocale;
}

export default function ServiceDialog({ service, locale = 'es' }: ServiceDialogProps) {

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
          {locale === 'es' ? 'Vista previa' : 'Preview'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium mb-2">{locale === 'es' ? 'Precio' : 'Pricing'}</h4>
            <div className="text-2xl font-bold">{service.price}</div>
            <div className="text-sm text-muted-foreground">{service.priceDetails}</div>
          </div>
          <div>
            <h4 className="font-medium mb-2">{locale === 'es' ? 'Características principales' : 'Key Features'}</h4>
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
          <Button onClick={() => window.location.href = `/services/${service.id}`}>
            {locale === 'es' ? 'Ver detalles completos' : 'View full details'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}