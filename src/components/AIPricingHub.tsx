import { useState, useEffect } from "react";
import type { AIService } from "@/data/ai-data";
import FilterSidebar from "./pricing/FilterSidebar";
import ServiceTabs from "./pricing/ServiceTabs";
import { useTranslation, type SupportedLocale } from "../utils/i18n";

interface AIPricingHubProps {
  services: AIService[];
  locale?: SupportedLocale;
}

export default function AIPricingHub({ services, locale = 'es' }: AIPricingHubProps) {
  const { t } = useTranslation(locale);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("api");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [releaseDate, setReleaseDate] = useState("Any");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 
  
  // Resetear la página cuando cambia el tab o los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedCategories, priceRange, selectedRating, releaseDate, selectedFeatures]);

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

  const filteredServices = services.filter((service) => {
    // If no categories selected, skip category filter
    if (
      selectedCategories.length > 0 &&
      !service.categories.some((category) => selectedCategories.includes(category))
    ) {
      return false;
    }

    // Price filter - parse the price string to get a numeric value for comparison
    const priceValue = Number.parseFloat(service.price.replace(/[^0-9.-]+/g, ""));
    if (priceValue < priceRange[0] || priceValue > priceRange[1]) {
      return false;
    }

    // Rating filter
    if (selectedRating > 0 && service.rating < selectedRating) {
      return false;
    }

    // Feature filters
    if (selectedFeatures.includes("Free Tier") && !service.hasFree) {
      return false;
    }
    if (selectedFeatures.includes("API Access") && !service.hasAPI) {
      return false;
    }
    if (selectedFeatures.includes("Commercial Use") && !service.commercialUse) {
      return false;
    }
    if (selectedFeatures.includes("Custom Models") && !service.customModels) {
      return false;
    }

    // Release date filter
    if (releaseDate !== "Any") {
      const currentYear = new Date().getFullYear();
      if (releaseDate === "New" && !service.isNew) {
        return false;
      }
      if (releaseDate === "This Year" && service.releaseYear !== currentYear) {
        return false;
      }
      if (releaseDate === "Last Year" && service.releaseYear !== currentYear - 1) {
        return false;
      }
    }

    return true;
  });

  const apiServices = filteredServices.filter((service) => service.type === "api");
  const individualServices = filteredServices.filter((service) => service.type === "individual");
  const codeEditorServices = filteredServices.filter((service) => service.type === "code-editor");

  return (
    <main className="container min-h-screen text-foreground transition-colors duration-300">
    
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
      />
    </div>
    
  </main>
  );
}