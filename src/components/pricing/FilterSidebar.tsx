import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SupportedLocale, getTranslation } from "../../utils/i18n";
import { FilterSidebarSkeleton } from "./SkeletonLoaders";
export const prerender = false;

interface FilterSidebarProps {
  isFilterOpen: boolean;
  allCategories: string[];
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  releaseDate: string;
  setReleaseDate: (date: string) => void;
  selectedFeatures: string[];
  toggleFeature: (feature: string) => void;
  clearFilters: () => void;
  locale?: SupportedLocale;
  isLoading?: boolean;
}

export default function FilterSidebar({
  isFilterOpen,
  allCategories,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  selectedRating,
  setSelectedRating,
  releaseDate,
  setReleaseDate,
  selectedFeatures,
  toggleFeature,
  clearFilters,
  locale = 'en',
  isLoading = false
}: FilterSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState(false);
  const t = getTranslation(locale);

  if (isLoading) {
    return (
      <aside className={`${isFilterOpen ? 'block' : 'hidden'} md:block`}>
        <FilterSidebarSkeleton />
      </aside>
    );
  }

  const featureTranslations: Record<string, string> = {
    "Free Tier": t("filter.freeTier"),
    "API Access": t("filter.apiAccess"),
    "Commercial Use": t("filter.commercialUse"),
    "Custom Models": t("filter.customModels")
  };

  const dateTranslations: Record<string, string> = {
    "Any": t("filter.dateAny"),
    "New": t("filter.dateNew"),
    "This Year": t("filter.dateThisYear"),
    "Last Year": t("filter.dateLastYear")
  };

  return (
    <div
      className={`md:w-64 shrink-0 transition-all duration-300 ${
        isFilterOpen ? "max-h-[800px]" : "max-h-0 md:max-h-[800px] overflow-hidden md:overflow-visible"
      }`}
    >
      <div className="bg-card rounded-lg p-5 border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">{t("filter.title")}</h3>
          {selectedCategories.length > 0 || priceRange[1] < 500 || selectedRating > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs font-medium">
              {t("filter.reset")}
            </Button>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              {t("filter.category")}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.slice(0, expandedCategories ? allCategories.length : 6).map((category) => (
                <div
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`
                    px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-all
                    ${
                      selectedCategories.includes(category)
                        ? "bg-primary/10 text-primary border-primary border"
                        : "bg-secondary/40 hover:bg-secondary/60 border border-transparent"
                    }
                  `}
                >
                  {category}
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs font-medium mt-2"
              onClick={() => setExpandedCategories(!expandedCategories)}
            >
              {expandedCategories
                ? t("filter.showLess")
                : t("filter.showAll")}
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t("filter.price")}</h4>
            <div className="px-2">
              <div className="relative pt-5 pb-8">
                <div className="h-1.5 bg-secondary/50 rounded-full">
                  <div
                    className="absolute h-1.5 bg-primary rounded-full"
                    style={{
                      left: `${(priceRange[0] / 500) * 100}%`,
                      right: `${100 - (priceRange[1] / 500) * 100}%`,
                    }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
                  className="absolute top-4 w-full h-2 appearance-none bg-transparent pointer-events-none"
                  style={
                    {
                      "--thumb-size": "16px",
                      "--thumb-color": "hsl(var(--primary))",
                    } as React.CSSProperties
                  }
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                  className="absolute top-4 w-full h-2 appearance-none bg-transparent pointer-events-none"
                  style={
                    {
                      "--thumb-size": "16px",
                      "--thumb-color": "hsl(var(--primary))",
                    } as React.CSSProperties
                  }
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>
                    ${priceRange[1]}
                    {priceRange[1] === 500 ? "+" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t("filter.rating")}</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {[0, 3, 4, 5].map((rating) => (
                <div
                  key={rating}
                  onClick={() => setSelectedRating(rating === selectedRating ? 0 : rating)}
                  className={`
                    px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1
                    ${
                      selectedRating === rating && rating > 0
                        ? "bg-primary/10 text-primary border-primary border"
                        : "bg-secondary/40 hover:bg-secondary/60 border border-transparent"
                    }
                  `}
                >
                  {rating === 0 ? (
                    t("filter.ratingAny")
                  ) : (
                    <>
                      {rating}+ <Star className="h-3 w-3 fill-current" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t("filter.releaseDate")}</h4>
            <div className="flex flex-wrap gap-2">
              {["Any", "New", "This Year", "Last Year"].map((date) => (
                <div
                  key={date}
                  onClick={() => setReleaseDate(releaseDate === date ? "Any" : date)}
                  className={`
                    px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-all
                    ${
                      releaseDate === date
                        ? "bg-primary/10 text-primary border-primary border"
                        : "bg-secondary/40 hover:bg-secondary/60 border border-transparent"
                    }
                  `}
                >
                  {dateTranslations[date]}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t("filter.features")}</h4>
            <div className="space-y-2">
              {["Free Tier", "API Access", "Commercial Use", "Custom Models"].map((feature) => (
                <label key={feature} className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-5 rounded border border-primary/20 peer-checked:bg-primary peer-checked:border-primary transition-all">
                      {selectedFeatures.includes(feature) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-primary-foreground absolute top-0.5 left-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm">
                    {featureTranslations[feature]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
