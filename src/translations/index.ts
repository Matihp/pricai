import { navigationTranslations } from './navigation';
import { serviceTranslations } from './service';
import { pricingTranslations } from './pricing';
import { metaTranslations } from './meta';
import { commonTranslations } from './common';
import { filterTranslations } from './filters';
import { buttonTranslations } from './buttons';
import { paginationTranslations } from './pagination';
import { serviceTypeTranslations } from './serviceType';
import { errorTranslations } from './error';
import type { TranslationDictionary } from './types';

// Combinar todas las traducciones
export const translations: TranslationDictionary = {
  ...navigationTranslations,
  ...serviceTranslations,
  ...pricingTranslations,
  ...metaTranslations,
  ...commonTranslations,
  ...filterTranslations,
  ...buttonTranslations,
  ...paginationTranslations,
  ...serviceTypeTranslations,
  ...errorTranslations,
};

// Función para obtener solo un conjunto específico de traducciones
export function getTranslationModule(
  module: 'navigation' | 'service' | 'pricing' | 'meta' | 'common' | 'filters' | 'buttons' | 'pagination' | 'serviceType' | 'error'
) {
  switch (module) {
    case 'navigation':
      return navigationTranslations;
    case 'service':
      return serviceTranslations;
    case 'pricing':
      return pricingTranslations;
    case 'meta':
      return metaTranslations;
    case 'common':
      return commonTranslations;
    case 'filters':
      return filterTranslations;
    case 'buttons':
      return buttonTranslations;
    case 'pagination':
      return paginationTranslations;
    case 'serviceType':
      return serviceTypeTranslations;
    case 'error':
      return errorTranslations;
  }
}