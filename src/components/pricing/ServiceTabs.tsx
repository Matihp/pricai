import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { AIService } from "@/data/ai-data";
import ServiceCard from "./ServiceCard";
import { type SupportedLocale } from "../../utils/i18n";
import PaginationControls from "./PaginationControls";

interface ServiceTabsProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiServices: AIService[];
  individualServices: AIService[];
  codeEditorServices: AIService[];
  locale?: SupportedLocale;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

export default function ServiceTabs({
  isFilterOpen,
  setIsFilterOpen,
  selectedCategories,
  toggleCategory,
  activeTab,
  setActiveTab,
  apiServices,
  individualServices,
  codeEditorServices,
  locale = 'es',
  currentPage = 1,
  setCurrentPage,
  itemsPerPage = 9,
}: ServiceTabsProps) {
  
  // Función para paginar los servicios
  const paginateServices = (services: AIService[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return services.slice(startIndex, startIndex + itemsPerPage);
  };

  const paginatedApiServices = paginateServices(apiServices);
  const paginatedIndividualServices = paginateServices(individualServices);
  const paginatedCodeEditorServices = paginateServices(codeEditorServices);
  
  const totalServices = activeTab === "api" 
    ? apiServices.length 
    : activeTab === "individual" 
      ? individualServices.length 
      : codeEditorServices.length;
  
  const totalPages = Math.ceil(totalServices / itemsPerPage);
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          className="md:hidden flex items-center gap-2"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-4 w-4" />
          {locale === 'es' ? 'Filtros' : 'Filters'}
          {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                {category}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(category)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Tabs defaultValue="api" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 ">
          <TabsTrigger className="cursor-pointer" value="api">{locale === 'es' ? 'Servicios API' : 'API Services'}</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="individual">{locale === 'es' ? 'Uso Individual' : 'Individual Use'}</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="code-editor">{locale === 'es' ? 'Editores de Código' : 'Code Editors'}</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedApiServices.length > 0 ? (
              paginatedApiServices.map((service) => <ServiceCard key={service.id} service={service} locale={locale} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  {locale === 'es' 
                    ? 'No hay servicios que coincidan con tus filtros' 
                    : 'No services match your filters'}
                </p>
              </div>
            )}
          </div>
          
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            locale={locale}
          />
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedIndividualServices.length > 0 ? (
              paginatedIndividualServices.map((service) => <ServiceCard key={service.id} service={service} locale={locale} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  {locale === 'es' 
                    ? 'No hay servicios que coincidan con tus filtros' 
                    : 'No services match your filters'}
                </p>
              </div>
            )}
          </div>
          
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            locale={locale}
          />
        </TabsContent>

        <TabsContent value="code-editor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCodeEditorServices.length > 0 ? (
              paginatedCodeEditorServices.map((service) => <ServiceCard key={service.id} service={service} locale={locale} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  {locale === 'es' 
                    ? 'No hay servicios que coincidan con tus filtros' 
                    : 'No services match your filters'}
                </p>
              </div>
            )}
          </div>
          
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            locale={locale}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}