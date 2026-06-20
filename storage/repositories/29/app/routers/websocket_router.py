import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from app.database import AsyncSessionLocal
from app.state import live_states
from app.websocket_manager import manager
from app import crud

router = APIRouter(prefix="/api")


@router.websocket("/ws/{public_id}/{session_id}")
async def websocket_endpoint(
        websocket: WebSocket,
        public_id: str,
        session_id: str
):
    user_id = None

    # ۱. بخش اعتبارسنجی اولیه (کاملاً درست و عالی)
    async with AsyncSessionLocal() as db:
        try:
            user = await crud.get_user_by_session_id(db, session_id=session_id)
            livestream = await crud.get_livestream_by_public_id(db, public_id=public_id)

            if not user or not livestream or user.livestream_id != livestream.id:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid session or livestream")
                return

            user_id = user.id
        except Exception as e:
            print(f"Auth error in WS: {e}")
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason="Auth failed")
            return

    # اتصال کاربر به منیجر وب‌سوکت
    await manager.connect(websocket, public_id, user_id)

    try:
        # ارسال آخرین وضعیت مسابقه/سوال به کاربر تازه وارد (بدون نیاز به دیتابیس و مستقیم از حافظه رم)
        if public_id in live_states:
            current_question = live_states[public_id]
            await websocket.send_json(current_question)

        # ۲. حلقه اصلی (فقط گوش به زنگ زنده ماندن اتصال یا پیام‌های مدیریتی سبک)
        while True:
            # کلاینت‌ها معمولاً هر چند ثانیه یک پیام خالی (Ping) می‌فرستند تا اتصال قطع نشود.
            data_str = await websocket.receive_text()

            # [نکته بسیار مهم]: ثبت پاسخ کاربران کلاً از اینجا حذف شد.
            # کاربران پاسخ‌هایشان را به HTTP POST /api/answer ارسال می‌کنند.
            # اگر ادمین از این کانال پیامی فرستاد، می‌توانید اینجا مدیریت کنید.
            pass

    except WebSocketDisconnect:
        print(f"User {user_id} disconnected safely from livestream {public_id}")
        manager.disconnect(public_id, user_id)

    except Exception as e:
        print(f"Unexpected WS error for user {user_id}: {e}")
        manager.disconnect(public_id, user_id)
        try:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason="Server error")
        except:
            pass