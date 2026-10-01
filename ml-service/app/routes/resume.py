from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from app.services.resume_analysis_service import (
    analyze_resume,
)


router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)


ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/check")
async def check_resume(
    file: UploadFile = File(...)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX resumes are supported.",
        )

    data = await file.read()

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded resume is empty.",
        )

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Resume size must be 5 MB or smaller.",
        )

    try:
        result = analyze_resume(
            data,
            file.content_type,
        )

        return {
            "success": True,
            "data": result,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Unexpected resume analysis error.",
        ) from error