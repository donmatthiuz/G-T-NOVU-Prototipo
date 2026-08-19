from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import router
from app.core.config import get_settings
from app.db.client import create_mongo_client
from app.db.initialize import initialize_database


def create_app(initialize: bool = True) -> FastAPI:
    settings = get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        client = create_mongo_client(settings)
        database = client[settings.mongodb_database]
        app.state.mongo_client = client
        app.state.database = database
        await database.command("ping")
        if initialize:
            await initialize_database(database, settings.seed_demo_data)
        yield
        await client.close()

    application = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.environment != "production" else None,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Idempotency-Key", "X-Request-ID"],
    )

    @application.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        request_id = request.headers.get("x-request-id", str(uuid4()))[:100]
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    @application.exception_handler(HTTPException)
    async def http_error(request: Request, error: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=error.status_code,
            content={"code": f"http_{error.status_code}", "detail": str(error.detail), "request_id": getattr(request.state, "request_id", "unknown")},
            headers=error.headers,
        )

    @application.exception_handler(RequestValidationError)
    async def validation_error(request: Request, error: RequestValidationError) -> JSONResponse:
        first = error.errors()[0] if error.errors() else {}
        return JSONResponse(
            status_code=422,
            content={"code": "validation_error", "detail": first.get("msg", "Solicitud inválida."), "request_id": getattr(request.state, "request_id", "unknown")},
        )

    application.include_router(router, prefix=settings.api_prefix)
    return application


app = create_app()

