from typing import List

from fastapi import UploadFile
from fastapi.params import File, Form
from pydantic import BaseModel


class FileResponse(BaseModel):

    id: int

    repository_id: int

    file_name: str

    file_size: int

    uploaded_at: str

    relative_path: str

    class Config:
        orm_mode = True

class FileContentResponse(BaseModel):
    id: int
    file_name: str
    relative_path: str

    content: str | None = None

    is_binary: bool

    download_url: str | None = None

    file_size: int

    class Config:
        orm_mode = True