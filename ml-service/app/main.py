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