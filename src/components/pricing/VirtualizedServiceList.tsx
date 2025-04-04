import { FixedSizeGrid } from 'react-window';
import type { AIService } from "@/data/ai-data";
import ServiceCard from "./ServiceCard";
import { type SupportedLocale } from "../../utils/i18n";
import { useEffect, useState } from 'react';
export const prerender = false;

interface VirtualizedServiceListProps {
  services: AIService[];
  locale?: SupportedLocale;
}

export default function VirtualizedServiceList({ services, locale = 'es' }: VirtualizedServiceListProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  
  useEffect(() => {
    // Actualizar dimensiones al cambiar el tamaño de la ventana
    const updateDimensions = () => {
      const container = document.getElementById('service-grid-container');
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: window.innerHeight * 0.7
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Calcular columnas según el ancho
  const columnCount = dimensions.width >= 1024 ? 3 : dimensions.width >= 768 ? 2 : 1;
  const rowCount = Math.ceil(services.length / columnCount);
  
  // Altura de cada fila
  const rowHeight = 400;
  
  // Renderizar cada celda
  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= services.length) return null;
    
    const service = services[index];
    
    return (
      <div style={{ ...style, padding: '1rem' }}>
        <ServiceCard service={service} locale={locale} />
      </div>
    );
  };
  
  return (
    <div id="service-grid-container" style={{ width: '100%', height: dimensions.height }}>
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={dimensions.width / columnCount}
        height={dimensions.height}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={dimensions.width}
      >
        {Cell}
      </FixedSizeGrid>
    </div>
  );
}