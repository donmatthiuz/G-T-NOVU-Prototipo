# NOVU Chatbot

Servicio Python para el asistente conversacional de NOVU. Usa FastAPI y la
Responses API de OpenAI. La clave se lee desde `API_GPT` en el `.env` de la
raíz del proyecto y nunca se envía al navegador.

Este servicio sirve para probar el agente de forma aislada o por terminal. La
aplicación completa consume los endpoints de Copiloto en `backend/`, donde el
agente también recibe el historial y el contexto financiero persistido en MongoDB.

## Instalación

Ejecutá desde la raíz del repositorio:

```bash
python3 -m venv chatbot/.venv
source chatbot/.venv/bin/activate
python -m pip install -r chatbot/requirements-dev.txt
```

El `.env` raíz debe incluir:

```dotenv
API_GPT=tu_clave
```

Las opciones adicionales se documentan en `chatbot/.env.example`.

## API HTTP

```bash
python -m uvicorn chatbot.app:app --reload --host 127.0.0.1 --port 8010
```

- Documentación interactiva: `http://127.0.0.1:8010/docs`
- Salud: `GET http://127.0.0.1:8010/health`
- Chat: `POST http://127.0.0.1:8010/chat`

Primera consulta:

```bash
curl -X POST http://127.0.0.1:8010/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Ayudame a crear una meta de ahorro"}'
```

Para conservar el contexto, enviá el `response_id` recibido como
`previous_response_id` en la consulta siguiente:

```json
{
  "message": "Quiero alcanzarla en seis meses",
  "previous_response_id": "resp_..."
}
```

## Chat por terminal

```bash
python -m chatbot.cli
```

## Pruebas

```bash
python -m pytest chatbot/tests
```

Las pruebas usan un servicio simulado y no consumen créditos de OpenAI.
