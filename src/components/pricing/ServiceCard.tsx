import { Star } from "lucide-react";
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
import { type SupportedLocale } from "../../utils/i18n";

interface ServiceCardProps {
  service: AIService;
  locale?: SupportedLocale;
}

export default function ServiceCard({
  service,
  locale = "es",
}: ServiceCardProps) {
  const description =
    typeof service.description === "object"
      ? service.description[locale]
      : service.description;

  const features = Array.isArray(service.features)
    ? service.features
    : service.features[locale] || service.features["en"];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
      {service.isNew && (
        <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-3 absolute right-0 top-4 rounded-l-md">
          {locale === "es" ? "Nuevo" : "New"}
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1 text-xl">{service.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{service.rating.toFixed(1)}</span>
          </div>
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
          <div className="text-2xl font-bold">{service.price}</div>
          <div className="text-sm text-muted-foreground">
            {service.priceDetails}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 pb-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Vista previa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{service.name}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium mb-2">Pricing</h4>
                <div className="text-2xl font-bold">{service.price}</div>
                <div className="text-sm text-muted-foreground">
                  {service.priceDetails}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Features</h4>
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
                onClick={() =>
                  (window.location.href = `/services/${service.id}`)
                }
              >
                Ver detalles completos
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="default"
          size="sm"
          onClick={() => (window.location.href = `/services/${service.id}`)}
        >
          Detalles
        </Button>
      </CardFooter>
    </Card>
  );
}
