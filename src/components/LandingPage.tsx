"use client";

import { useState, type MouseEventHandler, type ReactNode } from "react";
import NovuApp from "./NovuApp";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCheck2,
  Flag,
  Heart,
  Landmark,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

const flows = {
  meta: {
    label: "Meta personal",
    icon: Target,
    accent: "violet",
    steps: [
      [
        "Elegí tu meta",
        "Seleccioná entre viaje, estudios, emprendimiento, hogar y más.",
      ],
      [
        "Contanos tu motivación",
        "NOVU entiende qué hace importante esa meta para vos.",
      ],
      ["Tu punto de partida", "Indicá tu situación financiera sin juicios."],
      ["Definí tu horizonte", "Elegí cuándo te gustaría lograrlo."],
      ["Tu plan NOVU", "Recibí un plan claro, con montos y próximos pasos."],
    ],
  },
  kyc: {
    label: "Verificación",
    icon: ShieldCheck,
    accent: "pink",
    steps: [
      ["Tu DPI", "Capturá frente y reverso de tu documento."],
      ["Tu selfie", "Confirmá que sos vos con una captura guiada."],
      ["Contacto seguro", "Guardá teléfono, correo y contraseña."],
      ["Comprobante", "Subí o capturá tu comprobante de domicilio."],
    ],
  },
  personal: {
    label: "Plan personal",
    icon: TrendingUp,
    accent: "indigo",
    steps: [
      ["Tu plan", "Consultá tu ahorro, porcentaje y fecha estimada."],
      ["Retiro personal", "Revisá el impacto antes de confirmar un retiro."],
      ["Tu ritmo", "SeguÍ tu racha, constancia y nivel semanal."],
      ["Copiloto NOVU", "Recibí recomendaciones y resolvé dudas rápidas."],
      ["Oportunidades", "Descubrí beneficios que habilitaste con tu progreso."],
    ],
  },
  grupo: {
    label: "Reto grupal",
    icon: UsersRound,
    accent: "pink",
    steps: [
      ["Creá el reto", "Definí nombre, monto, integrantes y frecuencia."],
      ["Confirmá e invitá", "Compartí el reto y revisá quién falta."],
      ["Plan del reto", "Mirá avances, ranking, aportes y retiro."],
      ["Aportá", "Elegí cuenta, monto y una nota para el grupo."],
      ["Historial", "Consultá aportes y movimientos por integrante."],
    ],
  },
  familia: {
    label: "Fondo familiar",
    icon: Heart,
    accent: "violet",
    steps: [
      [
        "Creá el fondo",
        "Establecé aporte mínimo, aprobadores y administración.",
      ],
      ["Resumen e invitación", "Alineá las reglas con quienes participan."],
      ["Solicitá o votá", "Cada retiro se somete a aprobación familiar."],
      ["Dinero liberado", "La transferencia queda clara para todos."],
      ["Aportes e historial", "SeguÍ el fondo, aportá y revisá su actividad."],
    ],
  },
} satisfies Record<
  string,
  { label: string; icon: LucideIcon; accent: string; steps: [string, string][] }
>;

type FlowId = keyof typeof flows;

const featureCards: [LucideIcon, string, string][] = [
  [Target, "Metas", "Definí lo que querés lograr."],
  [FileCheck2, "Plan", "Creamos tu plan personalizado."],
  [TrendingUp, "Progreso", "Seguí y celebrá tu avance."],
  [Bot, "Coach inteligente", "Te acompaña en cada paso."],
];

function Brand({ compact = false }) {
  return (
    <a className="brand" href="#inicio" aria-label="NOVU, ir al inicio">
      <span className="brand-mark">
        <img src="/novu_templates/logo.jpg" alt="Logo NOVU" />
      </span>
      {!compact && <span className="brand-name">NOVU</span>}
    </a>
  );
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  secondary?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  icon?: boolean;
};

function Button({
  children,
  href,
  secondary = false,
  onClick,
  icon = true,
}: ButtonProps) {
  const content = (
    <>
      {children}
      {icon && <ArrowRight aria-hidden="true" size={18} />}
    </>
  );
  return href ? (
    <a className={`button ${secondary ? "secondary" : ""}`} href={href}>
      {content}
    </a>
  ) : (
    <button
      className={`button ${secondary ? "secondary" : ""}`}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

function FlowExplorer() {
  const [flowId, setFlowId] = useState<FlowId>("meta");
  const [step, setStep] = useState(0);
  const flow = flows[flowId];
  const Icon = flow.icon;
  const chooseFlow = (id: FlowId) => {
    setFlowId(id);
    setStep(0);
  };
  const next = () =>
    setStep((value) => Math.min(value + 1, flow.steps.length - 1));
  const previous = () => setStep((value) => Math.max(value - 1, 0));

  return (
    <section className="flow-section" id="flujos" aria-labelledby="flow-title">
      <div className="section-heading centered">
        <span className="eyebrow">
          <Sparkles size={16} aria-hidden="true" /> Prototipo navegable
        </span>
        <h2 id="flow-title">Todos los caminos llevan a un ahorro más claro.</h2>
        <p>
          Explorá localmente los flujos que hacen de NOVU una experiencia
          personal, compartida y familiar.
        </p>
      </div>
      <div className="flow-explorer">
        <div className="flow-tabs" role="tablist" aria-label="Flujos de NOVU">
          {Object.entries(flows).map(([id, item]) => {
            const TabIcon = item.icon;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={flowId === id}
                className={flowId === id ? "active" : ""}
                onClick={() => chooseFlow(id as FlowId)}
              >
                <TabIcon size={19} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="flow-stage" role="tabpanel">
          <div className={`phone-shell ${flow.accent}`}>
            <div className="phone-top">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="phone-content">
              <div className="phone-header">
                <ChevronLeft size={21} aria-hidden="true" />
                <Brand compact />
              </div>
              <div
                className="step-progress"
                aria-label={`Paso ${step + 1} de ${flow.steps.length}`}
              >
                {flow.steps.map((_, i) => (
                  <span key={i} className={i <= step ? "done" : ""}></span>
                ))}
              </div>
              <span className="step-label">
                Paso {step + 1} de {flow.steps.length}
              </span>
              <div className="phone-icon">
                <Icon size={34} aria-hidden="true" />
              </div>
              <h3>{flow.steps[step][0]}</h3>
              <p>{flow.steps[step][1]}</p>
              <div className="choice-skeleton">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <button
                className="phone-action"
                onClick={next}
                disabled={step === flow.steps.length - 1}
              >
                {step === flow.steps.length - 1
                  ? "Flujo completado"
                  : "Continuar"}{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="flow-copy">
            <span className="eyebrow">{flow.label}</span>
            <h3>{flow.steps[step][0]}</h3>
            <p>{flow.steps[step][1]}</p>
            <ol className="step-list">
              {flow.steps.map(([title], index) => (
                <li
                  key={title}
                  className={
                    index === step ? "current" : index < step ? "visited" : ""
                  }
                >
                  <span>
                    {index < step ? (
                      <Check size={15} aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {title}
                </li>
              ))}
            </ol>
            <div className="flow-controls">
              <button
                aria-label="Paso anterior"
                onClick={previous}
                disabled={step === 0}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                aria-label="Paso siguiente"
                onClick={next}
                disabled={step === flow.steps.length - 1}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  const [view, setView] = useState<"app" | "landing">(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "app"
      ? "app"
      : "landing",
  );
  if (view === "app") return <NovuApp exit={() => setView("landing")} />;
  return (
    <>
      <header className="nav" id="inicio">
        <Brand />
        <nav aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#flujos">Flujos</a>
          <a href="#seguridad">Seguridad</a>
        </nav>
        <a className="nav-cta" href="#flujos">
          Conocé NOVU <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </header>
      <main id="contenido">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow dark">
              <ShieldCheck size={16} aria-hidden="true" /> Respaldado por G&T
              Continental
            </span>
            <h1>
              Tu futuro empieza con <em>un paso.</em>
            </h1>
            <p>
              Convertí tus metas, retos y sueños familiares en un plan que podés
              ver, entender y cumplir.
            </p>
            <div className="hero-actions">
              <Button onClick={() => setView("app")}>
                Entrar al prototipo
              </Button>
              <Button href="#como-funciona" secondary>
                Ver cómo funciona
              </Button>
            </div>
            <div className="trust-row">
              <span>
                <Check size={16} aria-hidden="true" /> Sin fórmulas complicadas
              </span>
              <span>
                <Check size={16} aria-hidden="true" /> Hecho para vos
              </span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Vista previa de NOVU">
            <div className="orb orb-one"></div>
            <div className="orb orb-two"></div>
            <div className="hero-phone">
              <div className="phone-top">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="mini-brand">
                <Brand />
              </div>
              <p className="mini-overline">Tu meta personal</p>
              <h2>Viaje a Antigua</h2>
              <div className="goal-card">
                <div className="goal-icon">
                  <Flag size={22} aria-hidden="true" />
                </div>
                <div>
                  <span>Ahorraste</span>
                  <strong>Q 1,250</strong>
                </div>
                <b>62%</b>
              </div>
              <div className="progress-track">
                <span></span>
              </div>
              <div className="month-card">
                <Clock3 size={19} aria-hidden="true" />
                <div>
                  <span>Próximo aporte</span>
                  <strong>Q 180 este viernes</strong>
                </div>
              </div>
              <button>
                Ver mi plan <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="floating-note">
              <div className="note-icon">
                <Sparkles size={18} />
              </div>
              <p>
                <strong>Vas muy bien</strong>
                <br />
                Llevás 4 semanas seguidas.
              </p>
            </div>
          </div>
        </section>

        <section
          className="features"
          id="como-funciona"
          aria-labelledby="features-title"
        >
          <div className="section-heading">
            <span className="eyebrow">Todo en un mismo lugar</span>
            <h2 id="features-title">
              Ahorrar se siente posible cuando sabés por dónde empezar.
            </h2>
          </div>
          <div className="feature-grid">
            {featureCards.map(([Icon, title, text]) => (
              <article key={title} className="feature-card">
                <div className="icon-badge">
                  <Icon size={25} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="story-grid" aria-label="Funciones principales">
          <article className="story-card personal-card">
            <div>
              <span className="eyebrow">Para vos</span>
              <h2>Una meta no es solo un número.</h2>
              <p>
                NOVU crea un plan realista según tu punto de partida, plazo y
                motivación.
              </p>
              <a href="#flujos">
                Crear una meta <ArrowRight size={17} />
              </a>
            </div>
            <div className="story-graphic">
              <Target size={80} aria-hidden="true" />
              <span className="ring r1"></span>
              <span className="ring r2"></span>
            </div>
          </article>
          <article className="story-card group-card">
            <div>
              <span className="eyebrow">Con quienes querés</span>
              <h2>Juntarse también es avanzar.</h2>
              <p>
                Creá retos grupales y fondos familiares con reglas claras,
                aportes visibles y votaciones simples.
              </p>
              <a href="#flujos">
                Ver flujos compartidos <ArrowRight size={17} />
              </a>
            </div>
            <div className="avatars" aria-hidden="true">
              <span>CA</span>
              <span>AN</span>
              <span>MA</span>
              <span>+3</span>
            </div>
          </article>
        </section>

        <FlowExplorer />

        <section className="security" id="seguridad">
          <div className="security-icon">
            <ShieldCheck size={36} aria-hidden="true" />
          </div>
          <div>
            <span className="eyebrow">Confianza en cada paso</span>
            <h2>Tu información se entiende antes de pedirla.</h2>
            <p>
              La verificación de identidad se presenta como un recorrido guiado:
              DPI, selfie, datos de contacto y comprobante. Sin backend en este
              prototipo, cada interacción es una demostración local de la
              experiencia.
            </p>
          </div>
          <div className="security-points">
            <span>
              <FileCheck2 size={19} /> Verificación guiada
            </span>
            <span>
              <UserRoundCheck size={19} /> Biometría simulada
            </span>
            <span>
              <Landmark size={19} /> Respaldo G&T
            </span>
          </div>
        </section>

        <section className="final-cta">
          <span className="eyebrow dark">
            NOVU está listo cuando vos lo estés
          </span>
          <h2>Un pequeño paso hoy puede cambiar mucho mañana.</h2>
          <Button onClick={() => setView("app")}>Explorar el prototipo</Button>
        </section>
      </main>
      <footer>
        <Brand />
        <p>Prototipo frontend de NOVU. Sin backend ni base de datos.</p>
        <div>
          <a href="#inicio">Inicio</a>
          <a href="#flujos">Flujos</a>
          <a href="#seguridad">Seguridad</a>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;
