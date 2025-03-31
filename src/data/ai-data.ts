export interface AIService {
    id: string;
    name: string;
    description: {
      es: string;
      en: string;
    };
    price: string;
    priceDetails: string;
    categories: string[];
    type: "api" | "individual" | "code-editor";
    features: {
      es: string[];
      en: string[];
    };
    rating: number;
    hasFree: boolean;
    hasAPI: boolean;
    commercialUse: boolean;
    customModels: boolean;
    isNew: boolean;
    releaseYear: number;
  }