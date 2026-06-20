# 📚 CodeHub – پلتفرم مدیریت مخازن کد منبع (FastAPI)

## 📖 معرفی
**CodeHub** یک سرویس وب مبتنی بر FastAPI است که امکان مدیریت مخازن کد، بارگذاری و دانلود فایل‌ها، احراز هویت کاربران، و استفاده از هوش مصنوعی برای تحلیل امنیتی، بهینه‌سازی و تولید README خودکار را فراهم می‌کند. این پروژه به‌صورت ماژولار طراحی شده و از الگوهای Clean Architecture و Dependency Injection بهره می‌گیرد.

## ✨ ویژگی‌ها
| ویژگی | توضیح |
|-------|-------|
| **احراز هویت JWT** | ثبت‌نام، ورود، توکن‌های دسترسی و رفرش |
| **مدیریت مخازن** | ایجاد، به‌روزرسانی، حذف، جستجو، ستاره‌گذاری |
| **بارگذاری/دانلود فایل** | پشتیبانی از چند فایل، مسیرهای دلخواه، دانلود به‌صورت ZIP |
| **تحلیل امنیتی فایل** | شناسایی آسیب‌پذیری‌ها با استفاده از سرویس AI |
| **بهینه‌سازی کد** | بهبود کیفیت کد با هوش مصنوعی |
| **تولید README خودکار** | تولید محتوا به زبان فارسی/انگلیسی |
| **داشبورد آماری** | نمایش آمار کلی و کاربری |
| **پشتیبانی از CORS** | امکان استفاده از API در برنامه‌های فرانت‌اند مختلف |
| **تست واحد** | پوشش تست‌های مهم برای لایه‌های کاربردی |
| **Docker‑Compose آماده** | راه‌اندازی سریع در محیط‌های توسعه و تولید |

## 🗂️ ساختار پروژه
```
app/
├─ api/
│   └─ v1/
│       ├─ endpoints/      # روت‌های FastAPI
│       └─ router.py
├─ application/
│   └─ use_cases/          # منطق کسب‌وکار (RegisterUser, CreateRepository, …)
├─ core/
│   ├─ exceptions.py       # هندلرهای خطا
│   ├─ security.py         # JWT و احراز هویت
│   └─ settings.py         # تنظیمات از .env
├─ domain/
│   ├─ entities/           # مدل‌های دامنه (User, Repository, File,…)
│   └─ value_objects/      # اشیای ارزش (Email, Username,…)
├─ infrastructure/
│   ├─ database/           # مدل‌های SQLAlchemy و Session
│   ├─ repositories/       # پیاده‌سازی ریپازیتوری‌ها
│   └─ services/           # سرویس‌های خارجی (AI)
├─ schemas/                # Pydantic models (درخواست/پاسخ)
├─ static/                 # فایل‌های استاتیک (Swagger UI)
└─ main.py                 # نقطه ورودی FastAPI
tests/
└─ unit_test/              # تست‌های واحد
```

## ⚙️ پیش‌نیازها
- **Python 3.10+**
- **PostgreSQL** (یا هر دیتابیس سازگار با SQLAlchemy)
- **Docker & Docker‑Compose** (اختیاری، برای راه‌اندازی سریع)

## 🔧 نصب و راه‌اندازی

### ۱. کلون کردن مخزن
```bash
git clone https://github.com/yourusername/codehub.git
cd codehub
```

### ۲. ساخت فایل `.env`
یک فایل `.env` در ریشه پروژه ایجاد کنید و مقادیر زیر را تنظیم کنید:

```dotenv
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/codehub_db
SECRET_KEY=your_secret_key_here
SAMBANOVA_API_KEYS=key1,key2,key3   # کلیدهای سرویس AI
```

### ۳. نصب وابستگی‌ها
```bash
python -m venv venv
source venv/bin/activate   # برای ویندوز: venv\Scripts\activate
pip install -r requirements.txt
```

### ۴. اعمال مهاجرت‌های دیتابیس
```bash
alembic upgrade head
```

### ۵. اجرای برنامه
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

اکنون می‌توانید به آدرس `http://127.0.0.1:8000/docs` بروید و مستندات Swagger UI را مشاهده کنید.

### گزینه Docker (یک‌دست)
```bash
docker compose up --build
```
سرویس FastAPI در پورت `8000` و PostgreSQL در پورت `5432` در دسترس خواهد بود.

## 🧪 اجرای تست‌ها
```bash
pytest -q
```
تمام تست‌های موجود در پوشه `tests/unit_test` اجرا می‌شوند و پوشش اولیه منطق کسب‌وکار را تضمین می‌کنند.

## 📚 مستندات API
- **Swagger UI**: `GET /docs` (در حالت پیش‌فرض فعال است)
- **OpenAPI JSON**: `GET /openapi.json`

هر روت در پوشه `app/api/v1/endpoints` به‌صورت کامل مستند شده است و از مدل‌های Pydantic برای اعتبارسنجی ورودی/خروجی استفاده می‌کند.

## 🔐 امنیت
- توکن‌های JWT با الگوریتم **HS256** و زمان انقضای تنظیم‌شده (`ACCESS_TOKEN_EXPIRE_MINUTES` و `REFRESH_TOKEN_EXPIRE_DAYS`) تولید می‌شوند.
- تمام مسیرهای حساس با `Depends(get_current_user)` محافظت می‌شوند.
- CORS به‌صورت `allow_origins=["*"]` تنظیم شده؛ در محیط تولید می‌توانید لیست دامنه‌های معتبر را محدود کنید.

## 🛠️ توسعه و مشارکت
1. یک فورک از مخزن ایجاد کنید.  
2. یک شاخه جدید برای ویژگی یا باگ‌فیکس خود بسازید:  
   ```bash
   git checkout -b feature/your-feature
   ```
3. پس از اتمام کار، یک Pull Request باز کنید.  
4. لطفاً تست‌های مربوطه را اضافه یا به‌روزرسانی کنید.

## 📦 بسته‌بندی و انتشار
برای ساخت Docker image می‌توانید از دستور زیر استفاده کنید:
```bash
docker build -t codehub:latest .
```

## 📄 لایسنس
این پروژه تحت مجوز **MIT** منتشر شده است. برای جزئیات به فایل `LICENSE` مراجعه کنید.

---

> **نکته:** برای استفاده از سرویس‌های AI (تحلیل امنیتی، بهینه‌سازی، تولید README) باید کلیدهای معتبر `SAMBANOVA_API_KEYS` را در فایل `.env` قرار دهید. در غیر این صورت درخواست‌های مربوطه با خطای `429 Too Many Requests` یا `500 Internal Server Error` مواجه می‌شوند.