from datetime import datetime

from pydantic import BaseModel, model_validator, Field
from typing import List, Optional, Dict
from .models import LiveStreamStatus, QuestionType


class OptionBase(BaseModel):
    text: str
    is_correct: bool = False  # این فقط در ادمین پنل استفاده می‌شود و به کاربر ارسال نمی‌شود


class OptionCreate(OptionBase):
    pass


class Option(OptionBase):
    id: int
    question_id: int

    class Config:
        orm_mode = True


class QuestionBase(BaseModel):
    text: str
    duration: int
    display_time_seconds: int = 0
    question_type: QuestionType = QuestionType.MULTIPLE_CHOICE # <--- اضافه شد
    options: List[OptionCreate] = []


class QuestionCreate(QuestionBase):
    pass


class Question(QuestionBase):
    id: int
    livestream_id: int
    created_at: datetime
    options: List[Option] = []

    class Config:
        orm_mode = True


class WebSocketMessage(BaseModel):
    type: str
    data: dict


class UserAnswer(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    answer_text: Optional[str] = None

    # <<<< نسخه اصلاح شده و صحیح >>>>
    @model_validator(mode='after')
    def check_answer_type(self):
        # از 'self' به جای 'values' استفاده می‌کنیم تا مشخص شود این یک instance است
        # برای دسترسی به فیلدها از نقطه (.) استفاده می‌کنیم

        # اگر هر دو مقدار پر شده بودند
        if self.selected_option_id is not None and self.answer_text is not None:
            raise ValueError('Either selected_option_id or answer_text must be provided, not both.')

        # اگر هیچکدام از مقادیر پر نشده بودند
        if self.selected_option_id is None and self.answer_text is None:
            raise ValueError('Either selected_option_id or answer_text must be provided.')

        return self


class UserAnswerCreate(UserAnswer):
    pass

# --- LiveStream Schemas ---
class LiveStreamBase(BaseModel):
    title: str  # <--- این خط اضافه شد
    iframe_link: str

class LiveStreamForShow(BaseModel):
    admin_secret: str
    title: str
    is_active: bool = False

    class Config:
        from_attributes = True  # این خط حیاتی است برای اتصال به مدل SQLAlchemy

class LiveStreamInfo(LiveStreamBase):
    is_active: bool
    id: int
    public_id: str
    status: LiveStreamStatus
    class Config:
        from_attributes = True  # این خط حیاتی است برای اتصال به مدل SQLAlchemy

class LiveStreamCreate(LiveStreamBase):
    title: str  # <--- این خط اضافه شد
    questions: List[QuestionCreate]


class LiveStream(LiveStreamBase):
    id: int
    public_id: str
    status: LiveStreamStatus
    questions: List[Question] = []
    current_question_id: Optional[int] = None
    title:str

    class Config:
        orm_mode = True


# برای نمایش به ادمین همراه با کلید ویرایش
class LiveStreamAdmin(LiveStream):
    admin_secret: str


# --- User Schemas ---
class UserBase(BaseModel):
    full_name: str
    phone_number: str = Field(
        ...,
        pattern=r"^09\d{9}$",
        description="شماره موبایل"
    )


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int
    session_id: str
    livestream_id: int
    score: int

    class Config:
        orm_mode = True

class UserExistence(BaseModel):
    session_id: str
    public_id: str

    class Config:
        from_attributes = True


class UserJoin(BaseModel):
    username: str

    class Config:
        from_attributes = True


class QuestionResult(BaseModel):
    id: int
    text: str
    options: Dict[int, str]
    correct_option: Optional[int] # <--- تغییر به Optional[int]
    votes: Dict[int, int]


class FinalResultsResponse(BaseModel):
    livestream_id: int
    public_id: str
    questions: List[QuestionResult]
