import { useState, useEffect } from "react";
import { ArrowLeft, Check, X, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AIService } from "@/data/ai-data";
import { getTranslation, type SupportedLocale } from "../../utils/i18n";
import { useServices } from "@/hooks/useServices";
import { useCompareContext } from "@/contexts/CompareContext";

// Tipos de servicio disponibles
const serviceTypes = [
  { id: "api", label: "API Services" },
  { id: "individual", label: "Individual Use" },
  { id: "code-editor", label: "Code Editors" },
];

// Número máximo de servicios a comparar
const MAX_SERVICES = 4;

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

interface CompareClientProps {
  initialServices: AIService[];
  locale: string;
}

// Componente para el avatar de la empresa
const CompanyAvatar = ({ name, size = "small" }: { name: string, size?: "small" | "large" }) => {
  const companyName = name.charAt(0).toUpperCase() + name.slice(1);
  const dimensions = size === "small" ? "w-10 h-10" : "w-12 h-12";
  const textSize = size === "small" ? "text-lg" : "text-xl";
  
  return (
    <div
      className={`${dimensions} rounded-lg flex items-center justify-center shrink-0`}
      style={{
        backgroundColor: `${stringToColor(companyName)}20`,
        borderColor: `${stringToColor(companyName)}40`,
        border: `1px solid ${stringToColor(companyName)}40`,
      }}
    >
      <span className={`${textSize} font-bold`} style={{ color: stringToColor(companyName) }}>
        {companyName.charAt(0)}
      </span>
    </div>
  );
};

// Componente para mostrar características con iconos
const FeatureItem = ({ label, isEnabled }: { label: string, isEnabled: boolean }) => (
  <div className="flex items-center gap-2">
    <Badge variant={isEnabled ? "default" : "outline"}>{label}</Badge>
    {isEnabled ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    )}
  </div>
);


export default function CompareClient({ initialServices, locale = 'es' }: CompareClientProps) {
  const t = getTranslation(locale as SupportedLocale);
  const { addToCompare, clearCompareList } = useCompareContext();
  
  const [selectedType, setSelectedType] = useState<string>("api");
  const [selectedServices, setSelectedServices] = useState<AIService[]>(initialServices || []);
  const [availableServices, setAvailableServices] = useState<AIService[]>([]);
  
  // Solo iniciamos en modo "compare" si hay initialServices desde la URL
  const [comparisonMode, setComparisonMode] = useState<"select" | "compare">(
    initialServices.length >= 2 && typeof window !== 'undefined' && new URL(window.location.href).searchParams.has('ids') ? "compare" : "select"
  );

  // Usar el hook useServices en lugar de fetch directo
  const { services, loading: isLoading, error } = useServices({ 
    types: [selectedType as "api" | "individual" | "code-editor"] 
  });

  // Cargar servicios desde localStorage si no hay initialServices
  useEffect(() => {
    if (initialServices.length === 0 && typeof window !== 'undefined') {
      try {
        // Intentar cargar desde compareList primero (el formato usado por CompareContext)
        const savedList = localStorage.getItem('compareList');
        if (savedList) {
          const parsedList = JSON.parse(savedList);
          if (Array.isArray(parsedList) && parsedList.length >= 2) {
            setSelectedServices(parsedList);
            // No cambiamos automáticamente a modo "compare"
            // setComparisonMode("compare");
            return;
          }
        }
        
        // Si no hay compareList, intentar con compareServices (formato antiguo)
        const savedIds = localStorage.getItem('compareServices');
        if (savedIds) {
          const parsedIds = JSON.parse(savedIds);
          if (Array.isArray(parsedIds) && parsedIds.length >= 2) {
            // Aca deberíamos cargar los servicios por ID, pero necesitaríamos
            // una función para obtener servicios por ID que no está disponible aquí
            // Por ahora, solo cambiaremos al modo de selección
            setComparisonMode("select");
          }
        }
      } catch (e) {
        console.error('Error loading services from localStorage:', e);
      }
    }
  }, [initialServices]);

  // Actualizar los servicios disponibles cuando cambian los resultados del hook
  useEffect(() => {
    if (services) setAvailableServices(services);
  }, [services]);

  // Sincronizar con el contexto de comparación cuando se cargan servicios iniciales
  useEffect(() => {
    if (initialServices.length > 0 && typeof window !== 'undefined') {
      // Actualizar localStorage con los servicios iniciales
      localStorage.setItem('compareList', JSON.stringify(initialServices));
      
      // Limpiar el contexto y añadir los servicios iniciales
      clearCompareList();
      initialServices.forEach(service => {
        addToCompare(service);
      });
    }
  }, [initialServices, addToCompare, clearCompareList]);

  // Funciones para gestionar servicios
  const addService = (service: AIService) => {
    if (selectedServices.length < MAX_SERVICES && !selectedServices.some(s => s.id === service.id)) {
      const updatedServices = [...selectedServices, service];
      setSelectedServices(updatedServices);
      
      // Guardar en localStorage inmediatamente
      if (typeof window !== 'undefined') {
        localStorage.setItem('compareList', JSON.stringify(updatedServices));
        
        // También actualizar el formato antiguo para compatibilidad
        const serviceIds = updatedServices.map(s => 
          `${s.types && s.types.length > 0 ? s.types[0] : 'unknown'}:${s.id}`
        );
        localStorage.setItem("compareServices", JSON.stringify(serviceIds));
      }
      
      // Añadir al contexto
      addToCompare(service);
    }
  };

  const removeService = (serviceId: string) => {
    const updatedServices = selectedServices.filter((service) => service.id !== serviceId);
    setSelectedServices(updatedServices);
    
    // Guardar en localStorage inmediatamente
    if (typeof window !== 'undefined') {
      localStorage.setItem('compareList', JSON.stringify(updatedServices));
      
      // También actualizar el formato antiguo para compatibilidad
      const serviceIds = updatedServices.map(s => 
        `${s.types && s.types.length > 0 ? s.types[0] : 'unknown'}:${s.id}`
      );
      localStorage.setItem("compareServices", JSON.stringify(serviceIds));
    }
  };

  const startComparison = () => {
    if (canCompare) {
      setComparisonMode("compare");
      
      // Actualizar URL para compartir
      const url = new URL(window.location.href);
      url.searchParams.delete("ids");
      selectedServices.forEach(service => {
        const serviceType = service.types && service.types.length > 0 ? service.types[0] : 'unknown';
        url.searchParams.append("ids", `${serviceType}:${service.id}`);
      });
      window.history.pushState({}, "", url.toString());
    }
  };

  const backToSelection = () => setComparisonMode("select");
  const canCompare = selectedServices.length >= 2;

  // Agrupar servicios por empresa
  const getCompaniesByServices = (services: AIService[]) => {
    const companiesMap = new Map<string, { id: string, name: string, services: AIService[] }>();
    
    services.forEach(service => {
      const companyName = service.name;
      if (!companiesMap.has(companyName)) {
        companiesMap.set(companyName, {
          id: service.id,
          name: companyName,
          services: []
        });
      }
      companiesMap.get(companyName)?.services.push(service);
    });
    
    return Array.from(companiesMap.values());
  };

  const companies = getCompaniesByServices(availableServices);

  // Renderizar tarjeta de servicio seleccionado
  const renderSelectedServiceCard = (service: AIService) => {
    const companyName = service.name.charAt(0).toUpperCase() + service.name.slice(1);
    
    return (
      <Card key={service.id} className="relative">
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7"
          onClick={() => removeService(service.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <CompanyAvatar name={companyName} />
            <div>
              <CardTitle className="text-base">{service.name}</CardTitle>
              <CardDescription className="text-xs">{companyName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm font-medium">{service.priceDetails}</div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar tarjeta de servicio en modo comparación
  const renderComparisonServiceCard = (service: AIService) => {
    const companyName = service.name.charAt(0).toUpperCase() + service.name.slice(1);
    const description = typeof service.description === 'object' 
      ? (service.description as Record<string, string>)[locale] || service.description.en
      : service.description;

    return (
      <Card key={service.id} className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <CompanyAvatar name={companyName} size="large" />
            <div>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{companyName}</CardDescription>
            </div>
          </div>
          <p className="text-sm">{description}</p>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="space-y-6 flex-grow">
            {/* Sección de precios */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("service.pricing")}</h3>
              <div className="p-3 rounded-lg bg-card border">
                <div className="text-xl font-bold">{service.priceDetails}</div>
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("compare.categories")}</h3>
              <div className="flex flex-wrap gap-2">
                {service.categories.map((category) => (
                  <Badge key={category} className="px-2 py-1">{category}</Badge>
                ))}
              </div>
            </div>

            {/* Modelos */}
            {service.models && service.models.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("compare.models")}</h3>
                <div className="space-y-2">
                  {service.models.slice(0, 3).map((model) => {
                    const modelDescription = typeof model.description === 'object'
                      ? (model.description as Record<string, string>)[locale] || model.description.en
                      : model.description;
                      
                    return (
                      <div key={model.name} className="p-2 border rounded-md">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{modelDescription}</div>
                      </div>
                    );
                  })}
                  {service.models.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{service.models.length - 3} {t("compare.moreModels")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Características */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("compare.features")}</h3>
              <div className="space-y-2">
                <FeatureItem label={t("compare.freeTier")} isEnabled={service.hasFree} />
                <FeatureItem label={t("compare.apiAccess")} isEnabled={service.hasAPI} />
                <FeatureItem label={t("compare.commercialUse")} isEnabled={service.commercialUse} />
                <FeatureItem label={t("compare.customModels")} isEnabled={service.customModels} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
      {comparisonMode === "select" ? (
        <>
          <section className="mb-8">
            <p className="text-lg text-muted-foreground max-w-3xl mb-6">
              {t("compare.selectServiceType")}
            </p>

            {/* Selector de tipo de servicio */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-3">{t("compare.selectServiceType")}:</h2>
              <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  {serviceTypes.map((type) => (
                    <TabsTrigger key={type.id} value={type.id}>{type.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </section>

          {/* Servicios seleccionados */}
          {selectedServices.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-3">
                {t("compare.selectedServices")} ({selectedServices.length}/{MAX_SERVICES}):
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedServices.map(renderSelectedServiceCard)}

                {/* Botón para añadir más servicios si no se ha alcanzado el límite */}
                {selectedServices.length < MAX_SERVICES && (
                  <div className="border border-dashed rounded-lg flex items-center justify-center p-6 min-h-[120px]">
                    <div className="text-center text-muted-foreground">
                      <p className="mb-2">{t("compare.addService")}</p>
                      <p className="text-sm">
                        ({MAX_SERVICES - selectedServices.length} {t("compare.slotsAvailable")})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selector de servicios */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-3">
              {t("compare.availableServices")} {serviceTypes.find((type) => type.id === selectedType)?.label}:
            </h2>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center p-8 text-red-500">{t("error.loadingServices")}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <Card key={company.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={company.name} />
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium mb-2">{t("compare.availableServices")}:</div>
                      <div className="space-y-2">
                        {company.services.map((service) => {
                          const isSelected = selectedServices.some(s => s.id === service.id);
                          const isDisabled = selectedServices.length >= MAX_SERVICES && !isSelected;

                          return (
                            <div
                              key={service.id}
                              className={`
                                p-3 rounded-md border flex items-center justify-between
                                ${isSelected ? "bg-primary/10 border-primary" : "hover:bg-secondary/50"}
                                ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                              `}
                              onClick={() => {
                                if (isDisabled) return;
                                isSelected ? removeService(service.id) : addService(service);
                              }}
                            >
                              <div>
                                <div className="font-medium">{service.name}</div>
                                <div className="text-sm text-muted-foreground">{service.priceDetails}</div>
                              </div>
                              <Button
                                variant={isSelected ? "destructive" : "outline"}
                                size="sm"
                                disabled={isDisabled && !isSelected}
                              >
                                {isSelected ? (
                                  <>
                                    <Trash2 className="h-3 w-3 mr-1" /> {t("compare.removeService")}
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3 w-3 mr-1" /> {t("compare.addService")}
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <Button size="lg" disabled={!canCompare} onClick={startComparison} className="px-8">
              {t("compare.compareServices")} {selectedServices.length}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        // Modo de comparación
        <>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={backToSelection}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("compare.backToSelection")}
            </Button>
            <div className="text-lg font-semibold">
              {t("compare.comparing")} {selectedServices.length} {serviceTypes.find((type) => type.id === selectedType)?.label}
            </div>
          </div>

          {/* Tarjetas de servicios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {selectedServices.map(renderComparisonServiceCard)}
          </div>
        </>
      )}
    </div>
  );
}