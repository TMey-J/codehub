import shortuuid
from fastapi import HTTPException
from sqlalchemy import select, desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, load_only
from starlette import status

from app import models, schemas


async def create_livestream(db: AsyncSession, livestream: schemas.LiveStreamCreate):

    public_id = shortuuid.uuid()
    admin_secret = shortuuid.uuid()

    db_livestream = models.LiveStream(
        iframe_link=livestream.iframe_link,
        public_id=public_id,
        admin_secret=admin_secret,
        status=models.LiveStreamStatus.PENDING,
        title=livestream.title
    )

    for q_schema in livestream.questions:
        db_question = models.Question(
            text=q_schema.text,
            display_time_seconds=q_schema.display_time_seconds,
            duration=q_schema.duration,
            question_type=q_schema.question_type  # <--- اضافه شد: ذخیره نوع سوال
        )

        # این حلقه فقط برای سوالات تستی اجرا می‌شود (چون گزینه‌ها خالی است)
        for opt_schema in q_schema.options:
            db_option = models.Option(
                text=opt_schema.text,
                is_correct=opt_schema.is_correct,
            )
            db_question.options.append(db_option)

        db_livestream.questions.append(db_question)

    db.add(db_livestream)
    await db.commit()

    # ... (بخش reload بدون تغییر) ...
    result = await db.execute(
        select(models.LiveStream)
        .options(
            selectinload(models.LiveStream.questions)
            .selectinload(models.Question.options)
        )
        .where(models.LiveStream.id == db_livestream.id)
    )
    return result.scalar_one_or_none()

async def delete_livestream(db: AsyncSession, admin_secret:str):
    livestream = await get_livestream_by_admin_secret(db, admin_secret)
    if not livestream:
        return False
    await db.delete(livestream)
    await db.commit()
    return True

async def delete_livestream_answers_and_users(db: AsyncSession, admin_secret: str):
    livestream = await get_livestream_with_users_by_admin_secret(db, admin_secret)
    if not livestream:
        return False

    # با وجود cascade، این دستور باعث حذف تمام کاربران مرتبط
    # و سپس تمام جواب‌های آن کاربران می‌شود.
    livestream.users.clear() # یا livestream.users = []

    await db.commit()
    return True

async def active_livestream(db: AsyncSession, admin_secret:str):
    stmt = select(models.LiveStream).where(models.LiveStream.is_active==True)
    result = await db.execute(stmt)
    active_live=result.scalar_one_or_none()
    if active_live:
        active_live.is_active = False
    livestream = await get_livestream_by_admin_secret(db, admin_secret)
    if not livestream:
        return False
    livestream.is_active = True
    await db.commit()
    return True

async def de_active_livestream(db: AsyncSession, admin_secret:str):
    livestream = await get_livestream_by_admin_secret(db, admin_secret)
    if not livestream:
        return False
    livestream.is_active = False
    await db.commit()
    return True

async def get_livestream_by_admin_secret(db: AsyncSession, admin_secret: str) -> models.LiveStream | None:
    """دریافت لایو با سکرت ادمین به صورت async."""
    stmt = select(models.LiveStream).where(models.LiveStream.admin_secret == admin_secret) \
        .options(selectinload(models.LiveStream.questions).selectinload(models.Question.options))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_livestream_with_users_by_admin_secret(db: AsyncSession, admin_secret: str) -> models.LiveStream | None:
    """لایو را به همراه تمام کاربرانش برای عملیات مدیریتی لود می‌کند."""
    stmt = select(models.LiveStream) \
        .options(selectinload(models.LiveStream.users)).where(models.LiveStream.admin_secret == admin_secret)


    result = await db.execute(stmt)
    return result.scalars().first()

async def get_livestreams(db: AsyncSession):
    """دریافت لایو با سکرت ادمین به صورت async."""
    stmt = select(models.LiveStream).order_by(desc(models.LiveStream.id)).options(
        load_only(
            models.LiveStream.admin_secret,
            models.LiveStream.title,
            models.LiveStream.is_active
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_livestream_by_public_id(db: AsyncSession, public_id: str):
    # استفاده از selectinload برای بارگذاری روابط به صورت Eager
    query = (
        select(models.LiveStream)
        .where(models.LiveStream.public_id == public_id)
        .options(
            selectinload(models.LiveStream.questions)
            .selectinload(models.Question.options)  # اگر در Schema گزینه‌ها را هم دارید، این خط حیاتی است
        )
    )

    result = await db.execute(query)
    return result.scalars().first()

async def get_active_livestream(db: AsyncSession):
    # استفاده از selectinload برای بارگذاری روابط به صورت Eager
    query = (
        select(models.LiveStream)
        .where(models.LiveStream.is_active ==True)
        .options(
            load_only(
                models.LiveStream.iframe_link,
                models.LiveStream.title,
                models.LiveStream.id,
                models.LiveStream.is_active,
                models.LiveStream.status,
                models.LiveStream.public_id
        ))
    )

    result = await db.execute(query)
    return result.scalars().first()

async def update_livestream(db: AsyncSession, db_livestream: models.LiveStream,
                            livestream_update: schemas.LiveStreamCreate) -> models.LiveStream:
    # ... (بخش آپدیت فیلدهای ساده و پاک کردن سوالات قدیمی بدون تغییر) ...
    db_livestream.iframe_link = livestream_update.iframe_link
    db_livestream.title = livestream_update.title
    db_livestream.questions = []
    await db.flush()

    new_questions = []
    for q_schema in livestream_update.questions:
        db_question = models.Question(
            text=q_schema.text,
            display_time_seconds=q_schema.display_time_seconds,
            duration=q_schema.duration,
            question_type=q_schema.question_type # <--- اضافه شد: ذخیره نوع سوال
        )
        for opt_schema in q_schema.options:
            db_option = models.Option(text=opt_schema.text, is_correct=opt_schema.is_correct)
            db_question.options.append(db_option)
        new_questions.append(db_question)

    db_livestream.questions = new_questions
    db.add(db_livestream)
    await db.commit()

    # ... (بخش واکشی مجدد بدون تغییر) ...
    query = (
        select(models.LiveStream)
        .where(models.LiveStream.id == db_livestream.id)
        .options(
            selectinload(models.LiveStream.questions)
            .selectinload(models.Question.options)
        )
    )
    result = await db.execute(query)
    refreshed_livestream = result.scalars().first()
    return refreshed_livestream

async def get_livestream_for_task(db: AsyncSession, public_id: str):
    """
    SPECIALIZED function for the background task.
    Eagerly loads the livestream with all its questions and their options
    to prevent any lazy-loading IO in the background task.
    """
    query = (
        select(models.LiveStream)
        .filter(models.LiveStream.public_id == public_id)
        .options(
            selectinload(models.LiveStream.questions)
            .selectinload(models.Question.options)
        )
    )
    result = await db.execute(query)
    return result.scalars().first()


async def get_or_create_user(db: AsyncSession, user: schemas.UserCreate, livestream_id: int) -> models.User:
    """
    کاربر را بر اساس شماره تلفن و آیدی لایو پیدا می‌کند. اگر وجود نداشت، ایجاد می‌کند.
    """
    stmt = select(models.User).where(
        models.User.phone_number == user.phone_number,
        models.User.livestream_id == livestream_id
    )
    result = await db.execute(stmt)
    db_user = result.scalars().first()

    if db_user:
        return db_user
    new_session_id = shortuuid.uuid()
    db_user = models.User(
        full_name=user.full_name,
        phone_number=user.phone_number,
        livestream_id=livestream_id,
        session_id=new_session_id
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user_by_session_id(db: AsyncSession, session_id: str) -> models.User | None:
    """کاربر را بر اساس session_id به صورت async دریافت می‌کند."""
    stmt = select(models.User).where(models.User.session_id == session_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_question_by_id(db: AsyncSession, question_id: int) -> models.Question | None:
    """یک سوال را با گزینه‌هایش به صورت async دریافت می‌کند."""
    stmt = select(models.Question).where(models.Question.id == question_id) \
        .options(selectinload(models.Question.options))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_option_by_id(db: AsyncSession, option_id: int) -> models.Option | None:
    """یک گزینه را به صورت async دریافت می‌کند."""
    stmt = select(models.Option).where(models.Option.id == option_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def save_user_answer(db: AsyncSession, user_id: int, answer_data: schemas.UserAnswerCreate):
    """
    ثبت فوق‌سریع پاسخ کاربر در دیتابیس با حذف کوئری‌های اضافه زیر بار ترافیک سنگین.
    """

    # [توصیه مهندسی]: اعتبارسنجی تستی/تشریحی را بهتر است در ساختار Pydantic (فایل schemas)
    # با استفاده از @model_validator انجام دهید تا اصلاً کدهای غلط به این تابع نرسند.
    # اما اگر اینجا انجام می‌شود، فرم زیر بسیار سبک‌تر است:

    if answer_data.selected_option_id is not None:
        # اگر کاربر گزینه فرستاده، پس فرض می‌کنیم تستی است و متن را پاک می‌کنیم
        answer_text_value = None
        selected_option_value = answer_data.selected_option_id
    elif answer_data.answer_text:
        # اگر متن فرستاده، پس تشریحی است
        answer_text_value = answer_data.answer_text
        selected_option_value = None
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either selected_option_id or answer_text must be provided."
        )

    # ساخت مستقیم آبجکت برای ثبت در دیتابیس
    db_answer = models.Answer(
        user_id=user_id,
        question_id=answer_data.question_id,
        selected_option_id=selected_option_value,
        answer_text=answer_text_value
    )

    try:
        db.add(db_answer)
        await db.commit()  # ثبت مستقیم در SSD سرور خانگی

        # ❌ دستور await db.refresh(db_answer) حذف شد.
        # چون به دیتای تازه متولد شده در دیتابیس نیازی نداریم و می‌خواهیم فوراً سراغ کاربر بعدی برویم.

        return {"status": "success"}  # بازگرداندن یک پیام ساده به جای کل آبجکت برای کاهش مصرف پهنای باند

    except IntegrityError:
        # اگر کاربر قبلاً به این سوال پاسخ داده باشد، UniqueConstraint دیتابیس فعال شده
        # و جلوی ثبت تکراری را می‌گیرد. بدون اینکه نیاز باشد ما قبلاً SELECT بزنیم!
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already answered this question."
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during saving answer."
        )

async def is_user_exists_by_session_id(session_id: str, public_id: str, db: AsyncSession) -> bool:
    query = (
        select(models.User)
        .where(
            models.User.session_id == session_id,
            models.LiveStream.public_id == public_id
        )
    )

    result = await db.execute(query)
    user = result.scalars().first()

    # اگر user پیدا شود (None نباشد)، True برمی‌گرداند، در غیر این صورت False
    return user is not None