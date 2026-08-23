import { novuOverview } from "@/data/novu";
import type {
  ApiRequest,
  ApiResponse,
  ApiTransport,
  AuthSession,
  ContributionCreate,
  ContributionCreateResponse,
  ContributionItem,
  ContributionPage,
  CopilotConversation,
  CopilotMessagePage,
  CopilotTurn,
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

let mockOverviewState = structuredClone(novuOverview);
const initialMockContributions: Record<string, ContributionItem[]> = {
  "66c000000000000000000002": [],
  "66c000000000000000000003": [
    {
      id: "group-1",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000003",
      memberName: "Carlos",
      description: "Aporte semanal",
      amount: 150,
      amountLabel: "Q 150",
      dateLabel: "Hoy",
      occurredAt: "2026-08-23T12:00:00Z",
      currentMonth: true,
      status: "posted",
    },
    {
      id: "group-2",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000003",
      memberName: "Ana",
      description: "Aporte semanal",
      amount: 125,
      amountLabel: "Q 125",
      dateLabel: "Ayer",
      occurredAt: "2026-08-22T12:00:00Z",
      currentMonth: true,
      status: "posted",
    },
    {
      id: "group-3",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000003",
      memberName: "María",
      description: "Aporte semanal",
      amount: 100,
      amountLabel: "Q 100",
      dateLabel: "14 ago",
      occurredAt: "2026-08-14T12:00:00Z",
      currentMonth: true,
      status: "posted",
    },
    {
      id: "group-4",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000003",
      memberName: "Vos",
      description: "Mi aporte semanal",
      amount: 180,
      amountLabel: "Q 180",
      dateLabel: "12 ago",
      occurredAt: "2026-08-12T12:00:00Z",
      currentMonth: true,
      status: "posted",
    },
    {
      id: "group-5",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000003",
      memberName: "Carlos",
      description: "Aporte semanal",
      amount: 120,
      amountLabel: "Q 120",
      dateLabel: "28 jul",
      occurredAt: "2026-07-28T12:00:00Z",
      currentMonth: false,
      status: "posted",
    },
    {
      id: "group-6",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000003",
      memberName: "Vos",
      description: "Mi aporte semanal",
      amount: 150,
      amountLabel: "Q 150",
      dateLabel: "21 jul",
      occurredAt: "2026-07-21T12:00:00Z",
      currentMonth: false,
      status: "posted",
    },
  ],
  "66c000000000000000000004": [
    {
      id: "family-1",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000004",
      memberName: "Luis",
      description: "Aporte al fondo",
      amount: 250,
      amountLabel: "Q 250",
      dateLabel: "Hoy",
      occurredAt: "2026-08-23T12:00:00Z",
      currentMonth: true,
      status: "posted",
    },
    {
      id: "family-2",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000004",
      memberName: "Vos",
      description: "Mi aporte familiar",
      amount: 200,
      amountLabel: "Q 200",
      dateLabel: "Ayer",
      occurredAt: "2026-08-22T12:00:00Z",
      currentMonth: true,
      status: "posted",
    },
    {
      id: "family-3",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000004",
      memberName: "Marta",
      description: "Aporte al fondo",
      amount: 150,
      amountLabel: "Q 150",
      dateLabel: "13 ago",
      occurredAt: "2026-08-13T12:00:00Z",
      currentMonth: true,
      status: "posted",
    },
    {
      id: "family-4",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000004",
      memberName: "Elena",
      description: "Aporte al fondo",
      amount: 200,
      amountLabel: "Q 200",
      dateLabel: "10 ago",
      occurredAt: "2026-08-10T12:00:00Z",
      currentMonth: true,
      status: "posted",
    },
    {
      id: "family-5",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000004",
      memberName: "Luis",
      description: "Aporte al fondo",
      amount: 180,
      amountLabel: "Q 180",
      dateLabel: "29 jul",
      occurredAt: "2026-07-29T12:00:00Z",
      currentMonth: false,
      status: "posted",
    },
    {
      id: "family-6",
      destinationType: "shared_plan",
      destinationId: "66c000000000000000000004",
      memberName: "Vos",
      description: "Mi aporte familiar",
      amount: 150,
      amountLabel: "Q 150",
      dateLabel: "18 jul",
      occurredAt: "2026-07-18T12:00:00Z",
      currentMonth: false,
      status: "posted",
    },
  ],
};
let mockContributions = structuredClone(initialMockContributions);

export function resetMockApiState(): void {
  mockOverviewState = structuredClone(novuOverview);
  mockContributions = structuredClone(initialMockContributions);
}

function createDemoSession(email = demoUser.email): AuthSession {
  return {
    accessToken: `demo-${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user: { ...demoUser, email },
  };
}

/** Transporte en memoria utilizado únicamente por las pruebas automatizadas. */
export const mockTransport: ApiTransport = {
  async request<TData>({
    method,
    path,
    body,
  }: ApiRequest): Promise<ApiResponse<TData>> {
    if (method === "GET" && path === "/v1/overview") {
      return { data: structuredClone(mockOverviewState) as TData, status: 200 };
    }

    if (method === "GET" && path.startsWith("/v1/contributions?")) {
      const query = new URL(path, "http://novu.test").searchParams;
      const destinationId = query.get("destinationId") || "";
      return {
        data: {
          items: structuredClone(mockContributions[destinationId] || []),
        } as TData,
        status: 200,
      };
    }

    if (method === "POST" && path === "/v1/contributions") {
      const payload = body as ContributionCreate | undefined;
      if (!payload) throw new ApiError("El aporte no contiene datos.", 422);
      const amount = Math.round(payload.amountMinor / 100);
      const item: ContributionItem = {
        id: payload.clientContributionId,
        destinationType: payload.destinationType,
        destinationId: payload.destinationId,
        memberName: "Vos",
        description: payload.description,
        amount,
        amountLabel: `Q ${amount.toLocaleString("es-GT")}`,
        dateLabel: "Hoy",
        occurredAt: new Date().toISOString(),
        currentMonth: true,
        status: "posted",
      };
      mockContributions[payload.destinationId] = [
        item,
        ...(mockContributions[payload.destinationId] || []),
      ];
      let updatedBalanceAmount = amount;
      if (payload.destinationType === "goal") {
        mockOverviewState.personalGoal.savedAmount += amount;
        mockOverviewState.personalGoal.progress = Math.min(
          100,
          Math.round(
            (mockOverviewState.personalGoal.savedAmount * 100) /
              mockOverviewState.personalGoal.targetAmount,
          ),
        );
        updatedBalanceAmount = mockOverviewState.personalGoal.savedAmount;
        const activity = {
          id: item.id,
          name: item.description,
          dateLabel: item.dateLabel,
          amountLabel: `+ ${item.amountLabel}`,
          amount: item.amount,
          type: "contribution" as const,
          tone: "success" as const,
        };
        mockOverviewState.recentActivity = [
          activity,
          ...mockOverviewState.recentActivity,
        ].slice(0, 3);
        mockOverviewState.activityHistory = [
          activity,
          ...mockOverviewState.activityHistory,
        ];
      } else {
        const plan = mockOverviewState.sharedPlans?.find(
          (candidate) => candidate.id === payload.destinationId,
        );
        if (plan) {
          plan.balanceAmount += amount;
          updatedBalanceAmount = plan.balanceAmount;
        }
      }
      const target =
        payload.destinationType === "goal"
          ? mockOverviewState.personalGoal.targetAmount
          : mockOverviewState.sharedPlans?.find(
              (candidate) => candidate.id === payload.destinationId,
            )?.targetAmount || updatedBalanceAmount;
      return {
        data: {
          contribution: item,
          updatedBalanceAmount,
          updatedProgress: Math.min(
            100,
            Math.round((updatedBalanceAmount * 100) / Math.max(target, 1)),
          ),
          duplicated: false,
        } as TData,
        status: 201,
      };
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

      const data =
        response.status === 204
          ? undefined
          : await response.json().catch(() => undefined);
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
    getContributions: (
      destinationType: ContributionCreate["destinationType"],
      destinationId: string,
    ) =>
      transport.request<ContributionPage>({
        method: "GET",
        path: `/v1/contributions?destinationType=${encodeURIComponent(destinationType)}&destinationId=${encodeURIComponent(destinationId)}`,
      }),
    createContribution: (contribution: ContributionCreate) =>
      transport.request<ContributionCreateResponse, ContributionCreate>({
        method: "POST",
        path: "/v1/contributions",
        body: contribution,
      }),
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
    createCopilotConversation: () =>
      transport.request<CopilotConversation, { contextType: "general" }>({
        method: "POST",
        path: "/v1/copilot/conversations",
        body: { contextType: "general" },
      }),
    getCopilotMessages: (conversationId: string) =>
      transport.request<CopilotMessagePage>({
        method: "GET",
        path: `/v1/copilot/conversations/${conversationId}/messages?limit=50`,
      }),
    sendCopilotMessage: (
      conversationId: string,
      content: string,
      clientMessageId: string,
    ) =>
      transport.request<
        CopilotTurn,
        { content: string; clientMessageId: string }
      >({
        method: "POST",
        path: `/v1/copilot/conversations/${conversationId}/messages`,
        body: { content, clientMessageId },
      }),
  };
}

function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("novu.auth.session.v1");
    return raw ? (JSON.parse(raw)?.accessToken ?? null) : null;
  } catch {
    return null;
  }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const defaultTransport =
  process.env.NODE_ENV === "test"
    ? mockTransport
    : createFetchTransport({
        baseUrl: apiUrl,
        getAccessToken: readAccessToken,
      });

export const novuApi = createNovuApi(defaultTransport);
