import { ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { getTranslation, type SupportedLocale } from "@/utils/i18n";

export default function BackButton({ locale }: { locale: SupportedLocale }) {
  const t = getTranslation(locale);

  return (
    <Button
      className="inline-flex cursor-pointer text-primary hover:underline mb-6 transition-colors"
      onClick={() => {
        window.location.href = `/${locale}/`;
      }}
      variant={"ghost"}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {t("nav.backToHome")}
    </Button>
  );
}
