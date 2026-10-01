from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.model.model_loader import (
    load_model_artifact,
)

from app.routes.prediction import (
    router as prediction_router,
)

from app.routes.resume import (
    router as resume_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model_artifact()

    yield


app = FastAPI(
    title="Career Readiness ML Service",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "ML service is running",
        "model_loaded": True,
    }


app.include_router(
    prediction_router
)

app.include_router(
    resume_router
)