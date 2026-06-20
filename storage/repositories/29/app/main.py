import os

import uvicorn
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Depends, HTTPException, Form
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from starlette import status
from starlette.responses import JSONResponse

from app import models, crud
from app.database import get_db
from app.routers import admin, users, websocket_router
from app.websocket_manager import manager

app = FastAPI(title="Live Q&A Application")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "..", "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
#templates = Jinja2Templates(directory="app/templates")

templates = Jinja2Templates(directory=BASE_DIR+"/templates")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # ما فقط اولین خطا را برای سادگی به کاربر نشان می‌دهیم
    first_error = exc.errors()[0]

    field_name = first_error['loc'][-1]
    error_type = first_error['type']

    if 'pattern' in error_type:
        message = f"فرمت فیلد «{field_name}» صحیح نیست."
    elif 'missing' in error_type:
        message = f"فیلد «{field_name}» اجباری است."
    else:
        message = "داده‌های ورودی نامعتبر است."

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": message},  # این ساختار با کد jQuery شما سازگار است
    )

# 3. اضافه کردن روتر API ادمین
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(websocket_router.router)

@app.get("/admin/details", response_class=HTMLResponse)
async def read_admin_panel(request: Request):
    # راه‌حل: request باید به عنوان یک کلید در یک دیکشنरी ارسال شود
    return templates.TemplateResponse(request,"details.html", )


# @app.get("/live/{public_id}", response_class=HTMLResponse)
# async def live_page(request: Request, public_id: str):
#     return templates.TemplateResponse(request,"live.html",{"public_id": public_id})


@app.get("/live", response_class=HTMLResponse)
async def get_live_page(request: Request, db: Session = Depends(get_db)):
    """
    صفحه لایو را برای کاربر نمایش می‌دهد.
    """
    livestream = await crud.get_active_livestream(db)
    if not livestream:
        raise HTTPException(status_code=404, detail="صفحه مورد نظر یافت نشد.")

    return templates.TemplateResponse(
        request,
        "live.html",
        {
            "public_id": livestream.public_id
        }
    )

# اندپوینت WebSocket کاربر (به‌روز شده)
@app.websocket("/ws/{public_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, public_id: str, user_id: int):
    # نوع کلاینت را مشخص می‌کنیم
    await manager.connect(websocket, public_id, client_type="users")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, public_id, client_type="users")


# اندپوینت WebSocket ادمین (جدید)
# @app.websocket("/web-socket/admin/{admin_secret}")
# async def admin_websocket_endpoint(websocket: WebSocket, admin_secret: str, db: Session = Depends(get_db)):
#     print(f"Server received admin_secret from client: {admin_secret}")  # خط جدید
#
#     livestream = db.query(models.LiveStream).filter(models.LiveStream.admin_secret == admin_secret).first()
#
#     if not livestream:
#         print(f"ERROR: No livestream found for admin_secret: {admin_secret}")  # خط جدید
#         await websocket.close(code=1008)
#         return
#
#     print(f"SUCCESS: Livestream found! Public ID: {livestream.public_id}")  # خط جدید
#
#     public_id = livestream.public_id
#     await manager.connect(websocket, public_id, client_type="admins")
#     try:
#         while True:
#             await websocket.receive_text()
#     except WebSocketDisconnect:
#         manager.disconnect(websocket, public_id, client_type="admins")


# اندپوینت صفحه داشبورد ادمین (جدید)
@app.get("/admin", response_class=HTMLResponse)
async def get_dashboard(request: Request):
    # می‌توان در اینجا اعتبارسنجی کرد که آیا لایو استریم وجود دارد یا نه
    return templates.TemplateResponse(request,"dashboard.html")

@app.get("/admin/{admin_secret}/results", response_class=HTMLResponse)
async def get_admin_results_page(request: Request, admin_secret: str):
    return templates.TemplateResponse(request,"results.html", { "admin_secret": admin_secret})


ADMIN_PASSWORD = "mah_live"
@app.post("/admin/check-password")
async def check_password(password: str = Form(...)):
    """Simple password check"""
    if password == ADMIN_PASSWORD:
        return {"success": True}
    return {"success": False}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=2001, reload=False)