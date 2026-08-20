"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Fingerprint,
  Grid3X3,
  HeartHandshake,
  Layers3,
  MousePointerClick,
  Play,
  Route,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import styles from "./PrototypeShowcase.module.css";

type FlowId = "onboarding" | "access" | "personal" | "group" | "family" | "kyc";
type FilterId = "all" | FlowId;

type PrototypeScreen = {
  id: string;
  name: string;
  flow: FlowId;
  image: string;
};

type FlowDefinition = {
  label: string;
  shortLabel: string;
  description: string;
  path: string;
  icon: LucideIcon;
};

const figmaFileUrl =
  "https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=63-431";

const flowDefinitions: Record<FlowId, FlowDefinition> = {
  onboarding: {
    label: "Meta y onboarding",
    shortLabel: "Onboarding",
    description:
      "Convierte una intención en un plan: meta, motivación, contexto, horizonte y capacidad de ahorro.",
    path: "Portada → Meta → Motivación → Contexto → Horizonte → Plan → KYC",
    icon: Target,
  },
  access: {
    label: "Acceso y biometría",
    shortLabel: "Acceso",
    description:
      "Una entrada alternativa para usuarios existentes, con tres métodos de validación biométrica simulada.",
    path: "Login → Huella / Rostro / Face ID → Plan personal",
    icon: Fingerprint,
  },
  personal: {
    label: "Experiencia personal",
    shortLabel: "Personal",
    description:
      "El centro de control individual: progreso, retiros, ritmo, copiloto, oportunidades e inicio.",
    path: "Plan → Retiro → Ritmo → Copiloto → Oportunidades → Inicio",
    icon: Sparkles,
  },
  group: {
    label: "Reto grupal",
    shortLabel: "Reto grupal",
    description:
      "Metas compartidas con reglas claras, invitaciones, aportes, progreso, historial y retiros.",
    path: "Crear reto → Resumen → Invitar → Plan → Aportar / Retirar / Historial",
    icon: UsersRound,
  },
  family: {
    label: "Fondo familiar",
    shortLabel: "Fondo familiar",
    description:
      "Ahorro colaborativo con aportes transparentes, solicitudes y decisiones por votación.",
    path: "Crear fondo → Invitar → Aportar → Solicitar → Votar → Liberar",
    icon: HeartHandshake,
  },
  kyc: {
    label: "Verificación KYC",
    shortLabel: "KYC",
    description:
      "Cuatro recorridos guiados para documento, selfie, contacto seguro y comprobante de domicilio.",
    path: "DPI → Selfie → Contacto → Comprobante → Confirmación",
    icon: ScanFace,
  },
};

const screens: PrototypeScreen[] = [
  {
    id: "63:432",
    name: "01 · Portada",
    flow: "onboarding",
    image: "/figma-flows/63-432.png",
  },
  {
    id: "63:438",
    name: "02 · Elegí tu meta",
    flow: "onboarding",
    image: "/figma-flows/63-438.png",
  },
  {
    id: "63:482",
    name: "03 · Detalle de la meta",
    flow: "onboarding",
    image: "/figma-flows/63-482.png",
  },
  {
    id: "63:513",
    name: "04 · Chat con el copiloto",
    flow: "onboarding",
    image: "/figma-flows/63-513.png",
  },
  {
    id: "63:555",
    name: "05 · Ingresos",
    flow: "onboarding",
    image: "/figma-flows/63-555.png",
  },
  {
    id: "63:581",
    name: "06 · Plan generado",
    flow: "onboarding",
    image: "/figma-flows/63-581.png",
  },
  {
    id: "248:374",
    name: "06a · Detalle de tu meta",
    flow: "onboarding",
    image: "/figma-flows/248-374.png",
  },
  {
    id: "251:382",
    name: "06b · Capacidad de ahorro",
    flow: "onboarding",
    image: "/figma-flows/251-382.png",
  },
  {
    id: "63:618",
    name: "07 · Verificación (KYC)",
    flow: "onboarding",
    image: "/figma-flows/63-618.png",
  },
  {
    id: "210:440",
    name: "01a · Inicio de sesión",
    flow: "access",
    image: "/figma-flows/210-440.png",
  },
  {
    id: "239:374",
    name: "01b · Verificación — Huella",
    flow: "access",
    image: "/figma-flows/239-374.png",
  },
  {
    id: "239:390",
    name: "01c · Verificación — Reconocimiento facial",
    flow: "access",
    image: "/figma-flows/239-390.png",
  },
  {
    id: "239:406",
    name: "01d · Verificación — Face ID",
    flow: "access",
    image: "/figma-flows/239-406.png",
  },
  {
    id: "63:662",
    name: "08 · Plan personal",
    flow: "personal",
    image: "/figma-flows/63-662.png",
  },
  {
    id: "63:724",
    name: "09 · Retiro personal",
    flow: "personal",
    image: "/figma-flows/63-724.png",
  },
  {
    id: "63:742",
    name: "10 · Tu ritmo",
    flow: "personal",
    image: "/figma-flows/63-742.png",
  },
  {
    id: "63:778",
    name: "11 · Copiloto",
    flow: "personal",
    image: "/figma-flows/63-778.png",
  },
  {
    id: "63:822",
    name: "12 · Oportunidades",
    flow: "personal",
    image: "/figma-flows/63-822.png",
  },
  {
    id: "63:874",
    name: "13 · Inicio",
    flow: "personal",
    image: "/figma-flows/63-874.png",
  },
  {
    id: "63:944",
    name: "14 · Crear reto grupal",
    flow: "group",
    image: "/figma-flows/63-944.png",
  },
  {
    id: "63:994",
    name: "15 · Resumen del reto",
    flow: "group",
    image: "/figma-flows/63-994.png",
  },
  {
    id: "63:1017",
    name: "16 · Invitar al reto",
    flow: "group",
    image: "/figma-flows/63-1017.png",
  },
  {
    id: "63:1053",
    name: "17 · Retiro del reto",
    flow: "group",
    image: "/figma-flows/63-1053.png",
  },
  {
    id: "63:1063",
    name: "18 · Historial del reto",
    flow: "group",
    image: "/figma-flows/63-1063.png",
  },
  {
    id: "63:1101",
    name: "19 · Plan del reto",
    flow: "group",
    image: "/figma-flows/63-1101.png",
  },
  {
    id: "63:1151",
    name: "20 · Aportar al reto",
    flow: "group",
    image: "/figma-flows/63-1151.png",
  },
  {
    id: "63:1162",
    name: "21 · Crear fondo familiar",
    flow: "family",
    image: "/figma-flows/63-1162.png",
  },
  {
    id: "63:1212",
    name: "22 · Resumen del fondo",
    flow: "family",
    image: "/figma-flows/63-1212.png",
  },
  {
    id: "63:1231",
    name: "23 · Invitar al fondo",
    flow: "family",
    image: "/figma-flows/63-1231.png",
  },
  {
    id: "63:1267",
    name: "24 · Votar solicitud",
    flow: "family",
    image: "/figma-flows/63-1267.png",
  },
  {
    id: "63:1325",
    name: "25 · Votaciones",
    flow: "family",
    image: "/figma-flows/63-1325.png",
  },
  {
    id: "63:1356",
    name: "26 · Dinero liberado",
    flow: "family",
    image: "/figma-flows/63-1356.png",
  },
  {
    id: "63:1368",
    name: "27 · Fondo familiar (aportes)",
    flow: "family",
    image: "/figma-flows/63-1368.png",
  },
  {
    id: "63:1411",
    name: "28 · Solicitudes del fondo",
    flow: "family",
    image: "/figma-flows/63-1411.png",
  },
  {
    id: "63:1471",
    name: "29 · Historial de aportaciones",
    flow: "family",
    image: "/figma-flows/63-1471.png",
  },
  {
    id: "63:1511",
    name: "30 · Solicitar retiro del fondo",
    flow: "family",
    image: "/figma-flows/63-1511.png",
  },
  {
    id: "63:1521",
    name: "31 · Aportar al fondo",
    flow: "family",
    image: "/figma-flows/63-1521.png",
  },
  {
    id: "126:419",
    name: "07a · DPI — Frente",
    flow: "kyc",
    image: "/figma-flows/126-419.png",
  },
  {
    id: "126:420",
    name: "07b · DPI — Reverso",
    flow: "kyc",
    image: "/figma-flows/126-420.png",
  },
  {
    id: "126:421",
    name: "07c · DPI — Confirmación",
    flow: "kyc",
    image: "/figma-flows/126-421.png",
  },
  {
    id: "126:422",
    name: "07d · Selfie — Captura",
    flow: "kyc",
    image: "/figma-flows/126-422.png",
  },
  {
    id: "126:423",
    name: "07e · Selfie — Confirmación",
    flow: "kyc",
    image: "/figma-flows/126-423.png",
  },
  {
    id: "126:424",
    name: "07f · Contacto y contraseña",
    flow: "kyc",
    image: "/figma-flows/126-424.png",
  },
  {
    id: "126:425",
    name: "07g · Comprobante — Captura",
    flow: "kyc",
    image: "/figma-flows/126-425.png",
  },
  {
    id: "126:426",
    name: "07h · Comprobante — Confirmación",
    flow: "kyc",
    image: "/figma-flows/126-426.png",
  },
];

const flowOrder = Object.keys(flowDefinitions) as FlowId[];

function figmaNodeUrl(id: string) {
  return `https://www.figma.com/design/vFm8Z8NqINCaW8YDb23hz5/NOVU?node-id=${id.replace(":", "-")}`;
}

export default function PrototypeShowcase() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState("63:432");
  const explorerRef = useRef<HTMLElement>(null);

  const filteredScreens = useMemo(
    () =>
      activeFilter === "all"
        ? screens
        : screens.filter((screen) => screen.flow === activeFilter),
    [activeFilter],
  );
  const selectedScreen =
    screens.find((screen) => screen.id === selectedId) ?? screens[0];
  const selectedFlow = flowDefinitions[selectedScreen.flow];
  const selectedIndex = screens.findIndex(
    (screen) => screen.id === selectedScreen.id,
  );

  const selectFilter = (filter: FilterId) => {
    setActiveFilter(filter);
    if (filter !== "all") {
      const first = screens.find((screen) => screen.flow === filter);
      if (first) setSelectedId(first.id);
    }
  };

  const moveSelection = (direction: -1 | 1) => {
    const nextIndex =
      (selectedIndex + direction + screens.length) % screens.length;
    setSelectedId(screens[nextIndex].id);
  };

  const handleExplorerKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSelection(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveSelection(1);
    }
  };

  const focusScreen = (screen: PrototypeScreen) => {
    setSelectedId(screen.id);
    explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#atlas-content">
        Saltar al contenido
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            className={styles.brand}
            href="/"
            aria-label="Volver a la landing principal de NOVU"
          >
            <Image
              src="/brand/novu-mark-transparent.png"
              alt=""
              width={38}
              height={38}
            />
            <span>NOVU</span>
            <small>Prototype atlas</small>
          </Link>
          <nav className={styles.headerNav} aria-label="Navegación del atlas">
            <a href="#recorridos">Recorridos</a>
            <a href="#explorador">Explorador</a>
            <a href="#galeria">45 pantallas</a>
          </nav>
          <Link className={styles.launchButton} href="/?view=app">
            <Play size={16} fill="currentColor" aria-hidden="true" />
            Probar NOVU
          </Link>
        </div>
      </header>

      <main id="atlas-content">
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <Route size={16} aria-hidden="true" />
                Flujo original + Presentación
              </span>
              <h1>
                Todo NOVU, <em>en un solo recorrido.</em>
              </h1>
              <p>
                Explorá cada decisión, cada pantalla y cada camino del prototipo
                creado en Figma. Del primer objetivo al ahorro compartido.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#explorador">
                  Explorar los flujos{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a
                  className={styles.secondaryAction}
                  href={figmaFileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir archivo Figma{" "}
                  <ExternalLink size={17} aria-hidden="true" />
                </a>
              </div>
              <dl className={styles.heroStats}>
                <div>
                  <dt>45</dt>
                  <dd>pantallas actuales</dd>
                </div>
                <div>
                  <dt>154</dt>
                  <dd>interacciones validadas</dd>
                </div>
                <div>
                  <dt>6</dt>
                  <dd>recorridos conectados</dd>
                </div>
              </dl>
            </div>

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
                  sizes="300px"
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
              <span className={styles.deckNote}>
                <MousePointerClick size={17} aria-hidden="true" />
                Navegá pantalla por pantalla
              </span>
            </div>
          </div>
          <div className={styles.sourceBar}>
            <span>
              <span className={styles.liveDot} /> Fuente sincronizada desde
              Figma MCP
            </span>
            <span>Página 08 · NOVU · Flujo original + Presentación</span>
            <span>Nodos 375 × 812 px</span>
          </div>
        </section>

        <section
          className={styles.journeys}
          id="recorridos"
          aria-labelledby="journeys-title"
        >
          <div className={styles.sectionIntro}>
            <span className={styles.lightEyebrow}>
              <Layers3 size={16} aria-hidden="true" /> Arquitectura del producto
            </span>
            <h2 id="journeys-title">Seis recorridos. Una misma promesa.</h2>
            <p>
              Cada flujo conserva la lógica probada en Figma y comparte la
              identidad visual v3 de NOVU.
            </p>
          </div>
          <div className={styles.journeyGrid}>
            {flowOrder.map((flowId, index) => {
              const flow = flowDefinitions[flowId];
              const Icon = flow.icon;
              const count = screens.filter(
                (screen) => screen.flow === flowId,
              ).length;
              return (
                <button
                  className={styles.journeyCard}
                  key={flowId}
                  onClick={() => {
                    selectFilter(flowId);
                    document
                      .getElementById("explorador")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{ "--card-index": index } as CSSProperties}
                >
                  <span className={styles.journeyNumber}>0{index + 1}</span>
                  <span className={styles.journeyIcon}>
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <strong>{flow.label}</strong>
                  <span>{flow.description}</span>
                  <small>
                    {count} pantallas{" "}
                    <ArrowRight size={14} aria-hidden="true" />
                  </small>
                </button>
              );
            })}
          </div>
        </section>

        <section
          className={styles.explorerSection}
          id="explorador"
          ref={explorerRef}
          aria-labelledby="explorer-title"
          onKeyDown={handleExplorerKeys}
          tabIndex={-1}
        >
          <div className={styles.explorerHeading}>
            <div>
              <span className={styles.eyebrow}>
                <MousePointerClick size={16} aria-hidden="true" /> Explorador
                interactivo
              </span>
              <h2 id="explorer-title">Entrá al lienzo, sin perder el hilo.</h2>
            </div>
            <p>
              Elegí una pantalla o usá las flechas del teclado. Cada imagen es
              una exportación real del nodo de Figma.
            </p>
          </div>

          <div className={styles.explorer}>
            <aside
              className={styles.screenRail}
              aria-label="Pantallas del recorrido seleccionado"
            >
              <div className={styles.railTitle}>
                <span>{selectedFlow.shortLabel}</span>
                <b>
                  {
                    screens.filter(
                      (screen) => screen.flow === selectedScreen.flow,
                    ).length
                  }
                </b>
              </div>
              <div className={styles.railList}>
                {screens
                  .filter((screen) => screen.flow === selectedScreen.flow)
                  .map((screen) => (
                    <button
                      key={screen.id}
                      className={
                        screen.id === selectedScreen.id
                          ? styles.activeScreenButton
                          : styles.screenButton
                      }
                      aria-current={
                        screen.id === selectedScreen.id ? "step" : undefined
                      }
                      onClick={() => setSelectedId(screen.id)}
                    >
                      <span>{screen.name.split(" · ")[0]}</span>
                      <span>
                        {screen.name.split(" · ").slice(1).join(" · ")}
                      </span>
                    </button>
                  ))}
              </div>
            </aside>

            <div className={styles.stagePanel}>
              <div className={styles.stageTopbar}>
                <span>
                  <span className={styles.liveDot} /> Figma node{" "}
                  {selectedScreen.id}
                </span>
                <span>
                  {selectedIndex + 1} / {screens.length}
                </span>
              </div>
              <div className={styles.selectedPhone} key={selectedScreen.id}>
                <Image
                  src={selectedScreen.image}
                  alt={`Pantalla ${selectedScreen.name} del prototipo NOVU`}
                  width={375}
                  height={812}
                  sizes="(max-width: 700px) 78vw, 330px"
                />
              </div>
              <div className={styles.stageControls}>
                <button
                  onClick={() => moveSelection(-1)}
                  aria-label="Pantalla anterior"
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <span aria-live="polite">{selectedScreen.name}</span>
                <button
                  onClick={() => moveSelection(1)}
                  aria-label="Pantalla siguiente"
                >
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            <aside
              className={styles.screenInfo}
              aria-label="Información de la pantalla"
            >
              <span className={styles.infoIcon}>
                <selectedFlow.icon size={22} aria-hidden="true" />
              </span>
              <span className={styles.infoOverline}>{selectedFlow.label}</span>
              <h3>{selectedScreen.name}</h3>
              <p>{selectedFlow.description}</p>
              <div className={styles.routePath}>
                <span>Ruta</span>
                <p>{selectedFlow.path}</p>
              </div>
              <div className={styles.infoActions}>
                <Link href="/?view=app">
                  <Play size={16} fill="currentColor" aria-hidden="true" />{" "}
                  Probar versión funcional
                </Link>
                <a
                  href={figmaNodeUrl(selectedScreen.id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver nodo en Figma{" "}
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              </div>
              <p className={styles.keyboardHint}>
                Tip: enfocá esta sección y usá ← → para recorrer todo el
                prototipo.
              </p>
            </aside>
          </div>
        </section>

        <section
          className={styles.gallerySection}
          id="galeria"
          aria-labelledby="gallery-title"
        >
          <div className={styles.galleryHeading}>
            <div>
              <span className={styles.lightEyebrow}>
                <Grid3X3 size={16} aria-hidden="true" /> Inventario completo
              </span>
              <h2 id="gallery-title">Las 45 pantallas, a la vista.</h2>
            </div>
            <p>
              Filtrá por recorrido y tocá cualquier tarjeta para verla en
              detalle.
            </p>
          </div>

          <div className={styles.filters} aria-label="Filtrar pantallas">
            <button
              aria-pressed={activeFilter === "all"}
              onClick={() => selectFilter("all")}
            >
              Todas <span>45</span>
            </button>
            {flowOrder.map((flowId) => (
              <button
                key={flowId}
                aria-pressed={activeFilter === flowId}
                onClick={() => selectFilter(flowId)}
              >
                {flowDefinitions[flowId].shortLabel}
                <span>
                  {screens.filter((screen) => screen.flow === flowId).length}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.galleryGrid}>
            {filteredScreens.map((screen, index) => (
              <button
                className={
                  screen.id === selectedScreen.id
                    ? styles.selectedGalleryCard
                    : styles.galleryCard
                }
                key={screen.id}
                onClick={() => focusScreen(screen)}
                style={
                  {
                    "--delay": `${Math.min(index, 12) * 34}ms`,
                  } as CSSProperties
                }
                aria-label={`Ver ${screen.name} en el explorador`}
              >
                <span className={styles.galleryImage}>
                  <Image
                    src={screen.image}
                    alt=""
                    width={375}
                    height={812}
                    sizes="(max-width: 520px) 44vw, (max-width: 900px) 28vw, 190px"
                  />
                </span>
                <span className={styles.galleryMeta}>
                  <small>{flowDefinitions[screen.flow].shortLabel}</small>
                  <strong>{screen.name}</strong>
                  <span>
                    Node {screen.id} <ArrowRight size={13} aria-hidden="true" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.finalCta}>
          <span className={styles.eyebrow}>
            <ShieldCheck size={16} aria-hidden="true" /> Prototipo funcional
          </span>
          <h2>Ya viste el mapa. Ahora recorré la experiencia.</h2>
          <p>
            La versión local replica los principales flujos con interacciones
            reales, estados persistentes y navegación web responsive.
          </p>
          <div>
            <Link className={styles.primaryAction} href="/?view=app">
              Abrir NOVU <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryAction} href="/">
              Volver a la landing
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/">
          <Image
            src="/brand/novu-mark-transparent.png"
            alt=""
            width={32}
            height={32}
          />
          <span>NOVU</span>
        </Link>
        <p>Atlas local del prototipo · Figma MCP · Sin despliegue externo</p>
        <a href="#atlas-content">Volver arriba</a>
      </footer>
    </div>
  );
}
