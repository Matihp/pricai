import type { SupportedLocale } from '../utils/i18n';

export interface TranslationDictionary {
  [key: string]: {
    [key in SupportedLocale]: string;
  };
}