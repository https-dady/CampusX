from fastapi import FastAPI

app = FastAPI(
    title="Career Readiness ML Service",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "ML service is running",
    }