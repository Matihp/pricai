import { useEffect, useState } from 'react';

export type SupportedLocale = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    es: 'Inicio',
    en: 'Home'
  },
  // 'nav.apiPricing': {
  //   es: 'Precios de APIs',
  //   en: 'API Pricing'
  // },
  // 'nav.individualPricing': {
  //   es: 'Precios Individuales',
  //   en: 'Individual Pricing'
  // },
  // 'nav.codeEditors': {
  //   es: 'Editores de Código',
  //   en: 'Code Editors'
  // },
  
  // Filters
  'filter.all': {
    es: 'Todos',
    en: 'All'
  },
  'filter.image': {
    es: 'Imagen',
    en: 'Image'
  },
  'filter.video': {
    es: 'Video',
    en: 'Video'
  },
  'filter.text': {
    es: 'Texto',
    en: 'Text'
  },
  'filter.audio': {
    es: 'Audio',
    en: 'Audio'
  },
  'filter.code': {
    es: 'Código',
    en: 'Code'
  },
  'filter.multimodal': {
    es: 'Multimodal',
    en: 'Multimodal'
  },
  
  // Buttons
  'button.viewDetails': {
    es: 'Ver detalles',
    en: 'View details'
  },
  'button.close': {
    es: 'Cerrar',
    en: 'Close'
  },
  
  // Pricing
  'pricing.monthly': {
    es: 'mensual',
    en: 'monthly'
  },
  'pricing.yearly': {
    es: 'anual',
    en: 'yearly'
  },
  'pricing.usage': {
    es: 'por uso',
    en: 'per usage'
  },
  'pricing.free': {
    es: 'Gratis',
    en: 'Free'
  },
  'pricing.startingAt': {
    es: 'Desde',
    en: 'Starting at'
  },
  
  // Sections
  // 'section.apiPricing': {
  //   es: 'Precios de APIs de IA',
  //   en: 'AI API Pricing'
  // },
  // 'section.individualPricing': {
  //   es: 'Precios para Uso Individual',
  //   en: 'Individual Usage Pricing'
  // },
  // 'section.codeEditors': {
  //   es: 'Editores de Código con IA',
  //   en: 'AI-Powered Code Editors'
  // },
  
  // Meta
  'meta.description': {
    es: 'Compara precios de inteligencias artificiales, APIs y editores de código con IA',
    en: 'Compare prices of artificial intelligence tools, APIs, and AI-powered code editors'
  },
  'meta.lastUpdated': {
    es: 'Última actualización',
    en: 'Last updated'
  }
};


export function getTranslation(locale: SupportedLocale) {
  const t = (key: string): string => {
    return translations[key]?.[locale] || key;
  };
  
  return t;
}

// Hook de React - solo para componentes del cliente
export function useTranslation(initialLocale?: SupportedLocale) {
  const [locale, setLocale] = useState<SupportedLocale>(initialLocale || 'es');
  
  useEffect(() => {
    if (!initialLocale) {
      // Only detect browser language if no initial locale is provided
      setLocale(detectBrowserLanguage());
    }
  }, [initialLocale]);
  
  const t = (key: string): string => {
    return translations[key]?.[locale] || key;
  };
  
  return { t, locale, setLocale };
}

export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'en';
  }

  let browserLang;
  
  if (navigator.language) {
    browserLang = navigator.language.toLowerCase().split('-')[0];
  } 
  else if (navigator.languages && navigator.languages.length) {
    browserLang = navigator.languages[0].toLowerCase().split('-')[0];
  }
  else {
    browserLang = 'en';
  }
  
  return browserLang === 'es' ? 'es' : 'en';
}

// Función para usar en archivos .astro
export function getLocaleAndTranslations(preferredLocale: string | undefined) {
  const locale = (preferredLocale === 'es' || preferredLocale === 'en') ? 
    preferredLocale as SupportedLocale : 'es';
  
  const t = (key: string): string => {
    return translations[key]?.[locale] || key;
  };
  
  return { locale, t };
}

// Función para formatear fechas según el idioma
export function formatDate(dateStr: string, locale: SupportedLocale): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}