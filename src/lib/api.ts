import { novuOverview } from "@/data/novu";
import type {
  ApiRequest,
  ApiResponse,
  ApiTransport,
  NovuOverview,
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

    throw new ApiError(`Mock no implementado: ${method} ${path}`, 501);
  },
};

export function createNovuApi(transport: ApiTransport = mockTransport) {
  return {
    getOverview: () =>
      transport.request<NovuOverview>({ method: "GET", path: "/v1/overview" }),
  };
}

export const novuApi = createNovuApi();
