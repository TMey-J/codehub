import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// آیکون MessageSquare حذف شد
import { Sparkles, X, ArrowLeft } from 'lucide-react';

const AIPopup = ({ isLoggedIn }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            const hasSeenPopup = localStorage.getItem('ai_popup_seen');
            if (!hasSeenPopup) {
                // نمایش پاپ‌آپ با کمی تاخیر برای جذابیت بیشتر
                setTimeout(() => setIsOpen(true), 800);
            }
        }
    }, [isLoggedIn]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('ai_popup_seen', 'true');
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!prompt.trim()) return;
        
        handleClose();
        // انتقال به صفحه نتایج با پارامتر سرچ
        navigate(`/search?q=${encodeURIComponent(prompt)}`);
        setPrompt('');
    };



    if (!isLoggedIn) return null;

    return (
        <>
            {/* دکمه شناور */}
            <button 
                className="ai-floating-btn"
                onClick={() => setIsOpen(true)}
                title="جستجوی هوشمند"
            >
                <Sparkles size={24} />
            </button>

            {/* پاپ‌آپ شیشه‌ای */}
            {isOpen && (
                <div className="ai-popup-overlay">
                    <div className="ai-popup-box">
                        <button className="ai-close-btn" onClick={handleClose}>
                            <X size={20} />
                        </button>
                        
                        <div className="ai-popup-header">
                            <div className="ai-icon-wrapper">
                                <Sparkles size={32} className="ai-sparkle-icon" />
                            </div>
                            <h2>دستیار هوشمند CodeHub</h2>
                            <p>به دنبال چه پروژه یا ریپازیتوری خاصی هستی؟ برام بنویس تا پیداش کنم.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="ai-popup-form">
                            <div className="ai-input-group">
                                {/* استفاده از textarea به جای input */}
                                <textarea
                                    className="ai-textarea"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="مثلاً: پروژه فرانت‌اند با React و Tailwind... "
                                    autoFocus
                                    rows={1}
                                />
                            </div>
                            <button type="submit" className="ai-submit-btn" disabled={!prompt.trim()}>
                                جستجو با هوش مصنوعی <ArrowLeft size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIPopup;