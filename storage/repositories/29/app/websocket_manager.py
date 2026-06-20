import asyncio
from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    def __init__(self):
        # نگهداری اتصالات فعال به صورت: {public_id (str): {user_id (int): WebSocket}}
        self.active_connections: Dict[str, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, public_id: str, user_id: int):
        await websocket.accept()
        if public_id not in self.active_connections:
            self.active_connections[public_id] = {}

        # اگر کاربر قبلاً متصل بوده (مثلا صفحه را رفرش کرده)، اتصال قدیمی را ببندید تا حافظه آزاد شود
        if user_id in self.active_connections[public_id]:
            try:
                await self.active_connections[public_id][user_id].close()
            except:
                pass

        self.active_connections[public_id][user_id] = websocket
        print(f"User {user_id} connected to livestream {public_id}")

    def disconnect(self, public_id: str, user_id: int):
        if public_id in self.active_connections and user_id in self.active_connections[public_id]:
            del self.active_connections[public_id][user_id]
            if not self.active_connections[public_id]:  # اگر هیچ کاربری در این لایو نماند
                del self.active_connections[public_id]
            print(f"User {user_id} disconnected from livestream {public_id}")

    async def send_personal_message(self, message: str, public_id: str, user_id: int):
        if public_id in self.active_connections and user_id in self.active_connections[public_id]:
            try:
                await self.active_connections[public_id][user_id].send_text(message)
            except Exception as e:  # تغییر از RuntimeError به Exception کلی برای امنیت بیشتر
                print(f"Error sending to {user_id} in {public_id}: {e}")
                self.disconnect(public_id, user_id)

    async def _safe_send(self, connection: WebSocket, message: str, public_id: str, user_id: int):
        """یک تابع کمکی برای ارسال امن و صید خطاهای احتمالی تک‌تک وب‌سوکت‌ها"""
        try:
            await connection.send_text(message)
            return None
        except Exception as e:
            print(f"Error during broadcast to {user_id} in {public_id}: {e}")
            return user_id

    async def broadcast(self, message: str, public_id: str):
        """ارسال کاملاً هم‌زمان (Concurrent) پیام به تمام کاربران بدون معطل شدن در صف"""
        if public_id not in self.active_connections or not self.active_connections[public_id]:
            return

        # ساختن لیستی از تسک‌ها برای ارسال هم‌زمان
        tasks = []
        for user_id, connection in self.active_connections[public_id].items():
            tasks.append(self._safe_send(connection, message, public_id, user_id))

        # پمپاژ هم‌زمان تمام پیام‌ها به اتمسفر شبکه!
        # return_exceptions=True باعث می‌شود خطای یک کاربر، فرآیند ارسال به بقیه را خراب نکند
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # پیدا کردن و حذف کاربرانی که ارتباطشان در طول ارسال قطع شده بود
        disconnected_users = [user_id for user_id in results if isinstance(user_id, int)]
        for user_id in disconnected_users:
            self.disconnect(public_id, user_id)


# یک نمونه سراسری از ConnectionManager
manager = ConnectionManager()