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