import { type ReactNode } from "react";
import { CompareProvider } from "../../contexts/CompareContext";
import CompareFloatingButton from "../compare/CompareFloatingButton";
import type { SupportedLocale } from "../../utils/i18n";

interface ServiceDetailContainerProps {
  children: ReactNode;
  locale: SupportedLocale;
}

export default function ServiceDetailContainer({ children, locale }: ServiceDetailContainerProps) {
  return (
    <CompareProvider>
      <div className="relative">
        {children}
        <CompareFloatingButton locale={locale} />
      </div>
    </CompareProvider>
  );
}