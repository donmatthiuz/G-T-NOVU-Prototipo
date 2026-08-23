import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NovuApp from "@/components/NovuApp";
import { novuApi } from "@/lib/api";
import type { CopilotTurn } from "@/types/novu";

describe("estado de espera del Copiloto", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/?page=copiloto");
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("muestra tres burbujas mientras NOVU prepara la respuesta", async () => {
    vi.spyOn(novuApi, "createCopilotConversation").mockResolvedValue({
      status: 201,
      data: {
        id: "conversation-1",
        title: "Mi orientación financiera",
        contextType: "general",
        entityId: null,
        messageCount: 1,
        lastMessageAt: new Date().toISOString(),
      },
    });
    vi.spyOn(novuApi, "getCopilotMessages").mockResolvedValue({
      status: 200,
      data: {
        items: [
          {
            id: "welcome-1",
            sender: "assistant",
            content: "¿Qué querés revisar hoy?",
            kind: "text",
            createdAt: new Date().toISOString(),
          },
        ],
        nextCursor: null,
      },
    });

    let completeTurn!: (value: { data: CopilotTurn; status: number }) => void;
    vi.spyOn(novuApi, "sendCopilotMessage").mockImplementation(
      () =>
        new Promise((resolve) => {
          completeTurn = resolve;
        }),
    );

    const { container } = render(<NovuApp exit={vi.fn()} />);
    await screen.findByText("¿Qué querés revisar hoy?");

    fireEvent.change(screen.getByLabelText("Escribí un mensaje para NOVU"), {
      target: { value: "¿Cómo voy?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    expect(
      await screen.findByRole("status", { name: "NOVU está pensando" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".typing-dot")).toHaveLength(3);
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true");

    completeTurn({
      status: 200,
      data: {
        userMessage: {
          id: "user-1",
          sender: "user",
          content: "¿Cómo voy?",
          kind: "text",
          createdAt: new Date().toISOString(),
        },
        assistantMessage: {
          id: "assistant-1",
          sender: "assistant",
          content: "Vas avanzando bien.",
          kind: "recommendation",
          createdAt: new Date().toISOString(),
        },
        duplicated: false,
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("status", { name: "NOVU está pensando" }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "false");
  });
});
