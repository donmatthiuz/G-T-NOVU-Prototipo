import asyncio
import logging
from typing import Any

from fastapi import Request
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import ConnectionFailure

from app.core.config import Settings


Document = dict[str, Any]
logger = logging.getLogger(__name__)


def create_mongo_client(settings: Settings) -> AsyncMongoClient[Document]:
    return AsyncMongoClient(
        settings.mongodb_uri,
        appname="novu-api",
        serverSelectionTimeoutMS=10_000,
        uuidRepresentation="standard",
    )


async def wait_for_mongo(
    database: AsyncDatabase[Document], *, attempts: int = 12, delay_seconds: float = 3
) -> None:
    # Direct VPC egress puede tardar más de un minuto en estar disponible.
    # Reintentar sólo durante el arranque; las solicitudes conservan el timeout de 10 s.
    for attempt in range(1, attempts + 1):
        try:
            await database.command("ping")
            return
        except ConnectionFailure:
            if attempt == attempts:
                raise
            logger.warning(
                "MongoDB aún no está disponible durante el arranque (intento %s/%s).",
                attempt, attempts,
            )
            await asyncio.sleep(delay_seconds)


def get_database(request: Request) -> AsyncDatabase[Document]:
    return request.app.state.database

