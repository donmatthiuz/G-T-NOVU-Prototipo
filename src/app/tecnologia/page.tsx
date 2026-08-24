import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  Eye,
  FileSearch,
  Landmark,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Network,
  PackageSearch,
  ReceiptText,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";
import PartnerBrand from "@/components/PartnerBrand";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Arquitectura técnica | NOVU",
  description:
    "Visión técnica de la integración de NOVU con réplicas transaccionales, agentes y catálogo de productos bancarios.",
};

type Agent = {
  icon: LucideIcon;
  name: string;
  role: string;
  output: string;
};

const agents: Agent[] = [
  {
    icon: Activity,
    name: "Agente de comportamiento financiero",
    role: "Interpreta señales agregadas como recurrencia, capacidad de ahorro, aportes, retiros y variación del gasto.",
    output: "Patrones y contexto financiero",
  },
  {
    icon: Target,
    name: "Agente de metas y recomendaciones",
    role: "Relaciona el comportamiento con la meta del usuario y consulta candidatos permitidos del catálogo de productos.",
    output: "Próxima mejor acción",
  },
  {
    icon: Bot,
    name: "Agente conversacional",
    role: "Convierte el resultado en una explicación clara, útil y trazable dentro del Copiloto NOVU.",
    output: "Recomendación explicada",
  },
];

const safeguards: [LucideIcon, string, string][] = [
  [
    Eye,
    "Lectura controlada",
    "NOVU consulta réplicas autorizadas; el modelo no se conecta directamente al core transaccional.",
  ],
  [
    LockKeyhole,
    "Mínimo dato necesario",
    "La capa de integración reduce y transforma los movimientos antes de enviarlos a los agentes.",
  ],
  [
    UserRoundCheck,
    "Consentimiento y propósito",
    "Cada uso de información responde a un propósito declarado y a permisos definidos por el banco.",
  ],
  [
    FileSearch,
    "Auditoría completa",
    "Consultas, reglas, versiones y recomendaciones dejan trazabilidad para revisión y cumplimiento.",
  ],
];

function Connector() {
  return (
    <span className={styles.connector} aria-hidden="true">
      <ArrowRight size={18} />
    </span>
  );
}

export default function TechnologyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Volver al inicio">
          <PartnerBrand priority />
        </Link>
        <Link className={styles.backLink} href="/">
          <ArrowLeft size={17} aria-hidden="true" />
          Volver a la landing
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="technical-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <Network size={16} aria-hidden="true" />
              Visión técnica del prototipo
            </span>
            <h1 id="technical-title">
              Inteligencia útil, conectada de forma <em>controlada.</em>
            </h1>
            <p>
              Esta es la arquitectura planeada para integrar NOVU con la red del
              banco: consultar señales desde réplicas transaccionales,
              contrastarlas con una cartera de productos separada y entregar
              recomendaciones explicables sin exponer el core bancario al
              modelo.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#arquitectura">
                Explorar arquitectura
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <Link className={styles.secondaryButton} href="/prototipo">
                Ver el prototipo
              </Link>
            </div>
          </div>

          <div
            className={styles.heroGraphic}
            aria-label="Resumen de la conexión técnica"
          >
            <div className={styles.signalCard}>
              <span className={styles.graphicIcon}>
                <Database size={22} aria-hidden="true" />
              </span>
              <div>
                <small>Fuente autorizada</small>
                <strong>Réplica transaccional</strong>
              </div>
              <span className={styles.readBadge}>solo lectura</span>
            </div>
            <div className={styles.signalLine} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={styles.orchestratorCard}>
              <BrainCircuit size={34} aria-hidden="true" />
              <div>
                <small>Orquestación NOVU</small>
                <strong>Contexto + reglas + agentes</strong>
              </div>
            </div>
            <div className={styles.signalLine} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={styles.recommendationCard}>
              <Sparkles size={22} aria-hidden="true" />
              <div>
                <small>Resultado para el usuario</small>
                <strong>Recomendación con una razón clara</strong>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.architectureSection}
          id="arquitectura"
          aria-labelledby="architecture-title"
        >
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>Arquitectura propuesta</span>
            <h2 id="architecture-title">Tres zonas, una conexión gobernada.</h2>
            <p>
              Los sistemas del banco conservan el control. NOVU recibe solo el
              contexto permitido mediante servicios de integración y cuentas con
              privilegios mínimos.
            </p>
          </div>

          <div
            className={styles.architectureBoard}
            aria-label="Flujo desde la red bancaria hacia NOVU y sus canales"
          >
            <article className={`${styles.zone} ${styles.bankZone}`}>
              <span className={styles.zoneLabel}>01 · Red del banco</span>
              <div className={styles.zoneTitle}>
                <Landmark size={25} aria-hidden="true" />
                <h3>Fuentes gobernadas</h3>
              </div>
              <div className={styles.sourceStack}>
                <div>
                  <Database size={19} aria-hidden="true" />
                  <span>
                    <strong>Réplicas transaccionales</strong>
                    <small>Movimientos disponibles para lectura</small>
                  </span>
                </div>
                <div>
                  <PackageSearch size={19} aria-hidden="true" />
                  <span>
                    <strong>Catálogo de productos</strong>
                    <small>Base separada con reglas y beneficios</small>
                  </span>
                </div>
              </div>
            </article>

            <Connector />

            <article className={`${styles.zone} ${styles.integrationZone}`}>
              <span className={styles.zoneLabel}>02 · Integración segura</span>
              <div className={styles.zoneTitle}>
                <ShieldCheck size={25} aria-hidden="true" />
                <h3>API y control de datos</h3>
              </div>
              <ul>
                <li>API Gateway e identidad de servicio</li>
                <li>Validación, minimización y seudonimización</li>
                <li>Reglas de elegibilidad y consentimiento</li>
                <li>Registro de auditoría y observabilidad</li>
              </ul>
            </article>

            <Connector />

            <article className={`${styles.zone} ${styles.novuZone}`}>
              <span className={styles.zoneLabel}>03 · Plataforma NOVU</span>
              <div className={styles.zoneTitle}>
                <Layers3 size={25} aria-hidden="true" />
                <h3>Orquestación de agentes</h3>
              </div>
              <ul>
                <li>Backend NOVU y memoria de conversación</li>
                <li>Contexto financiero resumido</li>
                <li>Agentes especializados y guardrails</li>
                <li>Copiloto web y experiencias móviles</li>
              </ul>
            </article>
          </div>

          <div className={styles.architectureNote}>
            <CheckCircle2 size={20} aria-hidden="true" />
            <p>
              <strong>Principio central:</strong> el modelo recibe contexto
              preparado y limitado. Las consultas a datos, la elegibilidad de
              productos y cualquier acción sensible permanecen en servicios
              determinísticos controlados por el banco.
            </p>
          </div>
        </section>

        <section
          className={styles.agentsSection}
          aria-labelledby="agents-title"
        >
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>Sistema multiagente</span>
            <h2 id="agents-title">
              Cada agente tiene una responsabilidad concreta.
            </h2>
            <p>
              La separación de tareas facilita aplicar permisos, evaluar calidad
              y explicar de dónde proviene cada recomendación.
            </p>
          </div>
          <div className={styles.agentGrid}>
            {agents.map(({ icon: Icon, name, role, output }, index) => (
              <article className={styles.agentCard} key={name}>
                <div className={styles.agentTopline}>
                  <span className={styles.agentIcon}>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span>Agente 0{index + 1}</span>
                </div>
                <h3>{name}</h3>
                <p>{role}</p>
                <div className={styles.agentOutput}>
                  <Route size={16} aria-hidden="true" />
                  Produce: {output}
                </div>
              </article>
            ))}
          </div>
          <div className={styles.guardrailBand}>
            <ShieldCheck size={26} aria-hidden="true" />
            <div>
              <strong>Capa transversal de gobierno y guardrails</strong>
              <span>
                Valida políticas, permisos, evidencia y formato antes de que
                cualquier respuesta llegue al usuario.
              </span>
            </div>
          </div>
        </section>

        <section
          className={styles.journeySection}
          aria-labelledby="journey-title"
        >
          <div className={styles.sectionHeading}>
            <span className={styles.kicker}>
              Del movimiento a la recomendación
            </span>
            <h2 id="journey-title">
              Las transacciones se convierten en señales, no en etiquetas.
            </h2>
            <p>
              Este ejemplo visual es ilustrativo. NOVU buscaría tendencias y
              contexto para apoyar una meta, sin juzgar compras individuales.
            </p>
          </div>

          <div className={styles.transactionJourney}>
            <div className={styles.transactionGroup}>
              <span className={styles.journeyLabel}>
                Movimientos en la réplica
              </span>
              <div className={styles.transactionCard}>
                <span className={styles.transactionIcon}>
                  <WalletCards size={19} aria-hidden="true" />
                </span>
                <div>
                  <strong>Ingreso recurrente</strong>
                  <small>Señal de flujo mensual</small>
                </div>
                <b className={styles.positive}>+ Q</b>
              </div>
              <div className={styles.transactionCard}>
                <span className={styles.transactionIcon}>
                  <Target size={19} aria-hidden="true" />
                </span>
                <div>
                  <strong>Aporte a una meta</strong>
                  <small>Señal de constancia</small>
                </div>
                <b className={styles.positive}>+ Q</b>
              </div>
              <div className={styles.transactionCard}>
                <span className={styles.transactionIcon}>
                  <ReceiptText size={19} aria-hidden="true" />
                </span>
                <div>
                  <strong>Gasto recurrente</strong>
                  <small>Señal de compromiso fijo</small>
                </div>
                <b>− Q</b>
              </div>
            </div>

            <Connector />

            <article className={styles.contextCard}>
              <span className={styles.journeyLabel}>Contexto preparado</span>
              <BrainCircuit size={34} aria-hidden="true" />
              <h3>Resumen financiero</h3>
              <ul>
                <li>Ritmo de ahorro</li>
                <li>Capacidad estimada</li>
                <li>Compromisos recurrentes</li>
                <li>Avance respecto a la meta</li>
              </ul>
            </article>

            <Connector />

            <article className={styles.productCard}>
              <span className={styles.journeyLabel}>
                Catálogo + recomendación
              </span>
              <Lightbulb size={34} aria-hidden="true" />
              <h3>Producto candidato</h3>
              <p>
                Se consulta la cartera vigente y sus reglas. NOVU presenta una
                opción elegible, el beneficio esperado y la razón de la
                sugerencia.
              </p>
              <span className={styles.exampleBadge}>Ejemplo ilustrativo</span>
            </article>
          </div>
        </section>

        <section
          className={styles.safetySection}
          aria-labelledby="safety-title"
        >
          <div className={styles.safetyIntro}>
            <span className={styles.kicker}>Seguridad y confianza</span>
            <h2 id="safety-title">
              Diseñado para operar dentro de límites verificables.
            </h2>
            <p>
              La propuesta prioriza control bancario, explicabilidad y
              separación entre recomendación y ejecución.
            </p>
          </div>
          <div className={styles.safeguardGrid}>
            {safeguards.map(([Icon, title, text]) => (
              <article key={title}>
                <Icon size={22} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.closingSection}>
          <div>
            <span className={styles.eyebrow}>
              <Sparkles size={16} aria-hidden="true" />
              De arquitectura a experiencia
            </span>
            <h2>La inteligencia acompaña; el banco conserva el control.</h2>
            <p>
              NOVU transforma contexto autorizado en orientación clara y deja
              cualquier contratación o transacción en los canales aprobados.
            </p>
          </div>
          <Link className={styles.primaryButton} href="/prototipo">
            Recorrer el prototipo
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <PartnerBrand />
        <p>Visión técnica conceptual · NOVU by G&T Continental</p>
        <Link href="/">Volver al inicio</Link>
      </footer>
    </div>
  );
}
