import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { SupportedLocale } from '../../utils/i18n';
export const prerender = false;

interface LanguageToggleProps {
  currentLocale: SupportedLocale;
}

export default function LanguageToggle({ currentLocale }: LanguageToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (typeof window === 'undefined') return null; // Evita errores en Cloudflare

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'es' ? 'en' : 'es';
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${currentLocale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  return (
    <Button variant="outline" size="sm" className='cursor-pointer' onClick={toggleLanguage}>
      {currentLocale === 'es' ? 'EN' : 'ES'}
    </Button>
  );
}
