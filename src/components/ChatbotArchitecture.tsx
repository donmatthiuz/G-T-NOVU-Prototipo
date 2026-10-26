"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  Code2,
  Database,
  ListTree,
  MessageCircle,
  Route,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import styles from "./ChatbotArchitecture.module.css";

const scenarios = {
  business: {
    label: "Consulta de NOVU",
    classification: "BUSINESS",
    title: "Dentro de NOVU",
    prompt: "¿Cómo va mi meta de ahorro?",
    explanation:
      "La consulta pertenece al negocio. JEV la dirige a la capacidad que consulta el progreso de la meta.",
    capability: "Consultar progreso de ahorro",
    response:
      "Reviso el avance de tu meta y te explico cuánto llevás y cuál puede ser tu próximo paso.",
  },
  partial: {
    label: "Solicitud parcial",
    classification: "PARTIAL",
    title: "Una parte sí se puede atender",
    prompt: "Decime cómo va mi meta y comprame un boleto de avión.",
    explanation:
      "JEV separa la consulta de ahorro de la compra del boleto. Atiende la primera y explica el límite de la segunda.",
    capability: "Consultar progreso de ahorro",
    response:
      "Puedo ayudarte a revisar tu ahorro para el viaje. La compra del boleto se realiza fuera de NOVU.",
  },
  outside: {
    label: "Fuera de alcance",
    classification: "OUT_OF_SCOPE",
    title: "Un límite claro",
    prompt: "¿Quién ganó el partido de ayer?",
    explanation:
      "La pregunta no corresponde a las capacidades financieras de NOVU. El recorrido termina con una respuesta acotada.",
    capability: "Sin capacidad financiera aplicable",
    response:
      "Puedo ayudarte con tus metas, tu ahorro y tus planes compartidos. Esa consulta está fuera del alcance de NOVU.",
  },
};

type Scenario = keyof typeof scenarios;

function DownArrow() {
  return (
    <span className={styles.downArrow} aria-hidden="true">
      <ArrowDown size={20} />
    </span>
  );
}

export default function ChatbotArchitecture() {
  const [selected, setSelected] = useState<Scenario>("business");
  const scenario = scenarios[selected];
  return (
    <section
      className={styles.section}
      id="chatbot"
      aria-labelledby="chatbot-title"
    >
      <div className={styles.heading}>
        <span className={styles.kicker}>
          <BrainCircuit size={17} aria-hidden="true" /> Una IA con un recorrido
          definido
        </span>
        <h2 id="chatbot-title">Arquitectura híbrida del chatbot NOVU.</h2>
        <p>
          JEV clasifica y enruta. El código aplica reglas y obtiene datos. El
          modelo convierte ese contexto en una respuesta que se entiende.
        </p>
      </div>

      <div className={styles.explorer}>
        <div className={styles.explorerTop}>
          <div>
            <span className={styles.kicker}>Seguí una consulta</span>
            <h3>Tres solicitudes, tres caminos.</h3>
          </div>
          <span className={styles.exampleLabel}>Ejemplos ilustrativos</span>
        </div>
        <div
          className={styles.scenarioButtons}
          role="group"
          aria-label="Elegir ejemplo del chatbot"
        >
          {(Object.keys(scenarios) as Scenario[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={selected === id}
              onClick={() => setSelected(id)}
            >
              {selected === id && <Check size={15} aria-hidden="true" />}
              {scenarios[id].label}
            </button>
          ))}
        </div>

        <div
          className={styles.flow}
          aria-label="Recorrido de la arquitectura híbrida"
        >
          <div className={styles.inputs}>
            <article className={styles.node}>
              <MessageCircle size={20} aria-hidden="true" />
              <div>
                <small>Mensaje del usuario</small>
                <p>“{scenario.prompt}”</p>
              </div>
            </article>
            <article className={styles.node}>
              <Database size={20} aria-hidden="true" />
              <div>
                <small>Business context</small>
                <p>Metas, ahorro e información autorizada.</p>
              </div>
            </article>
          </div>
          <DownArrow />
          <div className={`${styles.node} ${styles.merged}`}>
            <LayersLabel number="01" />
            <div>
              <strong>State input + context</strong>
              <p>El mensaje se une al contexto de negocio permitido.</p>
            </div>
          </div>
          <DownArrow />
          <div className={styles.classifier}>
            <BrainCircuit size={30} aria-hidden="true" />
            <div>
              <small>02 · Clasificación de alcance</small>
              <strong>JEV</strong>
              <p>¿Qué parte de esta solicitud puede atender NOVU?</p>
            </div>
          </div>
          <DownArrow />
          <div className={styles.branches}>
            {(["outside", "partial", "business"] as Scenario[]).map((id) => (
              <div
                className={`${styles.branch} ${selected === id ? styles.selectedBranch : ""}`}
                key={id}
              >
                <code>{scenarios[id].classification}</code>
                <strong>{scenarios[id].title}</strong>
                <span>
                  {id === "outside"
                    ? "Respuesta de alcance y fin del recorrido."
                    : id === "partial"
                      ? "JEV · Partial request: separa y enruta la parte atendible."
                      : "La solicitud continúa hacia una capacidad del negocio."}
                </span>
              </div>
            ))}
          </div>

          {selected !== "outside" && (
            <>
              <DownArrow />
              <div className={styles.routingRow}>
                <aside className={styles.catalog}>
                  <ListTree size={24} aria-hidden="true" />
                  <div>
                    <strong>Catálogo de capacidades</strong>
                    <p>Rutas y recursos disponibles para cada consulta.</p>
                  </div>
                </aside>
                <ArrowRight
                  className={styles.catalogArrow}
                  size={22}
                  aria-hidden="true"
                />
                <article className={`${styles.node} ${styles.routing}`}>
                  <Route size={24} aria-hidden="true" />
                  <div>
                    <small>03 · Capability routing</small>
                    <strong>Capacidad detectada</strong>
                    <p>{scenario.capability}</p>
                  </div>
                </article>
              </div>
              <DownArrow />
              <div className={`${styles.node} ${styles.merged}`}>
                <SlidersHorizontal size={24} aria-hidden="true" />
                <div>
                  <small>04 · Configuración</small>
                  <strong>Catálogo · ejecución · recurso</strong>
                  <p>
                    Se elige la configuración y se comprueba si existe código
                    para resolver la consulta.
                  </p>
                </div>
              </div>
              <div className={styles.fallback}>
                <ShieldCheck size={17} aria-hidden="true" />
                <p>
                  <b>Execution code:</b> si existe, se ejecuta la consulta
                  autorizada. Si no existe, se usa un fallback que explica la
                  limitación sin inventar datos.
                </p>
              </div>
              <DownArrow />
              <div className={styles.processing}>
                <article className={styles.processingCard}>
                  <Code2 size={25} aria-hidden="true" />
                  <small>05 · Código determinista</small>
                  <h4>Obtener datos</h4>
                  <p>
                    Consulta fuentes autorizadas y aplica las reglas. Los saldos
                    y cálculos salen del código.
                  </p>
                </article>
                <ArrowRight
                  className={styles.processingArrow}
                  aria-hidden="true"
                />
                <article className={`${styles.processingCard} ${styles.llm}`}>
                  <Bot size={25} aria-hidden="true" />
                  <small>06 · LLM</small>
                  <h4>Explicar con contexto</h4>
                  <p>
                    Redacta la respuesta conversacional a partir de la
                    información recibida.
                  </p>
                </article>
                <ArrowRight
                  className={styles.processingArrow}
                  aria-hidden="true"
                />
                <article className={styles.processingCard}>
                  <Code2 size={25} aria-hidden="true" />
                  <small>07 · Presentación</small>
                  <h4>Aplicar formato</h4>
                  <p>
                    Organiza el resultado y lo adapta a la experiencia del
                    Copiloto.
                  </p>
                </article>
              </div>
            </>
          )}
          <DownArrow />
          <div className={styles.output} aria-live="polite" aria-atomic="true">
            <span>
              <Bot size={22} aria-hidden="true" />
            </span>
            <div>
              <small>Output · Respuesta al usuario</small>
              <p>{scenario.response}</p>
            </div>
          </div>
        </div>
        <p className={styles.explanation} aria-live="polite">
          {scenario.explanation}
        </p>
      </div>
      <div className={styles.boundary}>
        <ShieldCheck size={22} aria-hidden="true" />
        <p>
          <strong>
            La conversación acompaña; las acciones tienen su propio control.
          </strong>{" "}
          Un aporte, retiro o voto siempre requiere confirmación en la interfaz.
          Este diagrama representa la arquitectura híbrida propuesta; el
          Copiloto de la demo consulta contexto autorizado y genera respuestas
          sin ejecutar movimientos desde el chat.
        </p>
      </div>
    </section>
  );
}

function LayersLabel({ number }: { number: string }) {
  return (
    <span className={styles.stepNumber} aria-hidden="true">
      {number}
    </span>
  );
}
