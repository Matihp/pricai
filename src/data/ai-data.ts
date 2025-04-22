export interface AIService {
  id: string;
  name: string;
  description: Description;
  models: AIModel[];
  priceDetails: string;
  categories: string[];
  types: ("api" | "individual" | "code-editor")[]; 
  features: {
    es: string[];
    en: string[];
  };
  tools?: {
    [toolName: string]: string | { 
      [modelName: string]: {
        [level: string]: string;
      }
    }
  };
  hasFree: boolean;
  hasAPI: boolean;
  commercialUse: boolean;
  customModels: boolean;
  isNew: boolean;
  releaseYear: number;
  security?: Description;
  support?: Description;
  useCases?: {
    es: string[];
    en: string[];
  };
  integrations?: Description;
}

export interface AIModel {
  name: string;
  description: Description;
  price: {
    input?: string;
    cached_input?: string;
    output?: string;
    [otherPriceType: string]: string | undefined;
  };
  context_length?: string;
  rating: number;
}

export type Description = string | { es?: string; en?: string };