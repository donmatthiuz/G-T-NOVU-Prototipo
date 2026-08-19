import { novuOverview } from "@/data/novu";
import type {
  ApiRequest,
  ApiResponse,
  ApiTransport,
  AuthSession,
  LoginCredentials,
  NovuOverview,
  RegistrationSubmission,
} from "@/types/novu";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const demoUser = {
  id: "user-diego",
  firstName: "Diego",
  fullName: "Diego López",
  email: "diego@correo.com",
};

function createDemoSession(email = demoUser.email): AuthSession {
  return {
    accessToken: `demo-${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user: { ...demoUser, email },
  };
}

/**
 * Contrato intercambiable. Hoy responde con datos locales; cuando exista
 * FastAPI solo se reemplaza este transporte por uno basado en fetch.
 */
export const mockTransport: ApiTransport = {
  async request<TData>({
    method,
    path,
  }: ApiRequest): Promise<ApiResponse<TData>> {
    if (method === "GET" && path === "/v1/overview") {
      return { data: structuredClone(novuOverview) as TData, status: 200 };
    }

    if (method === "POST" && path === "/v1/auth/login") {
      return { data: createDemoSession() as TData, status: 200 };
    }

    if (method === "POST" && path === "/v1/auth/register") {
      return { data: createDemoSession() as TData, status: 201 };
    }

    if (method === "POST" && path === "/v1/auth/logout") {
      return { data: undefined as TData, status: 204 };
    }

    throw new ApiError(`Mock no implementado: ${method} ${path}`, 501);
  },
};

export function createFetchTransport({
  baseUrl,
  getAccessToken,
}: {
  baseUrl: string;
  getAccessToken?: () => string | null;
}): ApiTransport {
  return {
    async request<TData, TBody = unknown>({
      method,
      path,
      body,
    }: ApiRequest<TBody>): Promise<ApiResponse<TData>> {
      const multipart = body instanceof FormData;
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          ...(!multipart && body ? { "Content-Type": "application/json" } : {}),
          ...(getAccessToken?.()
            ? { Authorization: `Bearer ${getAccessToken?.()}` }
            : {}),
        },
        body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
      });

      const data = response.status === 204 ? undefined : await response.json();
      if (!response.ok) {
        const message =
          typeof data?.detail === "string"
            ? data.detail
            : "La solicitud a NOVU no pudo completarse.";
        throw new ApiError(message, response.status);
      }
      return { data: data as TData, status: response.status };
    },
  };
}

export function createRegistrationFormData({
  contact,
  savingsCapacity,
  media,
}: RegistrationSubmission): FormData {
  const form = new FormData();
  form.append(
    "contact",
    JSON.stringify({
      phone: contact.phone,
      email: contact.email,
      password: contact.password,
    }),
  );
  form.append("savings_capacity", JSON.stringify(savingsCapacity));
  Object.entries(media).forEach(([slot, file]) => {
    if (file) form.append(slot, file, file.name);
  });
  return form;
}

export function createNovuApi(transport: ApiTransport = mockTransport) {
  return {
    getOverview: () =>
      transport.request<NovuOverview>({ method: "GET", path: "/v1/overview" }),
    login: (credentials: LoginCredentials) =>
      transport.request<AuthSession, LoginCredentials>({
        method: "POST",
        path: "/v1/auth/login",
        body: credentials,
      }),
    register: (submission: RegistrationSubmission) =>
      transport.request<AuthSession, FormData>({
        method: "POST",
        path: "/v1/auth/register",
        body: createRegistrationFormData(submission),
      }),
    logout: () =>
      transport.request<void>({ method: "POST", path: "/v1/auth/logout" }),
  };
}

export const novuApi = createNovuApi();
