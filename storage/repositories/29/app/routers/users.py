# file: app/routers/user_router.py (or live_router.py)

import json

from anyio.functools import cache
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, models, schemas
from app.database import get_db, AsyncSessionLocal  # get_db باید نسخه async باشد
from app.schemas import UserExistence
from app.websocket_manager import manager

router = APIRouter(
    prefix="/api/live",
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)


@router.post("/register", response_model=schemas.User)
async def register_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
        active_livestream = await crud.get_active_livestream(db)
        print(active_livestream.id)
        if active_livestream is None:
            raise HTTPException(status_code=404, detail="هیچ لایوی پیدا نشد")

        if active_livestream.status == models.LiveStreamStatus.FINISHED:
            raise HTTPException(status_code=403, detail="این لایو به پایان رسیده")

        db_user = await crud.get_or_create_user(db=db, user=user, livestream_id=active_livestream.id)
        if not user:
            # این یک خطای منطقی است، اینجا از HTTPException استفاده می‌کنیم
            raise HTTPException(status_code=404, detail="کاربری با این شماره یافت نشد.")
        return db_user

@router.get("/info", response_model=schemas.LiveStreamInfo)
async def get_livestream_info(db: AsyncSession = Depends(get_db)):
    """اطلاعات لایو را با استفاده از کوئری async دریافت می‌کند."""
    active_livestream = await crud.get_active_livestream(db)
    if active_livestream is None:
        raise HTTPException(status_code=404, detail="هیچ لایوی پیدا نشد")
    if active_livestream.status == models.LiveStreamStatus.FINISHED:
        raise HTTPException(status_code=403, detail="این لایو به پایان رسیده")
    return active_livestream

@router.post("/user", response_model=bool)
async def get_livestream_user(request:UserExistence,db: AsyncSession = Depends(get_db)):
    """اطلاعات لایو را با استفاده از کوئری async دریافت می‌کند."""
    is_user_exists = await crud.is_user_exists_by_session_id(request.session_id,request.public_id,db)

    return is_user_exists

@router.post("/answer", status_code=status.HTTP_201_CREATED)
async def submit_answer(
        answer: schemas.UserAnswerCreate,
        session_id: str,  # ✅ به جای user_id، رشته امن session_id را دریافت می‌کنیم
        db: AsyncSession = Depends(get_db)
):
    """
    ثبت امن، فوق‌سریع و احراز هویت شده پاسخ کاربر بدون امکان تقلب.
    """
    try:
        # ۱. پیدا کردن سریع کاربر بر اساس session_id (به لطف ایندکس، بسیار سریع است)
        user_query = await db.execute(
            select(models.User.id).where(models.User.session_id == session_id)
        )
        user_id = user_query.scalars().first()

        # اگر چنین سشنی وجود نداشت یا تقلبی بود
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="اعتبارنامه نامعتبر است. لطفاً مجدداً وارد شوید."
            )

        # ۲. ثبت پاسخ در دیتابیس با متد بهینه‌شده قبلی
        await crud.save_user_answer(db=db, answer_data=answer, user_id=user_id)

        return {"status": "success"}

    except HTTPException as http_ex:
        raise http_ex

    except SQLAlchemyError as db_ex:
        print(f"Database error during submit_answer: {db_ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="سرویس دیتابیس موقتاً در دسترس نیست."
        )

    except Exception as ex:
        print(f"Unexpected error during submit_answer: {ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطای داخلی سرور رخ داده است."
        )
