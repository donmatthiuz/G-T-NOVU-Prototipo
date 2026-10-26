import { Home, Menu, Target, TrendingUp } from "lucide-react";
import { NovuSymbol } from "./PartnerBrand";

export default function MobileAppNav({
  page,
  onNavigate,
}: {
  page: string;
  onNavigate: (page: string) => void;
}) {
  const active =
    page === "home" || page === "inicio"
      ? "home"
      : page === "metas" || /^(personal-|group|family)/.test(page)
        ? "metas"
        : page === "copiloto" || page === "ritmo"
          ? page
          : "menu";
  const items = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "metas", label: "Metas", icon: Target },
    { id: "copiloto", label: "NOVU", icon: null },
    { id: "ritmo", label: "Ritmo", icon: TrendingUp },
    { id: "menu", label: "Menú", icon: Menu },
  ];
  return (
    <nav className="mobile-app-nav" aria-label="Navegación móvil">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onNavigate(id)}
          aria-current={active === id ? "page" : undefined}
          aria-label={id === "copiloto" ? "NOVU, abrir Copiloto" : label}
          className={id === "copiloto" ? "mobile-novu-button" : ""}
        >
          <span className="mobile-nav-icon">
            {Icon ? (
              <Icon size={23} aria-hidden="true" />
            ) : (
              <NovuSymbol size={32} />
            )}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
