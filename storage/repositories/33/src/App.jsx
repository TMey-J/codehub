import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { authService } from './services/api';


// ایمپورت کامپوننت‌های مشترک
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CustomCursor from './components/common/CustomCursor';

// ایمپورت صفحات
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RepoDetail from './pages/RepoDetail';
import Auth from './pages/Auth';

import './App.css';

// کامپوننت اسکرول به بالا در زمان تغییر صفحه
const RouteChangeObserver = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

function App() {
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem("access_token");
        return {
            isLoggedIn: !!token,
            token,
            user: null,
        };
    });

    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (auth.token && !auth.user) {
            fetchUserInfo();
        }
    }, [auth.token]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isMobileMenuOpen]);

    const fetchUserInfo = async () => {
        try {
            const { data } = await authService.getUserInfo();
            if (data && data.is_success) {
                setAuth(prev => ({
                    ...prev,
                    user: data.response,
                }));
            }
        } catch (err) {
            console.error("User info error:", err);
            // در صورت منقضی شدن توکن، کاربر رو خارج می‌کنیم
            if (err.response && err.response.status === 401) {
                handleLogout();
            }
        }
    };

    const handleLoginSuccess = (token) => {
        localStorage.setItem("access_token", token);
        setAuth({
            isLoggedIn: true,
            token,
            user: null, // در افکت بعدی خودش یوزر رو دریافت می‌کنه
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setAuth({
            isLoggedIn: false,
            token: null,
            user: null,
        });
    };

    const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

    return (
        <Router>
            <RouteChangeObserver />
            <div className="ch-app-wrapper">
                <CustomCursor />
                <Navbar
                    isLoggedIn={auth.isLoggedIn}
                    user={auth.user}
                    handleLogout={handleLogout}
                    toggleMobileMenu={toggleMobileMenu}
                />
                
                <main style={{ flexGrow: 1 }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/repo/:repoName" element={<RepoDetail />} />
                      <Route path="/auth" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </main>
                
                <Footer />
            </div>
        </Router>
    );
}

export default App;