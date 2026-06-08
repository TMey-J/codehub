from typing import List

from fastapi import APIRouter, UploadFile, File, Depends, Form

from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.core.exceptions import AppException
from app.core.security import get_current_user
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.schemas import ApiResponse
from app.schemas.file import FileResponse

router = APIRouter()

@router.post("/{repository_id}/files",response_model=ApiResponse[None])
async def upload_files(
    repository_id: int,

    files: List[UploadFile] = File(...),

    paths: List[str] = Form(...),

    db: AsyncSession = Depends(get_db),

    current_user: User = Depends(get_current_user)
):
    try:
        if len(files) != len(paths):
            raise AppException(
                status_code=400,
                message="files count and paths count mismatch"
            )
        use_case = await dependencies.get_upload_file_use_case(db,current_user)
        await use_case.execute(
            repository_id,
            files,
            paths
        )

        return ApiResponse(is_success=True, errors=[], response=None)

    except ValueError as ex:

        raise AppException(status_code=401, message=str(ex))


@router.post(
    "/{repository_id}/import",response_model=ApiResponse[None]
)
async def import_zip(
    repository_id: int,
    zip_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        use_case = await (
            dependencies.get_import_zip_use_case(
                db,
                current_user
            )
        )

        await use_case.execute(
            repository_id,
            zip_file
        )

        return ApiResponse(is_success=True, errors=[], response=None)

    except ValueError as ex:

        raise AppException(status_code=401, message=str(ex))