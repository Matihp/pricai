import React, { useState } from 'react';
import type { CodeEditor, AITool } from '../../types';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { useTranslation, type SupportedLocale } from '../../utils/i18n';

interface CodeEditorPricingProps {
  codeEditors: CodeEditor[];
  locale?: SupportedLocale;
}

export function CodeEditorPricing({ codeEditors , locale}: CodeEditorPricingProps) {
  const { t } = useTranslation(locale);
  const [selectedEditor, setSelectedEditor] = useState<CodeEditor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const handleEditorClick = (item: CodeEditor | AITool) => {
    // Verificar que el item es un CodeEditor antes de asignarlo
    if ('aiFeatures' in item) {
      setSelectedEditor(item as CodeEditor);
      setModalOpen(true);
    }
  };
  
  // Ver detalles completos
  const handleViewMore = () => {
    if (selectedEditor) {
      const prefix = locale === 'en' ? '/en' : '';
      window.location.href = `${prefix}/editor/${selectedEditor.id}`;
      setModalOpen(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('section.codeEditors')}</h2>
      
      {codeEditors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {codeEditors.map(editor => (
            <Card
              key={editor.id}
              item={editor}
              onClick={handleEditorClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500">
          No hay editores de código disponibles.
        </div>
      )}
      
      <Modal
        item={selectedEditor}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onViewMore={handleViewMore}
      />
    </div>
  );
}