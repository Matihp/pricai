import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/i18n';
import type { SupportedLocale } from '../../utils/i18n';

interface LanguageToggleProps {
  currentLocale?: string;
}

export default function LanguageToggle({ currentLocale = 'es' }: LanguageToggleProps) {
  const { locale, setLocale } = useTranslation(currentLocale as SupportedLocale);
  const [currentLang, setCurrentLang] = useState(currentLocale as SupportedLocale);
  
  useEffect(() => {
    setCurrentLang(locale);
  }, [locale]);
  
  const toggleLanguage = () => {
    const newLocale = currentLang === 'es' ? 'en' : 'es';
    setCurrentLang(newLocale);
    setLocale(newLocale);
    
    // Actualizar URL para reflejar el cambio de idioma
    const currentUrl = new URL(window.location.href);
    const path = currentUrl.pathname;
    
    // Obtener la ruta sin el prefijo de idioma actual
    let newPath = path;
    if (path.startsWith('/es/')) {
      newPath = path.replace('/es/', '/en/');
    } else if (path.startsWith('/en/')) {
      newPath = path.replace('/en/', '/es/');
    } else {
      // Si no tiene prefijo, añadir el nuevo
      newPath = `/${newLocale}${path}`;
    }
    
    window.location.href = `${currentUrl.origin}${newPath}${currentUrl.search}`;
  };
  
  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
    >
      {currentLang === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
