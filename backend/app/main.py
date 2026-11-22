"""
FastAPI application entry-point.

- CORS middleware for frontend integration
- Automatic NLTK data download & DB initialisation on startup
- Swagger docs at /docs
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.database.db import init_db
from app.nlp.preprocessing import download_nltk_data

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

# Initialise database and NLTK on startup
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "A Word Sense Disambiguation API powered by first-order and "
        "second-order semantic similarity using sentence-transformers "
        "and WordNet."
    ),
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router)


# Root redirect / greeting
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to the WSD API",
        "docs": "/docs",
        "health": "/api/health",
    }
