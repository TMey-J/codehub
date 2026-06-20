import enum
import shortuuid
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Enum, UniqueConstraint, DateTime, func, \
    CheckConstraint, Text
from sqlalchemy.orm import relationship
from app.database import Base


class LiveStreamStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    FINISHED = "finished"


class QuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    DESCRIPTIVE = "descriptive"


class LiveStream(Base):
    __tablename__ = "livestreams"

    id = Column(Integer, primary_key=True)  # ✅ index=True حذف شد (خودش PK است)
    public_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    admin_secret = Column(String, unique=True, index=True)
    iframe_link = Column(String, nullable=False)
    status = Column(Enum(LiveStreamStatus), default=LiveStreamStatus.PENDING)
    is_active = Column(Boolean, default=False)

    current_question_id = Column(
        Integer,
        ForeignKey("questions.id", use_alter=True, name="fk_livestream_current_question"),
        nullable=True
    )

    questions = relationship(
        "Question",
        back_populates="livestream",
        cascade="all, delete-orphan",
        foreign_keys="[Question.livestream_id]",
    )
    users = relationship("User", back_populates="livestream", cascade="all, delete-orphan")
    current_question = relationship("Question", foreign_keys=[current_question_id], post_update=True)


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)  # ✅ index=True حذف شد
    text = Column(String, nullable=False)  # ❌ index=True حذف شد (نیاز نیست روی متن کل سوال ایندکس باشد)
    duration = Column(Integer, nullable=False, default=30)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    display_time_seconds = Column(Integer, nullable=False, default=0)
    question_type = Column(Enum(QuestionType), nullable=False, default=QuestionType.MULTIPLE_CHOICE)
    livestream_id = Column(Integer, ForeignKey("livestreams.id"))

    livestream = relationship("LiveStream", back_populates="questions", foreign_keys=[livestream_id])
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True)  # ✅ index=True حذف شد
    text = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)
    question_id = Column(Integer, ForeignKey("questions.id"), index=True)  # ✅ اضافه کردن ایندکس برای لود سریع گزینه‌ها
    question = relationship("Question", back_populates="options")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)  # ✅ index=True حذف شد
    full_name = Column(String)  # ❌ اگر بر اساس نام جستجوی حیاتی ندارید، ایندکس برداشته شود تا رم کمتری مصرف کند
    session_id = Column(String, unique=True, index=True, default=lambda: shortuuid.uuid())
    score = Column(Integer, default=0, index=True)  # ✅ اضافه شدن ایندکس برای لود سریع جدول رده‌بندی (Leaderboard)
    livestream_id = Column(Integer, ForeignKey("livestreams.id"))
    phone_number = Column(String, index=True, nullable=False)

    __table_args__ = (UniqueConstraint('phone_number', 'livestream_id', name='_phone_livestream_uc'),)
    livestream = relationship("LiveStream", back_populates="users")
    answers = relationship("Answer", back_populates="user", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)  # ✅ index=True حذف شد (مهم برای لود سنگین INSERT)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey("options.id"), nullable=True)
    answer_text = Column(Text, nullable=True)

    user = relationship("User", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    selected_option = relationship("Option")

    __table_args__ = (
        # این خط خودش یک ایندکس ترکیبی یکتا می‌سازد و کوئری‌های بررسی تکراری نبودن را بسیار سریع می‌کند
        UniqueConstraint('user_id', 'question_id', name='_user_question_uc'),

        CheckConstraint(
            "(selected_option_id IS NOT NULL AND answer_text IS NULL) OR "
            "(selected_option_id IS NULL AND answer_text IS NOT NULL)",
            name="chk_answer_type"
        )
    )