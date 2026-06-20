$(document).ready(function() {
    const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
    if (!isAuthenticated) {
        window.location.href='/admin'
    }
    else{
        $('.container').fadeIn();
    }
    const adminSecret = admin_secret

    if (!adminSecret) {
        alert('کلید مدیریت (Admin Secret) در URL یافت نشد.');
        return;
    }

    // ابتدا عنوان لایو استریم را برای نمایش بارگذاری می‌کنیم (اختیاری)
    $.ajax({
        url: `/api/admin/livestreams/${adminSecret}`,
        type: 'GET',
        success: function(data) {
            $('#livestream-title').text(`نتایج لایو: ${data.title}`); // می‌توانید عنوان مناسبی اینجا قرار دهید
        },
        error: function() {
            $('#livestream-title').text('نتایج نهایی لایو'); // عنوان پیش‌فرض در صورت خطا
        }
    });

    // بارگذاری نتایج نهایی
    $.ajax({
        url: `/api/admin/livestreams/${adminSecret}/results`,
        type: 'GET',
        success: function(data) {
            const tableBody = $('#results-table-body');
            tableBody.empty(); // پاک کردن ردیف‌های قبلی

            if (data.length === 0) {
                $('#no-results').show(); // نمایش پیام عدم وجود نتایج
            } else {
                data.forEach(function(userResult) {
                    const row = `
                        <tr>
                            <td>${userResult.rank}</td>
                            <td>${userResult.full_name}</td>
                            <td>${userResult.phone_number}</td>
                            <td>${userResult.correct_answers}</td>
                        </tr>
                    `;
                    tableBody.append(row);
                });
            }
        },
        error: function(xhr) {
            alert('خطا در بارگذاری نتایج: ' + (xhr.responseJSON ? xhr.responseJSON.detail : xhr.responseText));
            $('#no-results').show().text('خطا در بارگذاری نتایج.');
        }
    });
});
