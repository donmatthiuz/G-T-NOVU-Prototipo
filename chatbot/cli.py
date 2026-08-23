import asyncio

from .config import ChatbotConfigurationError
from .models import ChatRequest
from .service import ChatbotServiceError, get_chat_service


async def main() -> None:
    try:
        service = get_chat_service()
    except ChatbotConfigurationError as error:
        print(f"Configuración incompleta: {error}")
        return

    previous_response_id: str | None = None
    print("NOVU está listo. Escribí 'salir' para terminar.\n")

    while True:
        message = input("Vos: ").strip()
        if message.lower() in {"salir", "exit", "quit"}:
            break
        if not message:
            continue

        try:
            response = await service.reply(
                ChatRequest(
                    message=message,
                    previous_response_id=previous_response_id,
                )
            )
        except ChatbotServiceError as error:
            print(f"NOVU: {error}\n")
            continue

        previous_response_id = response.response_id
        print(f"NOVU: {response.message}\n")


if __name__ == "__main__":
    asyncio.run(main())
