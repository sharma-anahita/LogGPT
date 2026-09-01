import selectors

# Monkey-patch selectors to avoid ValueError: Invalid file descriptor: -1 on Python 3.12+ / Windows
def _patch_selector_class(cls):
    if hasattr(cls, 'unregister'):
        original_unregister = cls.unregister
        def safe_unregister(self, fileobj):
            try:
                return original_unregister(self, fileobj)
            except (ValueError, KeyError, AttributeError):
                return None
        cls.unregister = safe_unregister

_patch_selector_class(selectors.BaseSelector)
if hasattr(selectors, '_BaseSelectorImpl'):
    _patch_selector_class(selectors._BaseSelectorImpl)
if hasattr(selectors, 'SelectSelector'):
    _patch_selector_class(selectors.SelectSelector)

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.kafka_consumer import start_consumer_thread


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_consumer_thread()
    yield


app = FastAPI(title="LogGPT ML Service", lifespan=lifespan)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}