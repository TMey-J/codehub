// file: backend/app/static/js/lives.js

let ws; // متغیر سراسری برای نگهداری شیء WebSocket
let questionCountdown; // متغیر سراغی برای تایمر سوال
let questionNumber = 1;
let currentQuestionId = null; // ✅ اضافه شدن برای ذخیره امن آی‌دی سوال فعلی در حافظه مرورگر

$(document).ready(function() {
    // بررسی اینکه آیا کاربر قبلا وارد شده است یا نه
    const storedUser = localStorage.getItem('live_user_data_' + publicId);
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        $.ajax({
            url: `/api/live/user`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                session_id: userData.session_id,
                public_id: publicId
            }),
            success: function(response) {
                if(response){
                    showLiveSection(userData);
                    connectWebSocket(userData.session_id); // اتصال به WebSocket
                } else {
                    localStorage.removeItem('live_user_data_' + publicId);
                    sessionStorage.removeItem('live_user_data_' + publicId);
                    $('.container').show();
                }
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON ? xhr.responseJSON.detail : "خطایی رخ داد. لطفا دوباره تلاش کنید.";
                alert(errorMsg)
            }
        });

    } else {
        $('.container').show();
    }

    let isPhoneNumberCorrect = false;
    $('#phone_number').on('input', function() {
        const phoneNumber = $(this).val();
        const regex = /^09\d{9}$/; // Regex استاندارد برای موبایل ایران

        if (regex.test(phoneNumber)) {
            $(this).removeClass('invalid-input');
            $('#phone_error').hide();
            isPhoneNumberCorrect = true;
        } else {
            $(this).addClass('invalid-input');
            $('#phone_error').text("فرمت شماره موبایل صحیح نیست").show();
            isPhoneNumberCorrect = false;
        }
    });

    $('#login-form').on('submit', function(e) {
        e.preventDefault();

        if (!isPhoneNumberCorrect) return;

        const fullName = $('#full_name').val();
        const phoneNumber = $('#phone_number').val();
        const loginButton = $('#login-button');
        const loginError = $('#login-error');

        loginButton.attr('aria-busy', 'true').prop('disabled', true);
        loginError.text('');

        $.ajax({
            url: `/api/live/register`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                public_id: publicId,
                full_name: fullName,
                phone_number: phoneNumber
            }),
            success: function(response) {
                localStorage.setItem('live_user_data_' + publicId, JSON.stringify(response));
                showLiveSection(response);
                connectWebSocket(response.session_id);
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON ? xhr.responseJSON.detail : "خطایی رخ داد. لطفا دوباره تلاش کنید.";
                loginError.text(errorMsg);
            },
            complete: function() {
                loginButton.attr('aria-busy', 'false').prop('disabled', false);
            }
        });
    });

    function showLiveSection(userData) {
        $.get(`/api/live/info`, function(data) {
            $('.container').hide();
            $('.quiz-container').show();
            $('#user-display-name').text(userData.full_name);
            $('#title').text(data.title);
            $('.video-placeholder').html(data.iframe_link);
        });
    }

    function connectWebSocket(session_id) {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsUrl = `${wsProtocol}${window.location.host}/api/ws/${publicId}/${session_id}`;

        ws = new WebSocket(wsUrl);

        ws.onopen = function(event) {
            console.log("WebSocket Connected!");
        };

        ws.onmessage = function(event) {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case "show_question":
                    currentQuestionId = message.data.id; // ✅ ذخیره آی‌دی سوال فعلی
                    displayQuestion(message.data);
                    questionNumber = questionNumber + 1;
                    break;
                case "hide_question":
                    // ✅ قبل از پاک کردن صفحه، اگر پاسخ تشریحی فرستاده نشده، آخرین وضعیت را بفرست
                    sendDescriptiveAnswer();
                    $('#options-container').hide();
                    $('.question-text').text('');
                    $('.question-number').text('');
                    currentQuestionId = null; // ریسیت کردن آی‌دی سوال
                    break;
                case "end_live":
                    $('#options-container').hide();
                    $('.question-text').text('');
                    $('.question-number').text('');
                    $('.video-placeholder').html(`<h2 style="align-self: center;">${message.data.message}</h2>`);
                    if (ws) ws.close();
                    localStorage.removeItem('live_user_data_' + publicId);
                    sessionStorage.removeItem('live_user_data_' + publicId);
                    break;
            }
        };

        ws.onclose = function(event) {
            console.log("WebSocket Disconnected. Reconnecting...");
            // پایداری: تلاش برای اتصال مجدد پس از ۵ ثانیه در صورت قطعی اینترنت کاربر
            setTimeout(() => {
                const storedUser = localStorage.getItem('live_user_data_' + publicId);
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    connectWebSocket(userData.session_id);
                }
            }, 5000);
        };

        ws.onerror = function(error) {
            console.error("WebSocket Error:", error);
        };
    }

    function displayQuestion(questionData) {
        if (questionCountdown) {
            clearInterval(questionCountdown);
        }
        $('#options-container').off('click', '.option-box');

        const $optionsContainer = $('#options-container');
        $optionsContainer.empty();

        $('.question-number').text(` سوال شماره ${questionNumber}`);
        $('.question-text').text(questionData.text);

        if (questionData.question_type === 'descriptive') {
            const descriptiveForm = `
                <div class="descriptive-answer-container">
                    <textarea name="answer_text" class="answer-textarea" placeholder="پاسخ خود را اینجا بنویسید..."></textarea>
                    <button class="submit-answer-btn" onclick="handleDescriptiveSubmit(event)">ارسال پاسخ</button>
                </div>
            `;
            $optionsContainer.html(descriptiveForm);
        } else {
            questionData.options.forEach(option => {
                const optionButton = `
                <div class="option-box" data-option-id="${option.id}">${option.text}</div>`;
                $optionsContainer.append(optionButton);
            });
        }

        $optionsContainer.show();

        let timerSeconds = questionData.duration;
        const $timerElement = $('#countdown');

        function formatTime(totalSeconds) {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        $timerElement.text(formatTime(timerSeconds));
        $timerElement.removeClass('text-danger');

        questionCountdown = setInterval(() => {
            timerSeconds--;
            $timerElement.text(formatTime(timerSeconds));

            if (timerSeconds <= 10 && timerSeconds > 0) {
                $timerElement.addClass('text-danger');
            } else if (timerSeconds > 10) {
                $timerElement.removeClass('text-danger');
            }

            if (timerSeconds <= 0) {
                clearInterval(questionCountdown);
                $timerElement.removeClass('text-danger');
                $timerElement.text("00:00");
                // غیرفعال کردن گزینه‌ها در پایان زمان سوال برای جلوگیری از ارسال تقلب
                $('.option-box').addClass('disabled').css('pointer-events', 'none');
                $('.submit-answer-btn').prop('disabled', true);
                $('.answer-textarea').prop('disabled', true);
            }
        }, 1000);

        // رویداد کلیک سوالات تستی
        $('#options-container').on('click', '.option-box', function() {
            const selectedOptionId = $(this).data('option-id');
            const answer = {
                question_id: questionData.id,
                selected_option_id: parseInt(selectedOptionId)
            };

            sendAnswer(answer); // ارسال به متد بهینه‌شده Ajax

            // استایل دهی و قفل کردن گزینه‌ها پس از یک‌بار کلیک
            $('.option-box').css('pointer-events', 'none').css('opacity', '0.6');
            $(this).css('opacity', '1').html(`✅ ${$(this).text()}`).addClass('selected-option');
        });
    }
});

// تابع ارسال پاسخ تشریحی (به صورت خودکار در انتهای زمان سوال، یا کلیک روی دکمه)
function sendDescriptiveAnswer() {
    if (!currentQuestionId) return;

    const $textarea = $('#options-container').find('.answer-textarea');
    if ($textarea.length === 0 || $textarea.prop('disabled')) return; // اگر قبلا ارسال شده یا وجود ندارد، کاری نکن

    const answerText = $textarea.val().trim();
    if (answerText) {
        const answer = {
            question_id: currentQuestionId,
            answer_text: answerText
        };
        sendAnswer(answer);
        $textarea.prop('disabled', true);
        $('.submit-answer-btn').text('ارسال شد').prop('disabled', true);
    }
}

// دکمه دستی ارسال پاسخ تشریحی
function handleDescriptiveSubmit(event) {
    event.preventDefault();
    sendDescriptiveAnswer();
}

// ✅ تغییر کلیدی: ارسال پاسخ‌ها از طریق HTTP POST جهت حفظ پایداری وب‌سوکت و سرور خانگی
function sendAnswer(answerData) {
    const storedUser = localStorage.getItem('live_user_data_' + publicId);
    if (!storedUser) return;

    const userData = JSON.parse(storedUser); // شامل id و session_id است

    $.ajax({
        url: `/api/live/answer?session_id=${userData.session_id}`, // ✅ ارسال سشن آی‌دی غیرقابل حدس
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(answerData),
        success: function(response) {
            console.log("پاسخ ثبت شد");
        },
        error: function(xhr) {
            console.error("خطا:", xhr.responseJSON ? xhr.responseJSON.detail : "خطای شبکه");
        }
    });
}