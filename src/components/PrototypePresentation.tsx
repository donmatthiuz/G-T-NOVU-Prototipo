import Image from "next/image";
import Link from "next/link";
import { MousePointerClick, Play } from "lucide-react";
import PartnerBrand, { NovuSymbol } from "./PartnerBrand";
import styles from "./PrototypeShowcase.module.css";

type PresentationHeaderProps = {
  links: { href: string; label: string }[];
  navigationLabel: string;
  launchLabel?: string;
  onLaunch?: () => void;
  homeHref?: string;
};

export function PresentationHeader({
  links,
  navigationLabel,
  launchLabel = "Probar NOVU",
  onLaunch,
  homeHref = "/",
}: PresentationHeaderProps) {
  const launchContent = (
    <>
      <Play size={16} fill="currentColor" aria-hidden="true" />
      <span className={styles.launchDesktop}>{launchLabel}</span>
      <span className={styles.launchMobile}>Probar NOVU</span>
    </>
  );
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link
          className={styles.brand}
          href={homeHref}
          aria-label="Volver a NOVU by G&T Continental"
        >
          <PartnerBrand compact priority tone="dark" />
        </Link>
        <nav className={styles.headerNav} aria-label={navigationLabel}>
          {links.map(({ href, label }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        {onLaunch ? (
          <button
            type="button"
            className={styles.launchButton}
            onClick={onLaunch}
            aria-label={launchLabel}
          >
            {launchContent}
          </button>
        ) : (
          <Link
            className={styles.launchButton}
            href="/?view=app"
            aria-label={launchLabel}
          >
            {launchContent}
          </Link>
        )}
      </div>
    </header>
  );
}

export function PrototypePhoneDeck({
  note = "Navegá pantalla por pantalla",
}: {
  note?: string;
}) {
  return (
    <div
      className={styles.phoneDeck}
      aria-label="Vistas destacadas del prototipo NOVU"
    >
      <div
        className={`${styles.deckPhone} ${styles.deckPhoneLeft}`}
        aria-hidden="true"
      >
        <Image
          src="/figma-flows/63-1101.png"
          alt=""
          width={375}
          height={812}
          sizes="250px"
        />
      </div>
      <div className={`${styles.deckPhone} ${styles.deckPhoneMain}`}>
        <Image
          src="/figma-flows/63-432.png"
          alt="Portada del prototipo NOVU"
          width={375}
          height={812}
          sizes="(max-width: 580px) 235px, 300px"
          priority
        />
      </div>
      <div
        className={`${styles.deckPhone} ${styles.deckPhoneRight}`}
        aria-hidden="true"
      >
        <Image
          src="/figma-flows/63-1368.png"
          alt=""
          width={375}
          height={812}
          sizes="250px"
        />
      </div>
      <span className={styles.deckBrandSeal} aria-hidden="true">
        <NovuSymbol className={styles.deckBrandMark} size={64} />
      </span>
      <span className={styles.deckNote}>
        <MousePointerClick size={17} aria-hidden="true" /> {note}
      </span>
    </div>
  );
}
