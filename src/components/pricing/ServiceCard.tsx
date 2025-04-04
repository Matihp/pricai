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
export const prerender = false;

// Function to generate a color based on the service name
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
    
  const logoColor = stringToColor(service.name);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
      {service.isNew && (
        <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-3 absolute right-0 top-4 rounded-l-md">
          {locale === "es" ? "Nuevo" : "New"}
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
          <div className="text-2xl font-bold">{service.price}</div>
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
              Características
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
                className="cursor-pointer"
                variant="default"
                onClick={() =>
                  (window.location.href = `/${locale}/${service.type}/${service.id}`)
                }
              >
                Detalles
              </Button>
            </div>
          </DialogContent>
        </Dialog>

          <Button
            className="cursor-pointer w-[45%] lg:w-[45%] "
            style={{
              height: "35px",
            }}
            variant="default"
            onClick={() => (window.location.href = `/${locale}/${service.type}/${service.id}`)}
          >
            Detalles
          </Button>          

      </CardFooter>
    </Card>
  );
}
