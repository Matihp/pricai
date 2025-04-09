import { useState, useEffect } from "react";
import type { AIService } from "@/data/ai-data";
import FilterSidebar from "./pricing/FilterSidebar";
import ServiceTabs from "./pricing/ServiceTabs";
import { type SupportedLocale } from "../utils/i18n";
import { useServices } from "../hooks/useServices";
import { CompareProvider } from "../contexts/CompareContext";
import CompareFloatingButton from "./pricing/CompareFloatingButton";
export const prerender = false;

interface AIPricingHubProps {
  initialServices?: AIService[];
  locale?: SupportedLocale;
}

export default function AIPricingHub({ initialServices = [], locale = 'es' }: AIPricingHubProps) {
  const [activeTab, setActiveTab] = useState("api");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [releaseDate, setReleaseDate] = useState("Any");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [totalItems, setTotalItems] = useState(0);
  
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { services: fetchedServices, loading, error, total } = useServices({
    type: activeTab !== "all" ? activeTab : undefined,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    minRating: selectedRating > 0 ? selectedRating : undefined,
    hasFree: selectedFeatures.includes("Free Tier"),
    hasAPI: selectedFeatures.includes("API Access"),
    commercialUse: selectedFeatures.includes("Commercial Use"),
    customModels: selectedFeatures.includes("Custom Models"),
    isNew: releaseDate === "New" ? true : undefined,
    releaseYear: releaseDate === "This Year" 
      ? new Date().getFullYear() 
      : releaseDate === "Last Year" 
        ? new Date().getFullYear() - 1 
        : undefined,
    page: currentPage,
    limit: itemsPerPage,
    skipInitialCall: initialServices.length > 0 
  });

  const services = initialLoad && initialServices.length > 0 ? initialServices : fetchedServices;

  useEffect(() => {
    if (loading === false && fetchedServices.length > 0) {
      setInitialLoad(false);
    }
    
    if (total !== undefined) {
      setTotalItems(total);
    }
  }, [loading, fetchedServices, total]);
  
  const isLoadingServices = loading && services.length === 0;

  useEffect(() => {
    setCurrentPage(1);

    if (!initialLoad) {
      console.log("Filter changed, updating results");
    }
  }, [activeTab, selectedCategories, priceRange, selectedRating, releaseDate, selectedFeatures, initialLoad]);

  const allCategories = [...new Set(services.flatMap((service) => service.categories))];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 500]);
    setSelectedRating(0);
    setReleaseDate("Any");
    setSelectedFeatures([]);
  };

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const apiServices = services.filter((service) => service.type === "api");
  const individualServices = services.filter((service) => service.type === "individual");
  const codeEditorServices = services.filter((service) => service.type === "code-editor");

  useEffect(() => {
    const component = document.querySelector('[data-component="AIPricingHub"]');
    if (component) {
      component.setAttribute('data-loaded', 'true');
      const skeleton = document.getElementById('loading-skeleton');
      if (skeleton) {
        skeleton.style.display = 'none';
      }
    }
  }, []);

  return (
    <CompareProvider>
      <main className="container min-h-screen text-foreground transition-colors duration-300" data-component="AIPricingHub">
    
    <section className="mb-12">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
        {locale === 'es' ? 'Compara Precios de Servicios de IA' : 'Compare AI Service Pricing'}
      </h1>
      <p className="text-xl text-muted-foreground max-w-3xl">
        {locale === 'es' 
          ? 'Encuentra la solución de IA perfecta para tus necesidades con nuestra herramienta de comparación de precios.'
          : 'Find the perfect AI solution for your needs with our comprehensive pricing comparison tool.'}
      </p>
    </section>

    <div className="flex flex-col md:flex-row gap-6 mb-8">
      <FilterSidebar 
        isFilterOpen={isFilterOpen}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        releaseDate={releaseDate}
        setReleaseDate={setReleaseDate}
        selectedFeatures={selectedFeatures}
        toggleFeature={toggleFeature}
        clearFilters={clearFilters}
        locale={locale}
        isLoading={isLoadingServices}
      />

<ServiceTabs 
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiServices={apiServices}
        individualServices={individualServices}
        codeEditorServices={codeEditorServices}
        locale={locale}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        isLoading={isLoadingServices}
        error={error}
      />
    </div>
    
    <CompareFloatingButton locale={locale} />
      </main>
    </CompareProvider>
  );
}