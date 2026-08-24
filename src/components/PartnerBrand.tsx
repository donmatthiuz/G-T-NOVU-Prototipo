import Image from "next/image";
import styles from "./PartnerBrand.module.css";

const GTC_LOGO_LIGHT = "/brand/gtc-logo.svg";
const GTC_LOGO_DARK = "/brand/gtc-logo-white.svg";

type PartnerBrandProps = {
  className?: string;
  compact?: boolean;
  priority?: boolean;
  showMark?: boolean;
  tone?: "light" | "dark";
};

type NovuSymbolProps = {
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  size?: number;
};

export function NovuSymbol({
  className = "",
  decorative = true,
  priority = false,
  size = 40,
}: NovuSymbolProps) {
  return (
    <Image
      className={className}
      src="/brand/novu-mark-transparent.png"
      alt={decorative ? "" : "Símbolo de NOVU"}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      priority={priority}
    />
  );
}

export default function PartnerBrand({
  className = "",
  compact = false,
  priority = false,
  showMark = true,
  tone = "light",
}: PartnerBrandProps) {
  const classes = [
    styles.lockup,
    styles[tone],
    compact ? styles.compact : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} role="img" aria-label="NOVU by G&T Continental">
      <span className={styles.novuBrand}>
        {showMark && (
          <NovuSymbol className={styles.novuMark} priority={priority} />
        )}
        <strong className={styles.novuName}>NOVU</strong>
      </span>
      <span className={styles.by}>by</span>
      <span className={styles.divider} aria-hidden="true" />
      <Image
        className={styles.gtcLogo}
        src={tone === "dark" ? GTC_LOGO_DARK : GTC_LOGO_LIGHT}
        alt=""
        width={393}
        height={tone === "dark" ? 168 : 167}
        priority={priority}
      />
    </span>
  );
}
