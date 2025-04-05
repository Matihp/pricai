import { Filter, X, ChevronDown, ChevronUp, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { AIService } from "@/data/ai-data";
import ServiceCard from "./ServiceCard";
import { getTranslation, type SupportedLocale } from "../../utils/i18n";
import PaginationControls from "./PaginationControls";
import { useState, useEffect } from "react";
import { ServiceGridSkeleton, TabsSkeleton } from "./SkeletonLoaders";
export const prerender = false;

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
  isLoading?: boolean;
  error?: Error | null;
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
  isLoading = false,
  error = null
}: ServiceTabsProps) {
  const t = getTranslation(locale);
  
  // Add state for transition
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [visibleTab, setVisibleTab] = useState(activeTab);
  
  useEffect(() => {
    if (activeTab !== visibleTab) {
      setIsTabChanging(true);
      const timer = setTimeout(() => {
        setVisibleTab(activeTab);
        setTimeout(() => {
          setIsTabChanging(false);
        }, 50);
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, visibleTab]);
  
  // Custom tab change handler
  const handleTabChange = (value: string) => {
    if (value !== activeTab) {
      setActiveTab(value);
      // Reset to page 1 when changing tabs
      setCurrentPage(1);
    }
  };
  
  // Función para paginar los servicios
  const paginateServices = (services: AIService[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return services.slice(startIndex, startIndex + itemsPerPage);
  };

  const paginatedApiServices = paginateServices(apiServices);
  const paginatedIndividualServices = paginateServices(individualServices);
  const paginatedCodeEditorServices = paginateServices(codeEditorServices);
  
  const totalServices = visibleTab === "api" 
    ? apiServices.length 
    : visibleTab === "individual" 
      ? individualServices.length 
      : codeEditorServices.length;
  
  const totalPages = Math.ceil(totalServices / itemsPerPage);
  
  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              className="md:hidden p-2 rounded-md border"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FilterIcon className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">
              {t("common.services")}
            </h2>
          </div>
        </div>
        
        <TabsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              className="md:hidden p-2 rounded-md border"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FilterIcon className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">
              {t("common.services")}
            </h2>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <h3 className="text-xl font-bold mb-2">
            {t("error.loadingServices")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("error.tryAgain")}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {t("button.retry")}
          </button>
        </div>
      </div>
    );
  }
  
  // Map service types to their translation keys
  const serviceTypeTranslations = {
    "api": t("serviceType.api"),
    "individual": t("serviceType.individual"),
    "code-editor": t("serviceType.codeEditor")
  };
  
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          className="md:hidden flex items-center gap-2"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-4 w-4" />
          {t("filter.title")}
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

      <Tabs defaultValue="api" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger className="cursor-pointer" value="api">{serviceTypeTranslations["api"]}</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="individual">{serviceTypeTranslations["individual"]}</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="code-editor">{serviceTypeTranslations["code-editor"]}</TabsTrigger>
        </TabsList>

        <div className={`transition-opacity duration-200 ${isTabChanging ? 'opacity-0' : 'opacity-100'}`}>
          {visibleTab === "api" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {paginatedApiServices.length > 0 ? (
                  paginatedApiServices.map((service) => <ServiceCard key={service.id} service={service} locale={locale} />)
                ) : (
                  <ServiceGridSkeleton/>
                )}
              </div>
              
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                locale={locale}
              />
            </div>
          )}

          {visibleTab === "individual" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {paginatedIndividualServices.length > 0 ? (
                  paginatedIndividualServices.map((service) => <ServiceCard key={service.id} service={service} locale={locale} />)
                ) : (
                  <ServiceGridSkeleton/>
                )}
              </div>
              
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                locale={locale}
              />
            </div>
          )}

          {visibleTab === "code-editor" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {paginatedCodeEditorServices.length > 0 ? (
                  paginatedCodeEditorServices.map((service) => <ServiceCard key={service.id} service={service} locale={locale} />)
                ) : (
                  <ServiceGridSkeleton/>
                )}
              </div>
              
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                locale={locale}
              />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}