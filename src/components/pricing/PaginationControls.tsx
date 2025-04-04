import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { type SupportedLocale } from "../../utils/i18n";
import { cn } from "@/lib/utils";
export const prerender = false;

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  locale?: SupportedLocale;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  setCurrentPage,
  locale = 'es'
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;
  
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => !isFirstPage && setCurrentPage(currentPage - 1)}
            className={cn(isFirstPage && "pointer-events-none opacity-50")}
            aria-label={locale === 'es' ? 'Página anterior' : 'Previous page'}
          />
        </PaginationItem>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            // Mostrar primera, última, actual y páginas adyacentes
            return page === 1 || 
                   page === totalPages || 
                   Math.abs(page - currentPage) <= 1;
          })
          .map((page, index, array) => {
            // Agregar elipsis si hay saltos en la secuencia
            const needsEllipsisBefore = index > 0 && page - array[index - 1] > 1;
            
            return (
              <React.Fragment key={page}>
                {needsEllipsisBefore && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              </React.Fragment>
            );
          })}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => !isLastPage && setCurrentPage(currentPage + 1)}
            className={cn(isLastPage && "pointer-events-none opacity-50")}
            aria-label={locale === 'es' ? 'Página siguiente' : 'Next page'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}