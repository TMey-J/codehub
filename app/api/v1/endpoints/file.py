from typing import List

from fastapi import APIRouter, UploadFile, File, Depends, Form,Request

from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.core.exceptions import AppException
from app.core.security import get_current_user
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.schemas import ApiResponse
from app.schemas.file import FileResponse, FileContentResponse
from fastapi.responses import FileResponse as DownloadFile

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

        raise AppException(status_code=400, message=str(ex))


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

        raise AppException(status_code=400, message=str(ex))

@router.get(
    "/{repository_id}/files",
    response_model=ApiResponse[List[FileResponse]]
)
async def get_files(
    repository_id: int,
    db: AsyncSession = Depends(get_db)
):

    try:

        use_case = await (
            dependencies.get_get_files_use_case(
                db
            )
        )

        result = await use_case.execute(
            repository_id
        )

        return ApiResponse(
            is_success=True,
            errors=[],
            response=[
                FileResponse(
                    **file.to_dict()
                )
                for file in result
            ]
        )

    except ValueError as ex:

        raise AppException(
            status_code=404,
            message=str(ex)
        )

@router.get(
    "/{repository_id}/files/{file_id}/content",
    response_model=ApiResponse[FileContentResponse]
)
async def get_file_content(
    request: Request,
    repository_id: int,
    file_id: int,
    db: AsyncSession = Depends(get_db)
):

    try:

        use_case = await (
            dependencies.get_file_content_use_case(
                db
            )
        )

        result = await use_case.execute(
            repository_id,
            file_id
        )
        result["download_url"] = str(
            request.url_for(
                "download_file",
                repository_id=repository_id,
                file_id=file_id
            ))


        return ApiResponse(
            is_success=True,
            errors=[],
            response=FileContentResponse(
                **result
            )
        )

    except ValueError as ex:

        raise AppException(
            status_code=400,
            message=str(ex)
        )

@router.get(
    "/{repository_id}/files/{file_id}/download",
    name="download_file"
)
async def download_file(
    repository_id: int,
    file_id: int,
    db: AsyncSession = Depends(get_db)
):

    try:

        use_case = await (
            dependencies.get_download_file_use_case(
                db
            )
        )

        file = await use_case.execute(
            repository_id,
            file_id
        )

        return DownloadFile(
            path=file.file_path,
            filename=file.file_name,
            media_type="application/octet-stream"
        )

    except ValueError as ex:

        raise AppException(
            status_code=404,
            message=str(ex)
        )

@router.delete(
    "/{repository_id}/files/{file_id}",
    response_model=ApiResponse[bool]
)
async def delete_file(
    repository_id: int,
    file_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    try:

        use_case = await (
            dependencies.get_delete_file_use_case(
                db,
                current_user
            )
        )

        result = await use_case.execute(
            repository_id,
            file_id
        )

        return ApiResponse(
            is_success=True,
            errors=[],
            response=result
        )

    except ValueError as ex:

        raise AppException(
            status_code=404,
            message=str(ex)
        )

@router.get(
    "/{repository_id}/download"
)
async def download_repository(
    repository_id: int,
    db: AsyncSession = Depends(get_db)
):

    try:

        use_case = await (
            dependencies
            .get_download_repository_use_case(
                db
            )
        )

        zip_path = await use_case.execute(
            repository_id
        )
        return DownloadFile(
            path=zip_path,
            filename=zip_path.split("/")[-1],
            media_type="application/zip"
        )

    except ValueError as ex:

        raise AppException(
            status_code=404,
            message=str(ex)
        )