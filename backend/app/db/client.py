from typing import Any

from fastapi import Request
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import Settings


Document = dict[str, Any]


def create_mongo_client(settings: Settings) -> AsyncMongoClient[Document]:
    return AsyncMongoClient(
        settings.mongodb_uri,
        appname="novu-api",
        serverSelectionTimeoutMS=10_000,
        uuidRepresentation="standard",
    )


def get_database(request: Request) -> AsyncDatabase[Document]:
    return request.app.state.database

