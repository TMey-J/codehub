FROM python:3.11-slim

WORKDIR /app

# ۲. ارتقای ابزارهای نصب پایتون
RUN pip install --upgrade pip setuptools wheel --index-url https://mirror2.chabokan.net/pypi/simple/

# ۳. کپی فایل نیازمندی‌ها
COPY requirements.txt .

# ۵. نصب باقی پکیج‌ها
RUN pip install --no-cache-dir -r requirements.txt --index-url https://mirror2.chabokan.net/pypi/simple/

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "2001"]
