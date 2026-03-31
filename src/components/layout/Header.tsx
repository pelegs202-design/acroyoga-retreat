import { useTranslations } from "next-intl";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-neutral-800 bg-neutral-900 px-4 sm:px-6">
      {/* App name — leading edge, adapts to RTL/LTR via logical properties */}
      <span className="text-lg font-bold tracking-tight text-neutral-100">
        {t("appName")}
      </span>

      {/* Language toggle — pushed to trailing edge */}
      <div className="ms-auto">
        <LanguageToggle />
      </div>
    </header>
  );
}
