import React, { useState, useEffect } from 'react';
import type { AITool, AICategory, CodeEditor } from '../../types';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { FilterSection } from '../ui/FilterSection';
import { useTranslation } from '../../utils/i18n';
import type { SupportedLocale } from '../../utils/i18n';

interface ApiPricingProps {
  aiTools: AITool[];
  locale?: SupportedLocale;
}

export function ApiPricing({ aiTools, locale }: ApiPricingProps) {
  const { t } = useTranslation(locale); 
  const [selectedCategory, setSelectedCategory] = useState<AICategory | 'all'>('all');
  const [filteredTools, setFilteredTools] = useState<AITool[]>([]);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filtrar herramientas por categoría y disponibilidad de API
  useEffect(() => {
    const filtered = aiTools.filter(tool => {
      const hasAPI = tool.apiAvailable;
      const matchesCategory = selectedCategory === 'all' || 
        tool.categories.includes(selectedCategory as AICategory);
        
      return hasAPI && matchesCategory;
    });
    
    setFilteredTools(filtered);
  }, [aiTools, selectedCategory]);
  
  const handleToolClick = (item: AITool | CodeEditor) => {
    // Verificar que el item es una AITool antes de asignarlo
    if ('categories' in item && 'apiAvailable' in item) {
      setSelectedTool(item as AITool);
      setModalOpen(true);
    }
  };
  
  // Ver detalles completos
  const handleViewMore = () => {
    if (selectedTool) {
      const prefix = locale === 'en' ? '/en' : '';
      window.location.href = `${prefix}/tool/${selectedTool.id}`;
      setModalOpen(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('section.apiPricing')}</h2>
      
      <FilterSection 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <Card
              key={tool.id}
              item={tool}
              onClick={handleToolClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500">
          No hay herramientas disponibles con los filtros seleccionados.
        </div>
      )}
      
      <Modal
        item={selectedTool}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onViewMore={handleViewMore}
      />
    </div>
  );
}