$(document).ready(function() {
    // تعریف ساختار باکس (به صورت template literal)
    const liveBoxTemplate = `<article>
                <div class="livestream-header">
                    <h3 style="margin: 0;"></h3>
                    <span class="status-badge"></span>
                </div>
                <footer>
                    <a href="#" role="button" class="secondary outline details">مدیریت سوالات</a>
                    <a href="#" role="button" class="status active">فعال‌سازی</a>
                    <a href="#" role="button" class="btn-delete">حذف</a>
                    <input type="hidden" class="secret">
                </footer>
            </article>`;

    $.ajax({
        url: `/api/admin/livestreams`,
        type: 'GET',
        success: function(data) {
            // خالی کردن گرید قبل از اضافه کردن داده‌ها (برای جلوگیری از تکرار)
            const $grid = $('.livestreams-grid');
            $grid.empty();

            // پیمایش روی داده‌های دریافتی
            $.each(data, function(index, item) {
                // تبدیل متن به شیء jQuery
                let $box = $(liveBoxTemplate);

                // مقداردهی به عنوان
                $box.find('h3').text(item.title);
                $box.find('.secret').val(item.admin_secret);
               $box.find('.details').prop('href' ,'/admin/details?secret=' + item.admin_secret);

                // مدیریت وضعیت (Active/Inactive)
                let $badge = $box.find('.status-badge');
                let $btnStatus = $box.find('.status');
                console.log(item.is_active)
                if (item.is_active == true) {
                    // اگر فعال است
                    $badge.text('● فعال').addClass('active');
                    $btnStatus.addClass('outline'); // غیرفعال کردن دکمه
                    $btnStatus.removeClass('active'); // غیرفعال کردن دکمه
                    $btnStatus.addClass('de-active'); // غیرفعال کردن دکمه
                    $btnStatus.text('غیر فعال');       // تغییر متن دکمه
                } else {
                    // اگر غیرفعال است
                    $badge.text('● غیرفعال').addClass('inactive');
                    // دکمه فعال است، می‌توانید اکشن مربوط به فعال‌سازی را اینجا بنویسید
                }

                // اضافه کردن به صفحه
                $grid.append($box);
            });
            enable_delete()
            enable_active()
            enable_de_active()

        },
        error: function(xhr) {
            alert('مشکلی در دریافت اطلاعات لایوها پیش آمده است.');
        }
    });
});
function enable_delete() {
    $('.btn-delete').click(function(e) {
        e.preventDefault(); // همیشه اولین کار، جلوگیری از رفتار پیش‌فرض لینک یا دکمه است

        // پیام تایید را تعریف می‌کنیم
        const message = "آیا از حذف کامل این لایو استریم مطمئن هستید؟\nتمام سوالات و پاسخ‌های آن نیز برای همیشه حذف خواهند شد!";

        // اگر کاربر روی "OK" کلیک کرد، ادامه می‌دهیم
        if (window.confirm(message)) {
            let admin_secret = $(this).parent().find('.secret').val();

            $.ajax({
                url: `/api/admin/livestreams/delete/${admin_secret}`,
                type: 'DELETE',
                success: function(data) {
                    // بعد از حذف موفق، صفحه را رفرش می‌کنیم تا آیتم حذف شده از لیست برود
                    window.location.reload();
                },
                error: function(xhr) {
                    alert('مشکلی در حذف لایو پیش آمده است.');
                }
            });
        } else {
            // اگر کاربر انصراف داد، در کنسول ثبت می‌کنیم (اختیاری)
            console.log("عملیات حذف لایو توسط کاربر لغو شد.");
        }
    });
}
function enable_active(){
    $('.active').click(function(e){
        e.preventDefault();
        let admin_secret = $(this).parent().find('.secret').val();
        $.ajax({
            url: `/api/admin/livestreams/active/${admin_secret}`,
            type: 'PUT',
            success: function(data) {
                window.location.reload()

            },
            error: function(xhr) {
                alert('مشکلی در تغییر وضعیت لایو پیش آمده است.');
            }
        })
    })
}
function enable_de_active(){
    $('.de-active').click(function(e){
        e.preventDefault();
        let admin_secret = $(this).parent().find('.secret').val();
        $.ajax({
            url: `/api/admin/livestreams/deactive/${admin_secret}`,
            type: 'PUT',
            success: function(data) {
                window.location.reload()

            },
            error: function(xhr) {
                alert('مشکلی در تغییر وضعیت لایو پیش آمده است.');
            }
        })
    })
}