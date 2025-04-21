import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import type { AIService } from "@/data/ai-data";

interface SearchBarProps {
  locale: string;
}

export default function SearchBar({ locale }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const searchCacheRef = useRef<Record<string, AIService[]>>({});

  // Modificar el hook para incluir el término de búsqueda
  const { services, loading } = useServices({
    skipInitialCall: debouncedTerm.trim() === "", // Solo omitir la llamada inicial si no hay término
    searchTerm: debouncedTerm.trim() || undefined, // Pasar el término de búsqueda al hook
  });

  const [filteredServices, setFilteredServices] = useState<AIService[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setFilteredServices([]);
      setIsOpen(false);
      return;
    }

    // Verificar si ya tenemos resultados en caché para este término
    const cacheKey = `${locale}:${debouncedTerm.toLowerCase()}`;
    if (searchCacheRef.current[cacheKey]) {
      setFilteredServices(searchCacheRef.current[cacheKey]);
      setIsOpen(searchCacheRef.current[cacheKey].length > 0);
      return;
    }
    // Guardar en caché los resultados
    if (services.length > 0) {
      const resultsToCache = services.slice(0, 5);
      searchCacheRef.current[cacheKey] = resultsToCache;
      setFilteredServices(resultsToCache);
    } else {
      setFilteredServices([]);
    }
    setIsOpen(services.length > 0);
  }, [debouncedTerm, services, locale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };
  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;

    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(regex, "<mark>$1</mark>");
  };

  return (
    <div className="relative w-full max-w-xs" ref={searchRef}>
      <label htmlFor="search-input" className="sr-only">
        {locale === "es" ? "Buscar servicios" : "Search services"}
      </label>
      <div className="relative">
        <input
          id="search-input"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-results"
          placeholder={
            locale === "es" ? "Buscar servicios..." : "Search services..."
          }
          value={searchTerm}
          onChange={handleInputChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isOpen && (
        <div
          id="search-results"
          role="listbox"
          className="absolute mt-1 w-full rounded-md border border-border bg-background shadow-lg z-50"
        >
          {loading ? (
            <div className="p-2 text-sm text-center text-muted-foreground">
              {locale === "es" ? "Cargando..." : "Loading..."}
            </div>
          ) : filteredServices.length > 0 ? (
            <ul className="max-h-60 overflow-auto py-1">
              {filteredServices.map((service) => (
                <li key={service.id}>
                  <a
                    className="block px-4 py-2 hover:bg-accent text-sm cursor-pointer"
                    onClick={() => {
                      window.location.href = `/${locale}/${service.type}/${service.id}`;
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <div
                      className="font-medium"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(service.name, debouncedTerm),
                      }}
                    />
                    <div className="text-xs text-muted-foreground truncate">
                      {typeof service.description === "object"
                        ? service.description[locale as "es" | "en"]
                        : service.description}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : debouncedTerm.trim() ? (
            <div className="p-2 text-sm text-center text-muted-foreground">
              {locale === "es"
                ? "No se encontraron resultados"
                : "No results found"}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
