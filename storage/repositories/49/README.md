# QuickBill – سیستم فاکتور ساده برای فریلنسرها  

## 📄 توضیح پروژه  
QuickBill یک سیستم فاکتور‌سازی مینیمالیست و سبک است که به فریلنسرها و کسب‌وکارهای کوچک امکان مدیریت مشتریان، ایجاد فاکتور، محاسبه مالیات و تولید PDF فاکتور را می‌دهد. این برنامه با PHP 8.2+ و کتابخانه **dompdf** ساخته شده و از الگوی MVC ساده و autoloading استاندارد PSR‑4 استفاده می‌کند.

## ✨ ویژگی‌ها  
- مدیریت مشتریان (افزودن، ویرایش، حذف)  
- ایجاد، ویرایش، حذف فاکتور و آیتم‌های آن  
- محاسبه خودکار مالیات و مجموع کل  
- وضعیت فاکتور: Draft, Sent, Paid, Overdue (به‌صورت خودکار به Overdue تبدیل می‌شود)  
- دانلود فاکتور به صورت PDF با قالب زیبا  
- داشبورد خلاصه‌وار با تعداد کل مشتریان، فاکتورها، درآمد و فاکتورهای معوق  
- محافظت در برابر CSRF و پیام‌های Flash برای بازخورد کاربر  

## 🛠 پیش‌نیازها  
| پیش‌نیاز | نسخه پیشنهادی |
|---------|----------------|
| PHP | >= 8.2 |
| MySQL / MariaDB | هر نسخه‌ای که PDO را پشتیبانی می‌کند |
| Composer | آخرین نسخه |
| وب‌سرور (Apache, Nginx, PHP built‑in server) | — |
| افزونه‌های PHP | `pdo_mysql`, `mbstring`, `openssl` (برای dompdf) |

## 📦 نصب و راه‌اندازی  

1. **کلون یا دانلود پروژه**  
   ```bash
   git clone https://github.com/quickbill/invoice-system.git
   cd invoice-system
   ```

2. **نصب وابستگی‌ها با Composer**  
   ```bash
   composer install
   ```

3. **پیکربندی دیتابیس**  
   - یک دیتابیس MySQL به نام `quickbill` ایجاد کنید.  
   - کاربر `root` (یا کاربر دلخواه) را با رمز عبور مناسب تنظیم کنید.  
   - تنظیمات اتصال در فایل `config.php` را مطابق محیط خود ویرایش کنید:  

   ```php
   define('DB_DSN', 'mysql:host=localhost;dbname=quickbill;charset=utf8mb4');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   define('APP_URL', 'http://localhost:8000'); // آدرس محلی یا دامنه
   ```

4. **اجرای اسکریپت مهاجرت (migration)**  
   ```bash
   mysql -u root -p quickbill < migrations/schema.sql
   ```

5. **راه‌اندازی وب‌سرور**  
   - با استفاده از سرور داخلی PHP (برای توسعه):  

     ```bash
     php -S localhost:8000 -t public
     ```

   - یا تنظیمات مناسب در Apache/Nginx برای دایرکتوری `public` به عنوان روت وب‌سایت.

6. **دسترسی به برنامه**  
   مرورگر خود را باز کنید و به آدرس `http://localhost:8000` (یا همان‌طور که در `APP_URL` تنظیم کرده‌اید) بروید.

## 🗂 ساختار پروژه  

```
quickbill/
├─ composer.json          # وابستگی‌ها و autoload
├─ config.php             # تنظیمات کلی (دیتابیس، URL، نرخ مالیات پیش‌فرض)
├─ migrations/
│   └─ schema.sql         # ساخت جداول دیتابیس
├─ public/
│   └─ index.php          # نقطه ورودی (router ساده)
├─ src/
│   ├─ Database.php       # اتصال PDO singleton
│   ├─ Models.php         # کلاس‌های Client, Invoice, InvoiceItem
│   └─ InvoicePDF.php     # تولید PDF با Dompdf
├─ views/
│   ├─ layout.php         # قالب اصلی (Bootstrap)
│   ├─ dashboard.php
│   ├─ clients.php
│   ├─ client_form.php
│   ├─ invoices.php
│   ├─ invoice_form.php
│   └─ invoice_view.php
└─ vendor/                # کتابخانه‌های نصب‌شده توسط Composer
```

## 🚦 مسیرهای (Routes) اصلی  

| مسیر | متد | توضیح |
|------|------|-------|
| `/` یا `/dashboard` | GET | داشبورد کلی |
| `/clients` | GET | لیست مشتریان |
| `/clients/create` | GET | فرم افزودن مشتری |
| `/clients` | POST | ذخیره مشتری جدید |
| `/clients/{id}/edit` | GET | فرم ویرایش مشتری |
| `/clients/{id}` | POST | به‌روزرسانی مشتری |
| `/clients/{id}/delete` | POST | حذف مشتری |
| `/invoices` | GET | لیست فاکتورها |
| `/invoices/create` | GET | فرم ایجاد فاکتور |
| `/invoices` | POST | ذخیره فاکتور جدید + آیتم‌ها |
| `/invoices/{id}/edit` | GET | فرم ویرایش فاکتور |
| `/invoices/{id}` | POST | به‌روزرسانی فاکتور |
| `/invoices/{id}/delete` | POST | حذف فاکتور |
| `/invoices/{id}` | GET | نمایش جزئیات فاکتور |
| `/invoices/{id}/pdf` | GET | دانلود PDF فاکتور |

## 📄 تولید PDF فاکتور  
در صفحه جزئیات فاکتور، دکمه **Download PDF** به مسیر `/invoices/{id}/pdf` هدایت می‌شود. کلاس `App\InvoicePDF` با استفاده از **dompdf**، HTML قالب‌بندی شده را به PDF تبدیل می‌کند.

## 🔐 امنیت  
- توکن CSRF برای تمام فرم‌های POST تولید و بررسی می‌شود.  
- پیام‌های Flash برای نمایش نتایج عملیات (موفق/خطا) استفاده می‌شود.  
- تمام ورودی‌ها با `trim()` و اعتبارسنجی ساده بررسی می‌شوند.  

## 🤝 مشارکت  
1. Fork کنید.  
2. یک branch جدید برای ویژگی یا باگ خود بسازید:  

   ```bash
   git checkout -b feature/your-feature
   ```

3. تغییرات را commit کنید و push کنید.  
4. Pull Request باز کنید.  

> لطفاً قبل از ارسال PR، کد را با استانداردهای PSR‑12 بررسی کنید و تست‌های لازم را اجرا کنید.

## 📜 لایسنس  
این پروژه تحت مجوز **MIT** منتشر شده است. برای جزئیات به فایل `LICENSE` مراجعه کنید.

---

**نکته:** برای استفاده در محیط تولید، حتماً تنظیمات `APP_URL`، دسترسی‌های دیتابیس و تنظیمات وب‌سرور (HTTPS، فایروال و ...) را به‌درستی پیکربندی کنید. موفق باشید! 🚀