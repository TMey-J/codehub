$(document).ready(function() {
    const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
    if (!isAuthenticated) {
        window.location.href='/admin'
    }
    else{
        $('.container').fadeIn();
    }
    let questionCounter = 0; // برای IDهای یونیک سوالات در HTML
    let optionCounter = 0;   // برای IDهای یونیک گزینه‌ها در HTML (درون هر سوال)

    // تابع برای اضافه کردن یک گزینه جدید به یک سوال مشخص
    function addOption(questionBlock, optionData = {}) {
        optionCounter++;
        const questionId = $(questionBlock).data('id');

        // بررسی نوع سوال فعلی
        const questionType = $(questionBlock).find('.question-type-select').val();
        const isRequired = questionType === 'multiple_choice';

        const optionHtml = `
            <div class="option-block" data-id="${optionCounter}">
                <label>
                    <input type="checkbox" name="opt-is_correct-${questionId}" ${optionData.is_correct ? 'checked' : ''}>
                    گزینه صحیح
                </label>
                <input type="text" name="opt-text-${questionId}" placeholder="متن گزینه" value="${optionData.text || ''}" ${isRequired ? 'required' : ''}>
                <button type="button" class="remove-option">×</button>
            </div>
        `;
        $(questionBlock).find('.options-list').append(optionHtml);
    }

    // تابع برای اضافه کردن یک بلوک سوال جدید
    function addQuestion(questionData = {}) {
        questionCounter++;
        const currentQuestionId = questionCounter;

        const questionHtml = `
            <div class="question-block" data-id="${currentQuestionId}">
                <button type="button" class="remove-question">×</button>
                <h4>سوال ${currentQuestionId}</h4>

                <div class="grid">
                    <div>
                        <label for="q-text-${currentQuestionId}">متن سوال</label>
                        <input type="text" id="q-text-${currentQuestionId}" name="q-text-${currentQuestionId}" value="${questionData.text || ''}" required>
                    </div>
                    <div>
                        <label for="q-type-${currentQuestionId}">نوع سوال</label>
                        <select id="q-type-${currentQuestionId}" name="q-type-${currentQuestionId}" class="question-type-select">
                            <option value="multiple_choice">تستی (چند گزینه‌ای)</option>
                            <option value="descriptive">تشریحی</option>
                        </select>
                    </div>
                </div>

                <div class="grid">
                    <label for="q-time-${currentQuestionId}">زمان نمایش (ثانیه از شروع)</label>
                    <input type="number" id="q-time-${currentQuestionId}" name="q-display_time_seconds-${currentQuestionId}" value="${questionData.display_time_seconds || ''}" min="0" required>

                    <label for="q-duration-${currentQuestionId}">مدت نمایش سوال (ثانیه)</label>
                    <input type="number" id="q-duration-${currentQuestionId}" name="q-duration-${currentQuestionId}" value="${questionData.duration || ''}" min="1" required>
                </div>

                <!-- این div برای کنترل نمایش بخش گزینه‌ها استفاده می‌شود -->
                <div class="multiple-choice-controls">
                    <h5>گزینه‌ها:</h5>
                    <div class="options-list">
                        <!-- گزینه‌ها به صورت داینامیک اینجا اضافه می‌شوند -->
                    </div>
                    <button type="button" class="add-option secondary" data-question-id="${currentQuestionId}">افزودن گزینه</button>
                </div>
            </div>
        `;
        const $newQuestionBlock = $(questionHtml);
        $('#questions-container').append($newQuestionBlock);

        // اگر داده‌های قبلی وجود دارد، نوع سوال و گزینه‌ها را تنظیم کن
        if (questionData.question_type) {
            $newQuestionBlock.find('.question-type-select').val(questionData.question_type);

            // اگر سوال تشریحی بود، بخش گزینه‌ها را مخفی کن
            if (questionData.question_type === 'descriptive') {
                $newQuestionBlock.find('.multiple-choice-controls').hide();
            }
        }

        // اگر سوال تستی بود و گزینه‌ای داشت، آن‌ها را اضافه کن
        if (questionData.question_type !== 'descriptive' && questionData.options && questionData.options.length > 0) {
            questionData.options.forEach(opt => addOption($newQuestionBlock, opt));
        } else if (!questionData.options) {
            // برای سوالات تستی جدید، ۴ گزینه پیش‌فرض اضافه کن
            addOption($newQuestionBlock);
            addOption($newQuestionBlock);
            addOption($newQuestionBlock);
            addOption($newQuestionBlock);
        }
    }
    $('#questions-container').on('change', '.question-type-select', function() {
    const selectedType = $(this).val();
    const $questionBlock = $(this).closest('.question-block');
    const $optionsContainer = $questionBlock.find('.multiple-choice-controls');

    // <-- تغییر کلیدی اینجاست: سلکتور صحیح برای پیدا کردن اینپوت‌ها
    const $optionInputs = $questionBlock.find('input[name^="opt-text-"]');

    if (selectedType === 'descriptive') {
        $optionsContainer.slideUp();
        $optionInputs.prop('required', false); // حالا این دستور درست کار می‌کند

    } else { // یعنی multiple_choice انتخاب شده
        $optionsContainer.slideDown();
        $optionInputs.prop('required', true);  // و این هم همینطور
    }
});
    // رویداد برای اضافه کردن سوال جدید
    $('#add-question').click(function() {
        addQuestion();
    });

    // رویداد برای حذف سوال
    $('#questions-container').on('click', '.remove-question', function() {
        $(this).closest('.question-block').remove();
    });

    // رویداد برای اضافه کردن گزینه جدید به یک سوال
    $('#questions-container').on('click', '.add-option', function() {
        const questionBlock = $(this).closest('.question-block');
        addOption(questionBlock);
    });

    // رویداد برای حذف گزینه
    $('#questions-container').on('click', '.remove-option', function() {
        $(this).closest('.option-block').remove();
    });

    function showDashboard(data, adminSecret) {
        const linksHtml = `
            <button style="margin-bottom: 70px" type="button" onclick="downloadResults(${data.id})" >دریافت نتایج نهایی</button>
            
            <button style="background-color: red" type="button" onclick="deleteAnswers('${data.admin_secret}')" >حذف تنایج</button>
            
        `;

        $('#links-container').html(linksHtml);
        $('#dashboard-actions').show();

        // ذخیره adminSecret در یک دیتای پنهان برای استفاده دکمه‌ها
        $('#dashboard-actions').data('secret', adminSecret);
        switch (data.status) {
            case "pending":
                $('#pend-btn').addClass('secondary').removeClass('contrast').attr('disabled', 'disabled');
                break;
            case "active":
                $('#start-btn').addClass('secondary').removeClass('contrast').attr('disabled', 'disabled');
                break;
            case "finished":
                $('#stop-btn').addClass('secondary').removeClass('contrast').attr('disabled', 'disabled');
                break;
            default:
                console.warn('Unknown status:', data.status);
        }

        // اسکرول به پایین برای دیدن نتایج
        // $('html, body').animate({ scrollTop: $('#dashboard-actions').offset().top }, 500);
    }

    // منطق دکمه شروع
    $('#start-btn').on('click', function() {
        const secret = $('#dashboard-actions').data('secret');
        $.post(`/api/admin/livestreams/${secret}/start`, function(response) {
            alert(response.message || "لایو شروع شد");
            $('#start-btn').addClass('secondary').removeClass('contrast').attr('disabled', 'disabled');
            $('#pend-btn').addClass('contrast').removeClass('secondary').removeAttr('disabled');
            $('#stop-btn').addClass('contrast').removeClass('secondary').removeAttr('disabled');
        }).fail(function(xhr) {
            alert("خطا: " + xhr.responseText);
        });
    });

    // منطق دکمه توقف
    $('#stop-btn').on('click', function() {
        const secret = $('#dashboard-actions').data('secret');
        $.post(`/api/admin/livestreams/${secret}/stop`, function(response) {
            alert(response.message || "لایو متوقف شد");
            $('#stop-btn').addClass('secondary').removeClass('contrast').attr('disabled', 'disabled');
            $('#pend-btn').addClass('contrast').removeClass('secondary').removeAttr('disabled');
            $('#start-btn').addClass('contrast').removeClass('secondary').removeAttr('disabled');
        }).fail(function(xhr) {
            alert("خطا: " + xhr.responseText);
        });
    });

    $('#pend-btn').on('click', function() {
        const secret = $('#dashboard-actions').data('secret');
        $.post(`/api/admin/livestreams/${secret}/pend`, function(response) {
            alert(response.message || "لایو در حالت انتظار هست");
            $('#pend-btn').addClass('secondary').removeClass('contrast').attr('disabled', 'disabled');
            $('#stop-btn').addClass('contrast').removeClass('secondary').removeAttr('disabled');
            $('#start-btn').addClass('contrast').removeClass('secondary').removeAttr('disabled');
        }).fail(function(xhr) {
            alert("خطا: " + xhr.responseText);
        });
    });

    // اصلاح تابع Load Livestream
    $('#load-livestream').click(function() {
        const adminSecret = $('#admin_secret').val().trim();
        if (!adminSecret) {
            alert('لطفا کلید ویرایش را وارد کنید.');
            return;
        }

        $.ajax({
            url: `/api/admin/livestreams/${adminSecret}`,
            type: 'GET',
            success: function(data) {
                $('#iframe_link').val(data.iframe_link);
                $('#title').val(data.title);
                $('#questions-container').empty();
                questionCounter = 0;
                optionCounter = 0;
                data.questions.forEach(q => addQuestion(q));
                $('#submit-btn').text('ویرایش و ذخیره تغییرات');

                // نمایش پنل مدیریت
                showDashboard(data, adminSecret);
            },
            error: function(xhr) {
                alert('لایوی با این کلید ویرایش یافت نشد: ' + xhr.responseText);
            }
        });
    });

    $('#livestream-form').submit(function(e) {
        e.preventDefault();

        const livestreamData = {
            title: $('#title').val(),
            iframe_link: $('#iframe_link').val(),
            questions: []
        };

        $('.question-block').each(function() {
            const questionBlock = $(this);
            const currentQuestionId = questionBlock.data('id');

            // خواندن نوع سوال از dropdown
            const questionType = questionBlock.find(`select[name="q-type-${currentQuestionId}"]`).val();

            const question = {
                text: questionBlock.find(`input[name="q-text-${currentQuestionId}"]`).val(),
                display_time_seconds: parseInt(questionBlock.find(`input[name="q-display_time_seconds-${currentQuestionId}"]`).val()),
                duration: parseInt(questionBlock.find(`input[name="q-duration-${currentQuestionId}"]`).val()),
                question_type: questionType, // اضافه کردن نوع سوال به داده‌های ارسالی
                options: []
            };

            // فقط اگر سوال تستی بود، گزینه‌ها را جمع‌آوری کن
            if (questionType === 'multiple_choice') {
                questionBlock.find('.option-block').each(function() {
                    const optionBlock = $(this);
                    const option = {
                        text: optionBlock.find(`input[name="opt-text-${currentQuestionId}"]`).val(),
                        is_correct: optionBlock.find(`input[name="opt-is_correct-${currentQuestionId}"]`).is(':checked')
                    };
                    question.options.push(option);
                });
            }

            livestreamData.questions.push(question);
        });

        const adminSecret = $('#admin_secret').val().trim();
        const isEditing = adminSecret !== '';

        const ajaxConfig = {
            url: isEditing ? `/api/admin/livestreams/${adminSecret}` : '/api/admin/livestreams',
            type: isEditing ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: JSON.stringify(livestreamData),
            success: function(data) {
                showDashboard(data, data.admin_secret);
                alert("عملیات با موفقیت انجام شد")
            },
            error: function(xhr) {
                // ... (بدون تغییر) ...
                alert('خطا در ذخیره سازی اطلاعات: ' + xhr.responseText);
            }
        };

        $.ajax(ajaxConfig);
    });

    // Check for admin_secret in URL to pre-fill the input
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('secret');
    if (secret) {
        $('#admin_secret').val(secret);
        $('#load-livestream').click();
    } else {
        addQuestion(); // Add one empty question block for new livestreams
    }

    $('#toggle-questions-btn').on('click', function() {
        const $container = $('#toggle-div');
        const $btn = $(this);

        $container.slideToggle(300, function() {
            // Change button text based on visibility
            if ($container.is(':visible')) {
                $btn.text('▼ مخفی کردن سوالات');
            } else {
                $btn.text('▶ نمایش سوالات');
            }
        });
    });



});
async function downloadResults(live_id) {
        try {
            const response = await fetch(`/api/admin/export-results/${live_id}`);

            if (!response.ok) throw new Error('خطا در دریافت فایل اکسل');

            // تبدیل پاسخ به Blob
            const blob = await response.blob();

            // ایجاد لینک دانلود موقت
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quiz_results_${live_id}.xlsx`; // نام فایل
            document.body.appendChild(a);
            a.click();

            // پاکسازی
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error:', error);
            alert('مشکلی در دانلود فایل اکسل پیش آمد.');
        }
    }
function deleteAnswers(admin_secret) {
    // ۱. پیام تایید را به کاربر نمایش می‌دهیم
    const message = "آیا از حذف تمام پاسخ‌ها و کاربران این لایو مطمئن هستید؟\nاین عمل قابل بازگشت نیست!";

    if (window.confirm(message)) {
        // ۲. اگر کاربر روی "OK" کلیک کرد، این بخش اجرا می‌شود
        console.log("کاربر تایید کرد. در حال ارسال درخواست حذف...");

        $.ajax({
            url: `/api/admin/livestreams/delete-answers/${admin_secret}`,
            method: 'DELETE',
            success: function(response) {
                alert("تمام پاسخ‌ها و کاربران با موفقیت حذف شدند.");
            },
            error: function(xhr) {
                console.error("خطا در حذف:", xhr.responseJSON ? xhr.responseJSON.detail : "خطای شبکه");
                alert("خطایی در هنگام حذف رخ داد. لطفاً دوباره تلاش کنید.");
            }
        });

    } else {
        // ۳. اگر کاربر روی "Cancel" کلیک کرد، هیچ اتفاقی نمی‌افتد
        console.log("عملیات حذف توسط کاربر لغو شد.");
    }
}