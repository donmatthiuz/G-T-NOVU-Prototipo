import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NovuApp from "@/components/NovuApp";
import { novuApi } from "@/lib/api";
import type { CopilotConversation, CopilotMessage } from "@/types/novu";

const conversation = (id: string, title: string): CopilotConversation => ({
  id,
  title,
  contextType: "general",
  entityId: null,
  messageCount: 3,
  lastMessageAt: "2026-10-26T12:00:00Z",
});
const message = (id: string, content: string): CopilotMessage => ({
  id,
  content,
  sender: "assistant",
  kind: "text",
  createdAt: "2026-10-26T12:00:00Z",
});
const recent = conversation("recent", "Mi meta del viaje");
const older = conversation("older", "Mi fondo de emergencia");

describe("historial del Copiloto", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/?page=copiloto");
    window.localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(novuApi, "listCopilotConversations").mockResolvedValue({
      status: 200,
      data: [recent, older],
    });
    vi.spyOn(novuApi, "getCopilotMessages").mockImplementation(async (id) => ({
      status: 200,
      data: {
        items: [message(`message-${id}`, `Respuesta de ${id}`)],
        nextCursor: null,
      },
    }));
    vi.spyOn(novuApi, "createCopilotConversation").mockResolvedValue({
      status: 201,
      data: { ...conversation("new", "Nueva conversación"), messageCount: 1 },
    });
  });

  it("abre la más reciente y permite retomar otra sin mezclar mensajes ni borradores", async () => {
    render(<NovuApp exit={vi.fn()} />);
    await screen.findByText("Respuesta de recent");
    expect(novuApi.createCopilotConversation).not.toHaveBeenCalled();
    const input = screen.getByLabelText("Escribí un mensaje para NOVU");
    fireEvent.change(input, { target: { value: "Borrador de viaje" } });
    fireEvent.click(screen.getByRole("button", { name: "Historial" }));
    const history = screen.getByRole("navigation", {
      name: "Conversaciones anteriores",
    });
    expect(
      within(history).getByRole("button", { name: /Mi meta del viaje/ }),
    ).toHaveAttribute("aria-current", "true");
    fireEvent.click(
      within(history).getByRole("button", { name: /Mi fondo de emergencia/ }),
    );
    await screen.findByText("Respuesta de older");
    expect(screen.queryByText("Respuesta de recent")).toBeNull();
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Historial" }));
    fireEvent.click(screen.getByRole("button", { name: /Mi meta del viaje/ }));
    await screen.findByText("Respuesta de recent");
    expect(input).toHaveValue("Borrador de viaje");
  });

  it("crea una conversación independiente, envía en ella y conserva las anteriores", async () => {
    vi.spyOn(novuApi, "sendCopilotMessage").mockResolvedValue({
      status: 200,
      data: {
        userMessage: {
          ...message("user-new", "Quiero ahorrar para estudiar"),
          sender: "user",
        },
        assistantMessage: message("answer-new", "Revisemos tu nueva meta."),
        duplicated: false,
      },
    });
    render(<NovuApp exit={vi.fn()} />);
    await screen.findByText("Respuesta de recent");
    fireEvent.click(screen.getByRole("button", { name: "Nueva conversación" }));
    await screen.findByText("Respuesta de new");
    expect(novuApi.createCopilotConversation).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Respuesta de recent")).toBeNull();
    fireEvent.change(screen.getByLabelText("Escribí un mensaje para NOVU"), {
      target: { value: "Quiero ahorrar para estudiar" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    await screen.findByText("Revisemos tu nueva meta.");
    expect(novuApi.sendCopilotMessage).toHaveBeenCalledWith(
      "new",
      "Quiero ahorrar para estudiar",
      expect.any(String),
    );
    fireEvent.click(screen.getByRole("button", { name: "Historial" }));
    const history = screen.getByRole("navigation", {
      name: "Conversaciones anteriores",
    });
    expect(within(history).getAllByRole("button")).toHaveLength(3);
    expect(
      within(history).getByRole("button", {
        name: /Quiero ahorrar para estudiar/,
      }),
    ).toHaveAttribute("aria-current", "true");
    fireEvent.click(
      within(history).getByRole("button", { name: /Mi fondo de emergencia/ }),
    );
    await screen.findByText("Respuesta de older");
  });

  it("recupera historial al volver a entrar sin crear otra conversación", async () => {
    const first = render(<NovuApp exit={vi.fn()} />);
    await screen.findByText("Respuesta de recent");
    first.unmount();
    render(<NovuApp exit={vi.fn()} />);
    await screen.findByText("Respuesta de recent");
    expect(novuApi.listCopilotConversations).toHaveBeenCalledTimes(2);
    expect(novuApi.createCopilotConversation).not.toHaveBeenCalled();
  });

  it("carga mensajes anteriores con su cursor y mantiene el orden", async () => {
    vi.mocked(novuApi.getCopilotMessages)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          items: [message("last", "Mensaje reciente")],
          nextCursor: "cursor-old",
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          items: [message("first", "Mensaje más antiguo")],
          nextCursor: null,
        },
      });
    render(<NovuApp exit={vi.fn()} />);
    await screen.findByText("Mensaje reciente");
    fireEvent.click(
      screen.getByRole("button", { name: "Ver mensajes anteriores" }),
    );
    await screen.findByText("Mensaje más antiguo");
    expect(novuApi.getCopilotMessages).toHaveBeenLastCalledWith(
      "recent",
      "cursor-old",
    );
    const contents = within(screen.getByRole("log"))
      .getAllByRole("paragraph")
      .map((item) => item.textContent);
    expect(contents).toEqual(["Mensaje más antiguo", "Mensaje reciente"]);
    expect(
      screen.queryByRole("button", { name: "Ver mensajes anteriores" }),
    ).toBeNull();
  });

  it("permite ver conversaciones de páginas anteriores", async () => {
    vi.mocked(novuApi.listCopilotConversations)
      .mockResolvedValueOnce({
        status: 200,
        data: [
          recent,
          ...Array.from({ length: 19 }, (_, i) =>
            conversation(`old-${i}`, `Consulta ${i}`),
          ),
        ],
      })
      .mockResolvedValueOnce({ status: 200, data: [older] });
    render(<NovuApp exit={vi.fn()} />);
    await screen.findByText("Respuesta de recent");
    fireEvent.click(screen.getByRole("button", { name: "Historial" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Ver más conversaciones" }),
    );
    await screen.findByRole("button", { name: /Mi fondo de emergencia/ });
    expect(novuApi.listCopilotConversations).toHaveBeenLastCalledWith(2);
    expect(
      screen.queryByRole("button", { name: "Ver más conversaciones" }),
    ).toBeNull();
  });

  it("conserva el chat actual si falla una nueva conversación", async () => {
    vi.mocked(novuApi.createCopilotConversation).mockRejectedValueOnce(
      new Error("No se pudo crear."),
    );
    render(<NovuApp exit={vi.fn()} />);
    await screen.findByText("Respuesta de recent");
    fireEvent.click(screen.getByRole("button", { name: "Nueva conversación" }));
    await screen.findByRole("alert");
    expect(screen.getByText("Respuesta de recent")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Nueva conversación" }),
      ).toBeEnabled(),
    );
  });

  it("permite reintentar una carga inicial fallida", async () => {
    vi.mocked(novuApi.listCopilotConversations).mockRejectedValueOnce(
      new Error("Sin conexión."),
    );
    render(<NovuApp exit={vi.fn()} />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Reintentar carga" }),
    );
    await screen.findByText("Respuesta de recent");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
