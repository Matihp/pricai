import React from 'react';
import type { AICategory } from '../../types';
import { useTranslation, type SupportedLocale } from '../../utils/i18n';

interface FilterSectionProps {
  selectedCategory: AICategory | 'all';
  onSelectCategory: (category: AICategory | 'all') => void;
  locale?: SupportedLocale;
}

export function FilterSection({ selectedCategory, onSelectCategory, locale }: FilterSectionProps) {
  const { t } = useTranslation(locale);
  
  const categories: (AICategory | 'all')[] = ['all', 'image', 'video', 'text', 'audio', 'code', 'multimodal'];
  
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(`filter.${category}`)}
          </button>
        ))}
      </div>
    </div>
  );
}