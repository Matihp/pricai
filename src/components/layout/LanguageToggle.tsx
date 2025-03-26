import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { SupportedLocale } from '../../utils/i18n';

interface LanguageToggleProps {
  currentLocale: SupportedLocale;
}

export default function LanguageToggle({ currentLocale }: LanguageToggleProps) {
  const [mounted, setMounted] = useState(false);
  
  // Only run on client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const toggleLanguage = () => {
    const newLocale = currentLocale === 'es' ? 'en' : 'es';
    const currentPath = window.location.pathname;
    
    // Replace the current locale in the path with the new one
    const newPath = currentPath.replace(`/${currentLocale}`, `/${newLocale}`);
    
    // Navigate to the new path
    window.location.href = newPath;
  };
  
  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage}>
      {currentLocale === 'es' ? 'English' : 'Español'}
    </Button>
  );
}
