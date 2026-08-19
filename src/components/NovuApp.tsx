"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import { useNovuData } from "@/hooks/useNovuData";
import { usePersistentBoolean } from "@/hooks/usePersistentBoolean";
import {
  validateCaptureFile,
  validateRegistrationContact,
} from "@/lib/registration";
import { SIDEBAR_STORAGE_KEY } from "@/lib/session";
import type {
  CapturedMedia,
  CaptureSlot,
  RegistrationContact,
  RegistrationContactErrors,
} from "@/types/novu";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  Bot,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  CirclePlus,
  Clock3,
  FileText,
  Flag,
  HandCoins,
  Heart,
  Home,
  LockKeyhole,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

const wizard = [
  {
    title: "¿Qué querés lograr?",
    text: "Elegí el objetivo que más se adapta a vos hoy.",
    options: [
      "Comprar una moto",
      "Continuar mis estudios",
      "Emprender un negocio",
      "Mejorar mi vivienda",
      "Fondo de emergencia",
      "Otra meta",
    ],
  },
  {
    title: "¿Qué te motiva?",
    text: "Elegí todas las razones que apliquen.",
    options: [
      "Conocer lugares nuevos",
      "Tener tranquilidad",
      "Crecer profesionalmente",
      "Apoyar a mi familia",
    ],
  },
  {
    title: "Contanos tu punto de partida",
    text: "No hay respuestas correctas. Esto nos ayuda a acompañarte mejor.",
    options: [
      "Estoy empezando",
      "Ya ahorro a veces",
      "Tengo un hábito de ahorro",
    ],
  },
  {
    title: "¿Cuándo te gustaría lograrlo?",
    text: "Podés ajustar tu plan después.",
    options: ["En 3 meses", "En 6 meses", "En 1 año", "A mi ritmo"],
  },
  {
    title: "Tu plan está listo",
    text: "Para tu viaje a Antigua, NOVU te recomienda ahorrar Q 180 cada semana.",
    options: [],
  },
];

type Go = (page: string) => void;
type Notify = (message: string) => void;
type NavProps = { go: Go };
type NavNotifyProps = NavProps & { notify: Notify };
type SharedType = "group" | "family";
type Complete = () => void;

function Logo({ wordmark = false }: { wordmark?: boolean }) {
  return (
    <>
      <span className="app-logo">
        <Image
          src="/brand/novu-mark-transparent.png"
          alt="NOVU"
          width={114}
          height={104}
        />
      </span>
      {wordmark && (
        <Image
          className="app-wordmark"
          src="/brand/novu-wordmark.png"
          alt=""
          width={137}
          height={26}
        />
      )}
    </>
  );
}

function Primary({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}) {
  return (
    <button className="app-primary" onClick={onClick} disabled={disabled}>
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </button>
  );
}

function AppHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="app-header">
      {onBack ? (
        <button className="icon-button" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={21} />
        </button>
      ) : (
        <Logo />
      )}
      <h1>{title}</h1>
      {action || (
        <button className="icon-button" aria-label="Ayuda">
          <CircleHelp size={21} />
        </button>
      )}
    </header>
  );
}

function Progress({ value = 62 }: { value?: number }) {
  return (
    <div className="app-progress" aria-label={`${value}% completado`}>
      <span style={{ width: `${value}%` }}></span>
    </div>
  );
}

function Welcome({ go }: NavProps) {
  return (
    <div className="entry-screen">
      <div className="entry-content">
        <Logo wordmark />
        <span className="entry-line"></span>
        <h1>
          Tu futuro empieza con <i>un paso.</i>
        </h1>
        <p>Convertí tus metas en un plan hecho para vos.</p>
        <div className="entry-features">
          <span>
            <Target /> Metas
          </span>
          <span>
            <FileText /> Plan
          </span>
          <span>
            <TrendingUp /> Progreso
          </span>
          <span>
            <Bot /> Coach
          </span>
        </div>
        <Primary onClick={() => go("wizard")}>Empezar</Primary>
        <button className="entry-secondary" onClick={() => go("login")}>
          Ya tengo cuenta
        </button>
        <small>
          <ShieldCheck size={14} /> Respaldado por G&T Continental
        </small>
      </div>
    </div>
  );
}

function Login({
  go,
  onLogin,
  loading,
  error,
}: NavProps & {
  onLogin: (identifier: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}) {
  const [shown, setShown] = useState(false);
  const [identifier, setIdentifier] = useState("diego@correo.com");
  const [password, setPassword] = useState("novu2026");
  const submit = async () => {
    if (await onLogin(identifier, password)) go("home");
  };
  return (
    <div className="entry-screen">
      <div className="login-card">
        <button className="entry-back" onClick={() => go("welcome")}>
          <ArrowLeft size={20} /> Volver
        </button>
        <Logo wordmark />
        <h1>Qué bueno verte de nuevo.</h1>
        <p>Ingresá para seguir construyendo tu futuro.</p>
        <label>
          Correo o teléfono
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Contraseña
          <div className="password-input">
            <input
              type={shown ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShown(!shown)}
              aria-label={shown ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <LockKeyhole size={17} />
            </button>
          </div>
        </label>
        {error && (
          <div className="form-error-summary" role="alert">
            {error}
          </div>
        )}
        <Primary
          onClick={submit}
          disabled={loading || !identifier.trim() || !password}
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </Primary>
        <div className="bio-row">
          <button onClick={() => go("bio-fingerprint")}>
            <ShieldCheck /> Huella
          </button>
          <button onClick={() => go("bio-face")}>
            <Camera /> Rostro
          </button>
          <button onClick={() => go("bio-faceid")}>
            <UserRound /> Face ID
          </button>
        </div>
      </div>
    </div>
  );
}

function BiometricScan({
  type,
  go,
  onVerify,
}: NavProps & {
  type: "fingerprint" | "face" | "faceid";
  onVerify: () => Promise<boolean>;
}) {
  const labels: Record<
    "fingerprint" | "face" | "faceid",
    [string, LucideIcon]
  > = {
    fingerprint: ["Huella", ShieldCheck],
    face: ["Reconocimiento facial", Camera],
    faceid: ["Face ID", UserRound],
  };
  const [label, Icon] = labels[type];
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="capture-page biometric-page">
      <button className="capture-back" onClick={() => go("login")}>
        <ArrowLeft /> Volver
      </button>
      <div className={`scan-ring ${ready ? "ready" : ""}`}>
        <Icon />
      </div>
      <span className="capture-overline">VERIFICACIÓN BIOMÉTRICA</span>
      <h1>
        {ready ? `${label} verificada` : `Verificando ${label.toLowerCase()}`}
      </h1>
      <p>
        {ready
          ? "Tu identidad se confirmó correctamente."
          : "Mantenete frente al dispositivo por un momento."}
      </p>
      {ready && (
        <Primary
          onClick={async () => {
            if (await onVerify()) go("home");
          }}
        >
          Continuar
        </Primary>
      )}
    </div>
  );
}

function Wizard({
  go,
  notify,
  newGoal = false,
}: NavNotifyProps & { newGoal?: boolean }) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<string[]>([]);
  const [goalName, setGoalName] = useState("Viaje a Antigua");
  const item = wizard[step];
  const toggle = (value: string) => {
    if (step === 0) setGoalName(value);
    setChoice((old) => {
      if (step !== 1) return [value];
      return old.includes(value)
        ? old.filter((item) => item !== value)
        : [...old, value];
    });
  };
  const next = () => {
    if (step === wizard.length - 1) {
      if (newGoal) {
        notify(`Nueva meta “${goalName}” creada en este demo.`);
        go("metas");
      } else {
        go("kyc");
      }
      return;
    }
    setStep(step + 1);
    setChoice([]);
  };
  return (
    <div className={`app-page wizard-page ${newGoal ? "goal-create-page" : ""}`}>
      <AppHeader
        title={newGoal ? "Nueva meta personal" : ""}
        onBack={
          step
            ? () => setStep(step - 1)
            : () => go(newGoal ? "metas" : "welcome")
        }
      />
      <div className="wizard-progress">
        {wizard.map((_, index) => (
          <span className={index <= step ? "active" : ""} key={index}></span>
        ))}
      </div>
      <p className="overline">
        Paso {step + 1} de {wizard.length}
      </p>
      <h2>{item.title}</h2>
      <p className="app-subtitle">{item.text}</p>
      {item.options.length ? (
        <div className="option-grid">
          {item.options.map((option) => (
            <button
              key={option}
              className={choice.includes(option) ? "selected" : ""}
              onClick={() => toggle(option)}
            >
              <span>{choice.includes(option) && <Check size={15} />}</span>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="plan-ready">
          <Sparkles />
          <strong>Plan personal</strong>
          <h3>{goalName}</h3>
          <p>Q 180 cada semana · 7 meses</p>
          <Progress />
          <small>Vas a llegar en marzo de 2027</small>
        </div>
      )}
      <Primary
        disabled={Boolean(item.options.length && !choice.length)}
        onClick={next}
      >
        {step === wizard.length - 1
          ? newGoal
            ? "Crear meta personal"
            : "Verificar mi cuenta"
          : "Continuar"}
      </Primary>
      <button
        className="app-text-button"
        onClick={() => notify("Podés completar este paso más tarde.")}
      >
        Lo haré después
      </button>
    </div>
  );
}

function Kyc({
  go,
  completed,
  onFinish,
  loading,
  error,
}: NavProps & {
  completed: string[];
  onFinish: () => Promise<void>;
  loading: boolean;
  error: string | null;
}) {
  const steps: [string, LucideIcon, string][] = [
    ["DPI", CreditCard, "dpi-front"],
    ["Selfie", Camera, "selfie-capture"],
    ["Contacto y contraseña", LockKeyhole, "contact"],
    ["Comprobante de domicilio", FileText, "proof-capture"],
  ];
  return (
    <div className="app-page">
      <AppHeader title="Un último paso" onBack={() => go("wizard")} />
      <div className="kyc-intro">
        <ShieldCheck />
        <h2>Verificá tu identidad</h2>
        <p>
          Para empezar a ahorrar activamos tu Cuenta Digital de G&T Continental,
          100% digital.
        </p>
      </div>
      <div className="kyc-list">
        {steps.map(([label, Icon, route]) => (
          <button key={label} onClick={() => go(route)}>
            <span
              className={`kyc-icon ${completed.includes(label) ? "complete" : ""}`}
            >
              {completed.includes(label) ? (
                <Check size={20} />
              ) : (
                <Icon size={20} />
              )}
            </span>
            <span>
              <b>{label}</b>
              <small>
                {completed.includes(label) ? "Listo" : "Completar este paso"}
              </small>
            </span>
            <ChevronRight size={19} />
          </button>
        ))}
      </div>
      <p className="kyc-note">
        Sin cobros ocultos. Cualquier condición te la explicamos en lenguaje
        sencillo.
      </p>
      {error && (
        <div className="form-error-summary" role="alert">
          {error}
        </div>
      )}
      <Primary
        disabled={completed.length !== steps.length || loading}
        onClick={onFinish}
      >
        {loading ? "Creando tu cuenta…" : "Crear mi cuenta y empezar"}
      </Primary>
    </div>
  );
}

function CaptureScreen({
  kind,
  side,
  slot,
  go,
  back,
  next,
  onCapture,
}: NavProps & {
  kind: "dpi" | "selfie" | "proof";
  side?: "frente" | "reverso";
  slot: CaptureSlot;
  back: string;
  next: string;
  onCapture: (
    slot: CaptureSlot,
    file: File,
    source: "camera" | "upload",
  ) => void;
}) {
  const isSelfie = kind === "selfie";
  const isProof = kind === "proof";
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    videoRef,
    status,
    error: cameraError,
    start,
    capture,
  } = useCameraCapture(isSelfie ? "user" : "environment");
  const title = isSelfie
    ? "Tomate una selfie"
    : isProof
      ? "Foto de tu comprobante"
      : `Foto del ${side} de tu DPI`;
  const copy = isSelfie
    ? "Centrá tu rostro dentro del óvalo. Quitate lentes o gorra."
    : isProof
      ? "Encuadrá el documento completo, sin cortes ni dobleces."
      : side === "frente"
        ? "Mostrá tu documento completo, con buena luz y sin reflejos."
        : "Mostrá el código y la dirección con buena luz, sin cortes.";
  const accept = isProof
    ? "image/jpeg,image/png,image/webp,application/pdf"
    : "image/jpeg,image/png,image/webp";
  const chooseFile = (file: File | undefined, source: "camera" | "upload") => {
    if (!file) return;
    const validationError = validateCaptureFile(file, kind);
    if (validationError) {
      setFileError(validationError);
      return;
    }
    setFileError(null);
    onCapture(slot, file, source);
    go(next);
  };
  const useCamera = async () => {
    if (status !== "ready") {
      await start();
      return;
    }
    try {
      const file = await capture(`${slot}-${Date.now()}.jpg`);
      chooseFile(file, "camera");
    } catch (cause) {
      setFileError(
        cause instanceof Error
          ? cause.message
          : "No fue posible tomar la foto.",
      );
    }
  };
  return (
    <div className="capture-page">
      <button className="capture-back" onClick={() => go(back)}>
        <ArrowLeft /> Volver
      </button>
      <div>
        <span className="capture-overline">
          {isSelfie
            ? "VERIFICACIÓN FACIAL"
            : isProof
              ? "COMPROBANTE DE DOMICILIO"
              : `DPI · ${side === "frente" ? "1" : "2"} DE 2`}
        </span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <div
        className={`camera-guide ${isSelfie ? "face" : isProof ? "proof" : ""}`}
      >
        <video
          ref={videoRef}
          className={
            status === "ready" ? "camera-video visible" : "camera-video"
          }
          muted
          playsInline
          aria-label="Vista previa de la cámara"
        />
        {status !== "ready" && (
          <span className="camera-placeholder" aria-hidden="true">
            {isSelfie ? <UserRound /> : isProof ? <FileText /> : <CreditCard />}
          </span>
        )}
      </div>
      <div className="capture-feedback" aria-live="polite">
        <span className="capture-hint">
          {status === "ready"
            ? "Cámara lista. Tocá el obturador."
            : status === "requesting"
              ? "Solicitando permiso para la cámara…"
              : "Activá la cámara o elegí un archivo."}
        </span>
        {(fileError || cameraError) && (
          <span className="capture-error" role="alert">
            {fileError || cameraError}
          </span>
        )}
      </div>
      <button
        className="gallery-button"
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload aria-hidden="true" /> Subir archivo
      </button>
      <input
        ref={fileInputRef}
        className="visually-hidden"
        id={`capture-${slot}`}
        type="file"
        tabIndex={-1}
        accept={accept}
        onChange={(event) => {
          chooseFile(event.currentTarget.files?.[0], "upload");
          event.currentTarget.value = "";
        }}
      />
      <button
        className="shutter"
        onClick={useCamera}
        aria-label={status === "ready" ? "Tomar foto" : "Activar cámara"}
        disabled={status === "requesting"}
      >
        <span></span>
      </button>
    </div>
  );
}

function ReviewCapture({
  kind,
  go,
  accept,
  retake,
  complete,
  media,
  requiredCount = 1,
}: NavProps & {
  kind: "dpi" | "selfie" | "proof";
  accept: string;
  retake: string;
  complete: Complete;
  media: CapturedMedia[];
  requiredCount?: number;
}) {
  const isDpi = kind === "dpi";
  const isSelfie = kind === "selfie";
  const title = isDpi
    ? "Revisá tu DPI"
    : isSelfie
      ? "Revisá tu selfie"
      : "Revisá tu comprobante";
  const copy = isDpi
    ? "Verificá que se lean tu nombre, número de DPI y la fotografía."
    : isSelfie
      ? "Asegurate de que se vea tu rostro completo, sin filtros."
      : "Debe verse tu nombre y una dirección de los últimos 3 meses.";
  const Icon = isDpi ? CreditCard : isSelfie ? UserRound : FileText;
  return (
    <div className="capture-page review-page">
      <div className="review-card">
        <span className="review-icon">
          <Icon />
        </span>
        <h1>{title}</h1>
        <div className={`capture-preview ${isDpi ? "double" : ""}`}>
          {media.map((item, index) => (
            <span key={item.previewUrl}>
              {item.file.type === "application/pdf" ? (
                <FileText />
              ) : (
                // Blob URLs are local previews and are not compatible with the Next optimizer.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt={`Vista previa ${index + 1}`} />
              )}
              <small>
                {isDpi ? (index === 0 ? "Frente" : "Reverso") : item.file.name}
              </small>
            </span>
          ))}
        </div>
        <p>{copy}</p>
        <Primary
          disabled={media.length < requiredCount}
          onClick={() => {
            complete();
            go(accept);
          }}
        >
          Usar{" "}
          {isDpi ? "estas fotos" : isSelfie ? "esta foto" : "este comprobante"}
        </Primary>
        <button className="review-secondary" onClick={() => go(retake)}>
          <RotateCcw /> Tomar de nuevo
        </button>
      </div>
    </div>
  );
}

function ContactForm({
  go,
  complete,
  values,
  onChange,
}: NavProps & {
  complete: Complete;
  values: RegistrationContact;
  onChange: (values: RegistrationContact) => void;
}) {
  const [errors, setErrors] = useState<RegistrationContactErrors>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const setField = (field: keyof RegistrationContact, value: string) =>
    onChange({ ...values, [field]: value });
  const validateField = (field: keyof RegistrationContact) => {
    const message = validateRegistrationContact(values)[field];
    setErrors((current) => {
      const next = { ...current };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };
  const submit = () => {
    const nextErrors = validateRegistrationContact(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    complete();
    go("kyc");
  };
  return (
    <div className="capture-page review-page">
      <div className="review-card form-card">
        <span className="review-icon">
          <LockKeyhole />
        </span>
        <h1>Contacto y contraseña</h1>
        <p>Lo usamos para avisarte sobre tu ahorro y proteger tu cuenta.</p>
        {Object.keys(errors).length > 0 && (
          <div
            className="form-error-summary"
            role="alert"
            tabIndex={-1}
            ref={errorSummaryRef}
          >
            <b>Revisá los campos marcados:</b>
            <ul>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  <a
                    href={`#registration-${field.replace("Confirmation", "-confirmation")}`}
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <label htmlFor="registration-phone">
          Teléfono
          <input
            id="registration-phone"
            type="tel"
            value={values.phone}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? "registration-phone-error" : undefined
            }
            onChange={(event) => setField("phone", event.target.value)}
            onBlur={() => validateField("phone")}
          />
          {errors.phone && (
            <small id="registration-phone-error" className="field-error">
              {errors.phone}
            </small>
          )}
        </label>
        <label htmlFor="registration-email">
          Correo electrónico
          <input
            id="registration-email"
            type="email"
            value={values.email}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "registration-email-error" : undefined
            }
            onChange={(event) => setField("email", event.target.value)}
            onBlur={() => validateField("email")}
          />
          {errors.email && (
            <small id="registration-email-error" className="field-error">
              {errors.email}
            </small>
          )}
        </label>
        <label htmlFor="registration-password">
          Contraseña
          <input
            id="registration-password"
            type="password"
            value={values.password}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "registration-password-error" : undefined
            }
            onChange={(event) => setField("password", event.target.value)}
            onBlur={() => validateField("password")}
          />
          {errors.password && (
            <small id="registration-password-error" className="field-error">
              {errors.password}
            </small>
          )}
        </label>
        <label htmlFor="registration-password-confirmation">
          Confirmar contraseña
          <input
            id="registration-password-confirmation"
            type="password"
            value={values.passwordConfirmation}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.passwordConfirmation)}
            aria-describedby={
              errors.passwordConfirmation
                ? "registration-password-confirmation-error"
                : undefined
            }
            onChange={(event) =>
              setField("passwordConfirmation", event.target.value)
            }
            onBlur={() => validateField("passwordConfirmation")}
          />
          {errors.passwordConfirmation && (
            <small
              id="registration-password-confirmation-error"
              className="field-error"
            >
              {errors.passwordConfirmation}
            </small>
          )}
        </label>
        <Primary onClick={submit}>Guardar y continuar</Primary>
        <button className="review-secondary" onClick={() => go("kyc")}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Dashboard({ go, notify }: NavNotifyProps) {
  const { data } = useNovuData();
  const { profile, personalGoal, recentActivity } = data;
  return (
    <div className="app-page home-page">
      <AppHeader
        title={`Hola, ${profile.firstName}`}
        action={
          <button
            className="profile-button"
            onClick={() => go("menu")}
            aria-label="Abrir menú"
          >
            D
          </button>
        }
      />
      <p className="app-subtitle">Hoy es un buen día para avanzar.</p>
      <button className="goal-hero" onClick={() => go("metas")}>
        <div>
          <span>Meta personal</span>
          <h2>{personalGoal.name}</h2>
          <p>
            Q {personalGoal.savedAmount.toLocaleString("es-GT")} de Q{" "}
            {personalGoal.targetAmount.toLocaleString("es-GT")}
          </p>
        </div>
        <strong>{personalGoal.progress}%</strong>
        <Progress value={personalGoal.progress} />
      </button>
      <section>
        <div className="section-row">
          <h2>Accesos rápidos</h2>
          <button onClick={() => go("menu")}>Ver todo</button>
        </div>
        <div className="quick-actions" aria-label="Accesos rápidos">
          <button onClick={() => go("personal-create")}>
            <span className="quick-action-icon"><Target /></span>
            <span>
              <b>Nueva meta personal</b>
              <small>Creá un plan de ahorro para vos</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </button>
          <button onClick={() => go("group-create")}>
            <span className="quick-action-icon"><UsersRound /></span>
            <span>
              <b>Nuevo reto grupal</b>
              <small>Compartí una meta con otras personas</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </button>
          <button onClick={() => go("family-create")}>
            <span className="quick-action-icon"><Heart /></span>
            <span>
              <b>Nuevo fondo grupal</b>
              <small>Definí aportes, permisos y administración</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </button>
          <button onClick={() => go("copiloto")}>
            <span className="quick-action-icon"><Bot /></span>
            <span>
              <b>Consultar a NOVU</b>
              <small>Recibí orientación sobre tu plan</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </section>
      <section>
        <div className="section-row">
          <h2>Actividad reciente</h2>
          <button onClick={() => notify("Mostrando el historial completo.")}>
            Ver historial
          </button>
        </div>
        <div className="activity-list">
          {recentActivity.map((item) => (
            <div key={item.id}>
              <span className={`activity-icon ${item.tone}`}>
                <WalletCards size={18} />
              </span>
              <span>
                <b>{item.name}</b>
                <small>{item.dateLabel}</small>
              </span>
              <strong className={item.tone}>{item.amountLabel}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Goals({ go, notify }: NavNotifyProps) {
  return (
    <div className="app-page">
      <AppHeader title="Mis metas" onBack={() => go("home")} />
      <button
        className="goal-hero tall"
        onClick={() => notify("Tu aporte sugerido es Q 180 cada viernes.")}
      >
        <div>
          <span>Plan personal</span>
          <h2>Viaje a Antigua</h2>
          <p>Faltan Q 750 para llegar.</p>
        </div>
        <strong>62%</strong>
        <Progress value={62} />
      </button>
      <div className="metric-row">
        <div>
          <Clock3 />
          <b>7 meses</b>
          <small>Fecha estimada</small>
        </div>
        <div>
          <HandCoins />
          <b>Q 180</b>
          <small>Aporte semanal</small>
        </div>
        <div>
          <Award />
          <b>Nivel 4</b>
          <small>Tu constancia</small>
        </div>
      </div>
      <section className="action-list">
        <button onClick={() => go("personal-create")}>
          <CirclePlus />
          <span>
            <b>Crear nueva meta</b>
            <small>Definí otro objetivo y recibí un plan</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => go("personal-withdraw")}>
          <HandCoins />
          <span>
            <b>Retiro personal</b>
            <small>Revisá el impacto en tu meta</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => go("ritmo")}>
          <TrendingUp />
          <span>
            <b>Tu ritmo</b>
            <small>Racha, nivel y constancia</small>
          </span>
          <ChevronRight />
        </button>
      </section>
    </div>
  );
}

function Copilot({ go, notify }: NavNotifyProps) {
  const [messages, setMessages] = useState<
    Array<{ from: "bot" | "me"; text: string }>
  >([
    {
      from: "bot",
      text: "¡Hola, Diego! Esta semana vas muy bien. ¿Querés ver cómo adelantar tu viaje a Antigua?",
    },
  ]);
  const [draft, setDraft] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const answers = [
    "¿Cómo voy?",
    "Quiero ahorrar más",
    "¿Puedo cambiar mi meta?",
  ];
  const reply = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    setMessages((current) => [
      ...current,
      { from: "me", text: cleanText },
      {
        from: "bot",
        text: cleanText.includes("más")
          ? "Podrías subir tu aporte a Q 220 por semana y llegarías un mes antes."
          : cleanText.includes("cambiar")
            ? "Sí. Desde Metas podés ajustar tu objetivo y NOVU recalcula el plan."
            : "Llevás 62% de tu meta y una racha de 4 semanas. ¡Excelente avance!",
      },
    ]);
    setDraft("");
    notify("Respuesta predeterminada de NOVU mostrada.");
  };
  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;
    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [messages]);
  return (
    <div className="app-page copilot-page">
      <AppHeader title="Copiloto NOVU" onBack={() => go("home")} />
      <section className="copilot-workspace" aria-label="Conversación con NOVU">
        <header className="coach-title">
          <Logo />
          <div>
            <b>Asistente financiero NOVU</b>
            <small><i aria-hidden="true" /> Disponible para orientarte</small>
          </div>
          <span>Tu información permanece en este demo</span>
        </header>
        <div className="chat" ref={chatRef} role="log" aria-live="polite">
          {messages.map((message, index) => (
            <article key={`${message.from}-${index}`} className={`chat-message ${message.from}`}>
              {message.from === "bot" && <Logo />}
              <div>
                <span>{message.from === "bot" ? "NOVU" : "Vos"}</span>
                <p>{message.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="copilot-composer">
          <div className="quick-answers" aria-label="Preguntas sugeridas">
            {answers.map((answer) => (
              <button type="button" key={answer} onClick={() => reply(answer)}>
                {answer}
              </button>
            ))}
          </div>
          <form
            className="chat-input"
            onSubmit={(event) => {
              event.preventDefault();
              reply(draft);
            }}
          >
            <label htmlFor="copilot-message" className="sr-only">
              Escribí un mensaje para NOVU
            </label>
            <input
              id="copilot-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribí tu consulta"
              autoComplete="off"
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Enviar mensaje">
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
          <small>NOVU puede equivocarse. Revisá la información antes de tomar decisiones.</small>
        </div>
      </section>
    </div>
  );
}

function Group({ go }: NavProps) {
  return (
    <div className="app-page">
      <AppHeader title="Plan del reto" onBack={() => go("home")} />
      <div className="shared-hero group">
        <UsersRound />
        <span>Reto colaborativo</span>
        <h2>Reto de julio</h2>
        <p>Q 2,100 de Q 3,000 · 4 integrantes</p>
        <Progress value={70} />
      </div>
      <div className="member-list">
        <div>
          <span>CA</span>
          <b>Carlos</b>
          <small>Q 600 · 1º</small>
        </div>
        <div>
          <span>AN</span>
          <b>Ana</b>
          <small>Q 525 · 2º</small>
        </div>
        <div>
          <span>DV</span>
          <b>Vos</b>
          <small>Q 500 · 3º</small>
        </div>
        <div>
          <span>MA</span>
          <b>María</b>
          <small>Q 475 · 4º</small>
        </div>
      </div>
      <section className="action-list">
        <button onClick={() => go("group-contribute")}>
          <CirclePlus />
          <span>
            <b>Aportar al reto</b>
            <small>Elegí cuenta, monto y descripción</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => go("group-history")}>
          <Clock3 />
          <span>
            <b>Historial del reto</b>
            <small>Filtrá aportes por integrante</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => go("group-withdraw")}>
          <HandCoins />
          <span>
            <b>Retirar del reto</b>
            <small>Indicá monto y motivo</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => go("group-create")}>
          <CirclePlus />
          <span>
            <b>Crear otro reto</b>
            <small>Configurá una meta compartida</small>
          </span>
          <ChevronRight />
        </button>
      </section>
    </div>
  );
}

function Family({ go }: NavProps) {
  return (
    <div className="app-page">
      <AppHeader title="Fondo familiar" onBack={() => go("home")} />
      <div className="shared-hero family">
        <Heart />
        <span>Meta de familia</span>
        <h2>Fondo Familia Pérez</h2>
        <p>Q 4,850 de Q 8,000 · 5 integrantes</p>
        <Progress value={60} />
      </div>
      <div className="vote-card">
        <span className="vote-icon">
          <FileText />
        </span>
        <div>
          <span>Solicitud pendiente</span>
          <h3>Reparación de cocina · Q 600</h3>
          <p>Tu voto ayuda a liberar el dinero.</p>
        </div>
        <button className="inline-link" onClick={() => go("family-vote")}>
          Revisar y votar <ChevronRight />
        </button>
      </div>
      <section className="action-list">
        <button onClick={() => go("family-contribute")}>
          <CirclePlus />
          <span>
            <b>Aportar al fondo</b>
            <small>Elegí cuenta y monto</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => go("family-requests")}>
          <FileText />
          <span>
            <b>Solicitudes del fondo</b>
            <small>Aprobá, rechazá o creá una solicitud</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => go("family-history")}>
          <Clock3 />
          <span>
            <b>Historial de aportaciones</b>
            <small>Filtrá por miembro o período</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => go("family-create")}>
          <CirclePlus />
          <span>
            <b>Crear otro fondo</b>
            <small>Definí reglas y administradores</small>
          </span>
          <ChevronRight />
        </button>
      </section>
    </div>
  );
}

function PersonalWithdraw({ go, notify }: NavNotifyProps) {
  return (
    <FormScreen
      title="Retiro personal"
      subtitle="Antes de retirar, revisá cómo cambia tu fecha de llegada."
      back="metas"
      go={go}
      notify={notify}
      next="metas"
      action="Confirmar retiro"
    >
      <label>
        Monto a retirar
        <input type="number" defaultValue="250" />
      </label>
      <div className="impact-card">
        <span>Impacto estimado</span>
        <b>Tu meta se movería 3 semanas</b>
        <p>Nuevo saldo: Q 1,000 · Nueva fecha: abril de 2027</p>
      </div>
    </FormScreen>
  );
}

function FormScreen({
  title,
  subtitle,
  stepLabel,
  back,
  go,
  notify,
  next,
  action,
  children,
}: NavNotifyProps & {
  title: string;
  subtitle: string;
  stepLabel?: string;
  back: string;
  next: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <div className="app-page">
      <AppHeader title={title} onBack={() => go(back)} />
      {stepLabel && <p className="overline form-step">{stepLabel}</p>}
      <p className="app-subtitle form-subtitle">{subtitle}</p>
      <div className="web-form">{children}</div>
      <Primary
        onClick={() => {
          notify(`${action}: acción guardada localmente.`);
          go(next);
        }}
      >
        {action}
      </Primary>
    </div>
  );
}

function GroupCreate({ go, notify }: NavNotifyProps) {
  return (
    <FormScreen
      title="Crear reto grupal"
      subtitle="Definí una meta compartida. Cada integrante conserva su propia cuenta."
      stepLabel="Paso 1 de 3"
      back="group"
      go={go}
      notify={notify}
      next="group-summary"
      action="Revisar reto"
    >
      <label>
        Nombre del reto
        <input defaultValue="Reto de agosto" />
      </label>
      <label>
        Monto objetivo
        <input type="number" defaultValue="3000" />
      </label>
      <label>
        Integrantes
        <input defaultValue="Carlos, Ana, María" />
      </label>
      <label>
        Frecuencia
        <select defaultValue="semanal">
          <option value="semanal">Semanal</option>
          <option value="quincenal">Quincenal</option>
          <option value="mensual">Mensual</option>
        </select>
      </label>
    </FormScreen>
  );
}

function SummaryScreen({ type, go }: NavProps & { type: SharedType }) {
  const group = type === "group";
  return (
    <div className="app-page">
      <AppHeader
        title={group ? "Resumen del reto" : "Resumen del fondo"}
        onBack={() => go(group ? "group-create" : "family-create")}
      />
      <p className="overline form-step">Paso 2 de 3</p>
      <div className={`summary-hero ${group ? "group" : "family"}`}>
        {group ? <UsersRound /> : <Heart />}
        <span>{group ? "Reto colaborativo" : "Fondo familiar"}</span>
        <h2>{group ? "Reto de agosto" : "Fondo para emergencias"}</h2>
        <p>
          {group
            ? "Q 3,000 · 4 integrantes · semanal"
            : "Q 8,000 · aporte mínimo Q 150"}
        </p>
      </div>
      <div className="summary-list">
        <div>
          <span>Objetivo</span>
          <b>{group ? "Q 3,000" : "Q 8,000"}</b>
        </div>
        <div>
          <span>Participantes</span>
          <b>{group ? "Carlos, Ana, María y vos" : "5 familiares"}</b>
        </div>
        <div>
          <span>{group ? "Frecuencia" : "Aprobación"}</span>
          <b>{group ? "Cada semana" : "3 de 5 votos"}</b>
        </div>
      </div>
      <Primary onClick={() => go(group ? "group-invite" : "family-invite")}>
        Confirmar y continuar
      </Primary>
    </div>
  );
}

function InviteScreen({
  type,
  go,
  notify,
}: NavNotifyProps & { type: SharedType }) {
  const group = type === "group";
  return (
    <div className="app-page">
      <AppHeader
        title={group ? "Invitar al reto" : "Invitar al fondo"}
        onBack={() => go(group ? "group-summary" : "family-summary")}
      />
      <p className="overline form-step">Paso 3 de 3</p>
      <div className="invite-hero">
        <UsersRound />
        <h2>Invitá a quienes querés sumar</h2>
        <p>
          Compartí este enlace. La invitación es simulada y no sale del
          navegador.
        </p>
        <button
          onClick={() => notify("Enlace de invitación copiado localmente.")}
        >
          novu.gt/invitacion/8f31 <span>Copiar</span>
        </button>
      </div>
      <h2 className="list-title">Invitaciones</h2>
      <div className="member-list">
        <div>
          <span>CA</span>
          <b>Carlos</b>
          <small>Aceptó</small>
        </div>
        <div>
          <span>AN</span>
          <b>Ana</b>
          <small>Pendiente</small>
        </div>
        <div>
          <span>MA</span>
          <b>María</b>
          <small>Pendiente</small>
        </div>
      </div>
      <Primary onClick={() => go(group ? "group" : "family")}>
        Ir al plan
      </Primary>
    </div>
  );
}

function MoneyFlow({
  type,
  mode,
  go,
  notify,
}: NavNotifyProps & { type: SharedType; mode: "contribute" | "withdraw" }) {
  const group = type === "group";
  const contribute = mode === "contribute";
  const back = group ? "group" : "family";
  return (
    <FormScreen
      title={
        contribute
          ? group
            ? "Aportar al reto"
            : "Aportar al fondo"
          : group
            ? "Retiro del reto"
            : "Solicitar retiro"
      }
      subtitle={
        contribute
          ? "El aporte se refleja de inmediato en este prototipo."
          : "Contanos por qué necesitás retirar el dinero."
      }
      back={back}
      go={go}
      notify={notify}
      next={back}
      action={contribute ? "Confirmar aporte" : "Enviar solicitud"}
    >
      <label>
        Cuenta
        <select>
          <option>Cuenta Digital G&T · 4382</option>
          <option>Cuenta monetaria · 1590</option>
        </select>
      </label>
      <label>
        Monto
        <input type="number" defaultValue={contribute ? "200" : "600"} />
      </label>
      <label>
        {contribute ? "Descripción" : "Motivo"}
        <textarea
          defaultValue={
            contribute ? "Mi aporte de esta semana" : "Reparación de cocina"
          }
        />
      </label>
    </FormScreen>
  );
}

function HistoryScreen({ type, go }: NavProps & { type: SharedType }) {
  const group = type === "group";
  const rows = group
    ? [
        ["Carlos", "Q 150", "Hoy"],
        ["Ana", "Q 125", "Ayer"],
        ["María", "Q 100", "14 ago"],
        ["Vos", "Q 180", "12 ago"],
      ]
    : [
        ["Luis", "Q 250", "Hoy"],
        ["Vos", "Q 200", "Ayer"],
        ["Marta", "Q 150", "13 ago"],
        ["Elena", "Q 200", "10 ago"],
      ];
  return (
    <div className="app-page">
      <AppHeader
        title={group ? "Historial del reto" : "Historial de aportaciones"}
        onBack={() => go(group ? "group" : "family")}
      />
      <div className="filter-row">
        <button className="active">Este mes</button>
        <button>Todos</button>
        <button>Por miembro</button>
      </div>
      <div className="history-table">
        <div>
          <b>Integrante</b>
          <b>Aporte</b>
          <b>Fecha</b>
        </div>
        {rows.map((row) => (
          <div key={row.join()}>
            <span>{row[0]}</span>
            <strong>{row[1]}</strong>
            <small>{row[2]}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function FamilyCreate({ go, notify }: NavNotifyProps) {
  return (
    <FormScreen
      title="Crear fondo grupal"
      subtitle="Definí reglas claras para aportar y decidir juntos."
      stepLabel="Paso 1 de 3"
      back="family"
      go={go}
      notify={notify}
      next="family-summary"
      action="Revisar fondo"
    >
      <label>
        Nombre del fondo
        <input defaultValue="Fondo para emergencias" />
      </label>
      <label>
        Meta del fondo
        <input type="number" defaultValue="8000" />
      </label>
      <label>
        Aporte mínimo
        <input type="number" defaultValue="150" />
      </label>
      <label>
        Aprobadores
        <select>
          <option>3 de 5 integrantes</option>
          <option>Mayoría simple</option>
          <option>Todos</option>
        </select>
      </label>
      <label>
        Administrador
        <input defaultValue="Diego López" />
      </label>
    </FormScreen>
  );
}

function FamilyRequests({ go }: NavProps) {
  return (
    <div className="app-page">
      <AppHeader title="Solicitudes del fondo" onBack={() => go("family")} />
      <div className="request-card">
        <FileText />
        <div>
          <span>Pendiente · Q 600</span>
          <h2>Reparación de cocina</h2>
          <p>Solicitada por Marta · faltan 2 votos.</p>
        </div>
        <Primary onClick={() => go("family-vote")}>Revisar solicitud</Primary>
      </div>
      <button className="create-request" onClick={() => go("family-withdraw")}>
        <CirclePlus /> Crear solicitud de retiro
      </button>
    </div>
  );
}

function FamilyVote({ go, notify }: NavNotifyProps) {
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  return (
    <div className="app-page">
      <AppHeader title="Votar solicitud" onBack={() => go("family-requests")} />
      <div className="request-detail">
        <span>Solicitud de Marta</span>
        <h2>Reparación de cocina</h2>
        <strong>Q 600</strong>
        <p>
          “La tubería necesita una reparación urgente. Adjunto el presupuesto
          familiar.”
        </p>
        <div>
          <span>2 votos a favor</span>
          <Progress value={40} />
        </div>
      </div>
      <div className="vote-actions large">
        <button
          className={vote === "yes" ? "yes active" : "yes"}
          onClick={() => setVote("yes")}
        >
          <Check /> Aprobar
        </button>
        <button
          className={vote === "no" ? "no active" : "no"}
          onClick={() => setVote("no")}
        >
          Rechazar
        </button>
      </div>
      <Primary
        disabled={!vote}
        onClick={() => {
          notify(
            `Voto ${vote === "yes" ? "aprobado" : "rechazado"} registrado.`,
          );
          go("family-votings");
        }}
      >
        Confirmar voto
      </Primary>
    </div>
  );
}

function FamilyVotings({ go }: NavProps) {
  return (
    <div className="app-page">
      <AppHeader title="Votaciones" onBack={() => go("family")} />
      <div className="request-detail approved">
        <Check />
        <span>Solicitud aprobada</span>
        <h2>Reparación de cocina</h2>
        <strong>Q 600</strong>
        <p>4 de 5 integrantes aprobaron la solicitud.</p>
      </div>
      <Primary onClick={() => go("family-released")}>Liberar el dinero</Primary>
    </div>
  );
}

function MoneyReleased({ go }: NavProps) {
  return (
    <div className="app-page success-page">
      <AppHeader title="Dinero liberado" onBack={() => go("family")} />
      <div className="success-mark">
        <Check />
      </div>
      <h2>Transferencia confirmada</h2>
      <p>Q 600 fueron enviados a la cuenta seleccionada.</p>
      <div className="summary-list">
        <div>
          <span>Saldo restante</span>
          <b>Q 4,250</b>
        </div>
        <div>
          <span>Referencia</span>
          <b>NOVU-0826-41</b>
        </div>
      </div>
      <Primary onClick={() => go("family")}>Volver al fondo</Primary>
    </div>
  );
}

function Rhythm({ go }: NavProps) {
  return (
    <div className="app-page">
      <AppHeader title="Tu ritmo" onBack={() => go("home")} />
      <div className="rhythm-hero">
        <span>Tu racha actual</span>
        <strong>
          4 <small>semanas</small>
        </strong>
        <p>La constancia también es un logro.</p>
      </div>
      <div className="metric-row">
        <div>
          <Award />
          <b>Nivel 4</b>
          <small>Constante</small>
        </div>
        <div>
          <TrendingUp />
          <b>+18%</b>
          <small>vs. julio</small>
        </div>
        <div>
          <Flag />
          <b>2</b>
          <small>metas activas</small>
        </div>
      </div>
      <section className="week-card">
        <h2>Esta semana</h2>
        <p>Completaste tu aporte personal y uno grupal.</p>
        <div>
          {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
            <span className={i < 5 ? "filled" : ""} key={day}>
              {day}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Opportunities({ go, notify }: NavNotifyProps) {
  return (
    <div className="app-page">
      <AppHeader title="Oportunidades" onBack={() => go("home")} />
      <p className="app-subtitle">Beneficios que se activan con tu progreso.</p>
      <div className="opportunity-card">
        <Award />
        <span>Nuevo beneficio</span>
        <h2>Semana sin comisión</h2>
        <p>Habilitaste un beneficio por mantener tu racha de ahorro.</p>
        <Primary
          onClick={() => notify("Beneficio activado de forma simulada.")}
        >
          Activar beneficio
        </Primary>
      </div>
      <div className="locked-card">
        <LockKeyhole />
        <div>
          <b>Próxima oportunidad</b>
          <small>Completá 2 semanas más para desbloquearla.</small>
        </div>
      </div>
    </div>
  );
}

function MenuPage({
  go,
  notify,
  onLogout,
}: NavNotifyProps & { onLogout: () => void }) {
  return (
    <div className="app-page">
      <AppHeader title="Menú" onBack={() => go("home")} />
      <div className="menu-profile">
        <span>D</span>
        <div>
          <b>Diego López</b>
          <small>Cuenta NOVU</small>
        </div>
      </div>
      <section className="action-list">
        <button onClick={() => go("kyc")}>
          <ShieldCheck />
          <span>
            <b>Verificación</b>
            <small>Revisá el estado de tu cuenta</small>
          </span>
          <ChevronRight />
        </button>
        <button
          onClick={() => notify("Tus ajustes se actualizaron localmente.")}
        >
          <WalletCards />
          <span>
            <b>Cuentas y aportes</b>
            <small>Gestioná tus métodos de aporte</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={onLogout}>
          <ArrowLeft />
          <span>
            <b>Cerrar sesión</b>
            <small>Salir de tu cuenta en este dispositivo</small>
          </span>
          <ChevronRight />
        </button>
      </section>
    </div>
  );
}

const webNavSections: Array<{
  label: string;
  items: [string, string, LucideIcon][];
}> = [
  {
    label: "Tu espacio",
    items: [
      ["home", "Resumen", Home],
      ["metas", "Mis metas", Target],
      ["copiloto", "Copiloto NOVU", MessageCircle],
      ["ritmo", "Mi ritmo", TrendingUp],
      ["opportunities", "Oportunidades", Award],
    ],
  },
  {
    label: "Ahorro compartido",
    items: [
      ["group", "Retos grupales", UsersRound],
      ["family", "Fondo familiar", Heart],
    ],
  },
];

const pageLabels: Record<string, string> = {
  home: "Resumen",
  inicio: "Resumen",
  metas: "Mis metas",
  "personal-create": "Nueva meta personal",
  copiloto: "Copiloto NOVU",
  ritmo: "Mi ritmo",
  opportunities: "Oportunidades",
  group: "Reto grupal",
  "group-create": "Crear reto grupal",
  "group-summary": "Resumen del reto",
  "group-invite": "Invitar al reto",
  "group-contribute": "Aportar al reto",
  "group-withdraw": "Retirar del reto",
  "group-history": "Historial del reto",
  family: "Fondo familiar",
  "family-create": "Crear fondo grupal",
  "family-summary": "Resumen del fondo",
  "family-invite": "Invitar al fondo",
  "family-contribute": "Aportar al fondo",
  "family-withdraw": "Solicitar retiro",
  "family-history": "Historial del fondo",
  "family-requests": "Solicitudes",
  "family-vote": "Votar solicitud",
  "family-votings": "Votaciones",
  "family-released": "Dinero liberado",
  menu: "Cuenta y configuración",
  "personal-withdraw": "Retiro personal",
};

function AppNav({
  page,
  go,
  collapsed,
  open,
  onToggle,
  onClose,
  exit,
}: {
  page: string;
  go: Go;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  exit: () => void;
}) {
  const isActive = (id: string) =>
    id === "home"
      ? ["home", "inicio"].includes(page)
      : id === "group" || id === "family"
        ? page.startsWith(id)
        : id === "metas"
          ? page === "metas" || page.startsWith("personal-")
          : page === id;

  return (
    <aside
      className={`web-sidebar ${collapsed ? "collapsed" : ""} ${open ? "open" : ""}`}
      id="novu-navigation"
      aria-label="Navegación principal"
    >
      <div className="sidebar-brand">
        <Logo />
        <span className="sidebar-brand-copy">
          <b>NOVU</b>
          <small>Tu futuro, a tu ritmo</small>
        </span>
        <button
          className="sidebar-collapse"
          onClick={onToggle}
          aria-controls="novu-navigation"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir navegación" : "Contraer navegación"}
          title={collapsed ? "Expandir navegación" : "Contraer navegación"}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
        <button
          className="sidebar-mobile-close"
          onClick={onClose}
          aria-label="Cerrar navegación"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      <nav className="sidebar-links">
        {webNavSections.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <p>{section.label}</p>
            {section.items.map(([id, label, Icon]) => (
              <button
                key={id}
                className={isActive(id) ? "active" : ""}
                onClick={() => go(id)}
                title={collapsed ? label : undefined}
                aria-current={isActive(id) ? "page" : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          className={
            page === "menu" ? "sidebar-account active" : "sidebar-account"
          }
          onClick={() => go("menu")}
          title={collapsed ? "Cuenta y configuración" : undefined}
        >
          <span className="sidebar-avatar">D</span>
          <span>
            <b>Diego López</b>
            <small>Cuenta NOVU</small>
          </span>
          <ChevronRight size={17} />
        </button>
        <button
          className="sidebar-exit"
          onClick={exit}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <ArrowLeft size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default function NovuApp({ exit }: { exit: () => void }) {
  const { authenticated, loading, error, login, register, logout } = useAuth();
  const [page, setPage] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("page") || "welcome"
      : "welcome",
  );
  const [toast, setToast] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const [registrationMedia, setRegistrationMedia] = useState<
    Partial<Record<CaptureSlot, CapturedMedia>>
  >({});
  const registrationMediaRef = useRef(registrationMedia);
  const [registrationContact, setRegistrationContact] =
    useState<RegistrationContact>({
      phone: "5512 3456",
      email: "vos@correo.com",
      password: "novu2026",
      passwordConfirmation: "novu2026",
    });
  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] =
    usePersistentBoolean(SIDEBAR_STORAGE_KEY);
  const notify: Notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  };
  const go: Go = (next) => {
    if (next === "landing") {
      exit();
      return;
    }
    setPage(next);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const complete = (label: string) =>
    setCompleted((items) =>
      items.includes(label) ? items : [...items, label],
    );
  const handleLogin = (identifier: string, password: string) =>
    login({ identifier, password });
  const handleBiometricLogin = () =>
    login({ identifier: "diego@correo.com", password: "biometric-demo" });
  const handleRegistration = async () => {
    const success = await register({
      contact: registrationContact,
      media: Object.fromEntries(
        Object.entries(registrationMedia).map(([slot, item]) => [
          slot,
          item.file,
        ]),
      ),
    });
    if (success) go("home");
  };
  const handleLogout = async () => {
    await logout();
    setCompleted([]);
    setPage("welcome");
    setNavOpen(false);
  };
  const captureMedia = (
    slot: CaptureSlot,
    file: File,
    source: "camera" | "upload",
  ) => {
    setRegistrationMedia((items) => {
      if (items[slot]) URL.revokeObjectURL(items[slot].previewUrl);
      const next = {
        ...items,
        [slot]: { file, source, previewUrl: URL.createObjectURL(file) },
      };
      registrationMediaRef.current = next;
      return next;
    });
  };
  useEffect(
    () => () => {
      Object.values(registrationMediaRef.current).forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
    },
    [],
  );
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  const currentPage =
    authenticated && ["welcome", "login"].includes(page) ? "home" : page;
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [currentPage]);
  const screens: Record<string, ReactNode> = {
    welcome: <Welcome go={go} />,
    login: (
      <Login go={go} onLogin={handleLogin} loading={loading} error={error} />
    ),
    wizard: <Wizard go={go} notify={notify} />,
    "bio-fingerprint": (
      <BiometricScan
        type="fingerprint"
        go={go}
        onVerify={handleBiometricLogin}
      />
    ),
    "bio-face": (
      <BiometricScan type="face" go={go} onVerify={handleBiometricLogin} />
    ),
    "bio-faceid": (
      <BiometricScan type="faceid" go={go} onVerify={handleBiometricLogin} />
    ),
    kyc: (
      <Kyc
        go={go}
        completed={completed}
        onFinish={handleRegistration}
        loading={loading}
        error={error}
      />
    ),
    "dpi-front": (
      <CaptureScreen
        kind="dpi"
        side="frente"
        slot="dpiFront"
        go={go}
        back="kyc"
        next="dpi-back"
        onCapture={captureMedia}
      />
    ),
    "dpi-back": (
      <CaptureScreen
        kind="dpi"
        side="reverso"
        slot="dpiBack"
        go={go}
        back="dpi-front"
        next="dpi-review"
        onCapture={captureMedia}
      />
    ),
    "dpi-review": (
      <ReviewCapture
        kind="dpi"
        go={go}
        accept="kyc"
        retake="dpi-front"
        complete={() => complete("DPI")}
        requiredCount={2}
        media={[registrationMedia.dpiFront, registrationMedia.dpiBack].filter(
          (item): item is CapturedMedia => Boolean(item),
        )}
      />
    ),
    "selfie-capture": (
      <CaptureScreen
        kind="selfie"
        slot="selfie"
        go={go}
        back="kyc"
        next="selfie-review"
        onCapture={captureMedia}
      />
    ),
    "selfie-review": (
      <ReviewCapture
        kind="selfie"
        go={go}
        accept="kyc"
        retake="selfie-capture"
        complete={() => complete("Selfie")}
        media={registrationMedia.selfie ? [registrationMedia.selfie] : []}
      />
    ),
    contact: (
      <ContactForm
        go={go}
        complete={() => complete("Contacto y contraseña")}
        values={registrationContact}
        onChange={setRegistrationContact}
      />
    ),
    "proof-capture": (
      <CaptureScreen
        kind="proof"
        slot="proof"
        go={go}
        back="kyc"
        next="proof-review"
        onCapture={captureMedia}
      />
    ),
    "proof-review": (
      <ReviewCapture
        kind="proof"
        go={go}
        accept="kyc"
        retake="proof-capture"
        complete={() => complete("Comprobante de domicilio")}
        media={registrationMedia.proof ? [registrationMedia.proof] : []}
      />
    ),
    home: <Dashboard go={go} notify={notify} />,
    inicio: <Dashboard go={go} notify={notify} />,
    metas: <Goals go={go} notify={notify} />,
    "personal-create": <Wizard go={go} notify={notify} newGoal />,
    "personal-withdraw": <PersonalWithdraw go={go} notify={notify} />,
    copiloto: <Copilot go={go} notify={notify} />,
    ritmo: <Rhythm go={go} />,
    opportunities: <Opportunities go={go} notify={notify} />,
    group: <Group go={go} />,
    "group-create": <GroupCreate go={go} notify={notify} />,
    "group-summary": <SummaryScreen type="group" go={go} />,
    "group-invite": <InviteScreen type="group" go={go} notify={notify} />,
    "group-contribute": (
      <MoneyFlow type="group" mode="contribute" go={go} notify={notify} />
    ),
    "group-withdraw": (
      <MoneyFlow type="group" mode="withdraw" go={go} notify={notify} />
    ),
    "group-history": <HistoryScreen type="group" go={go} />,
    family: <Family go={go} />,
    "family-create": <FamilyCreate go={go} notify={notify} />,
    "family-summary": <SummaryScreen type="family" go={go} />,
    "family-invite": <InviteScreen type="family" go={go} notify={notify} />,
    "family-contribute": (
      <MoneyFlow type="family" mode="contribute" go={go} notify={notify} />
    ),
    "family-withdraw": (
      <MoneyFlow type="family" mode="withdraw" go={go} notify={notify} />
    ),
    "family-history": <HistoryScreen type="family" go={go} />,
    "family-requests": <FamilyRequests go={go} />,
    "family-vote": <FamilyVote go={go} notify={notify} />,
    "family-votings": <FamilyVotings go={go} />,
    "family-released": <MoneyReleased go={go} />,
    menu: <MenuPage go={go} notify={notify} onLogout={handleLogout} />,
  };
  const showNav = ![
    "welcome",
    "login",
    "wizard",
    "kyc",
    "bio-fingerprint",
    "bio-face",
    "bio-faceid",
    "dpi-front",
    "dpi-back",
    "dpi-review",
    "selfie-capture",
    "selfie-review",
    "contact",
    "proof-capture",
    "proof-review",
  ].includes(currentPage);
  return (
    <div
      className={`novu-app ${showNav ? "has-web-shell" : "focus-shell"} ${navCollapsed ? "nav-is-collapsed" : ""}`}
    >
      {showNav && (
        <AppNav
          page={currentPage}
          go={go}
          collapsed={navCollapsed}
          open={navOpen}
          onToggle={() => setNavCollapsed((value) => !value)}
          onClose={() => setNavOpen(false)}
          exit={handleLogout}
        />
      )}
      {showNav && (
        <button
          className={`sidebar-scrim ${navOpen ? "visible" : ""}`}
          onClick={() => setNavOpen(false)}
          aria-label="Cerrar navegación"
          tabIndex={navOpen ? 0 : -1}
        ></button>
      )}
      <div className="web-app-frame">
        {showNav ? (
          <header className="app-topbar">
            <div className="topbar-title-group">
              <button
                className="mobile-menu-toggle"
                onClick={() => setNavOpen(true)}
                aria-label="Abrir navegación"
                aria-controls="novu-navigation"
                aria-expanded={navOpen}
              >
                <Menu size={21} />
              </button>
              <div>
                <span>Espacio personal</span>
                <strong>{pageLabels[currentPage] || "NOVU"}</strong>
              </div>
            </div>
            <div className="topbar-actions">
              <span className="demo-status">
                <i></i> Demo local · sin backend
              </span>
              <button
                className="topbar-icon"
                onClick={() => notify("No tenés notificaciones nuevas.")}
                aria-label="Ver notificaciones"
              >
                <Bell size={19} />
              </button>
              <button className="topbar-profile" onClick={() => go("menu")}>
                <span>D</span>
                <span>
                  <b>Diego</b>
                  <small>Mi cuenta</small>
                </span>
              </button>
            </div>
          </header>
        ) : (
          <header className="app-topbar focus-topbar">
            <button className="focus-back" onClick={exit}>
              <ArrowLeft size={17} /> Volver a la landing
            </button>
            <span className="demo-status">
              <i></i> Prototipo local · sin backend
            </span>
          </header>
        )}
        <main
          className="app-workspace"
          id="app-main"
          ref={mainRef}
          tabIndex={-1}
        >
          <div className="route-frame" key={currentPage}>
            {screens[currentPage] || screens.home}
          </div>
        </main>
      </div>
      {toast && (
        <div className="app-toast" role="status" aria-live="polite">
          <Check size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
