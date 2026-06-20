import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import api, { authService } from './services/api'; // اضافه شدن api برای interceptor
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CustomCursor from './components/common/CustomCursor';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RepoDetail from './pages/RepoDetail';
import Auth from './pages/Auth';
import './App.css';
import AIPopup from './components/common/AIPopup';
import SearchResults from './pages/SearchResults';

// کامپوننت محافظت از مسیر
const ProtectedRoute = ({ isLoggedIn, children }) => {
    if (!isLoggedIn) {
        return <Navigate to="/auth?mode=login" replace />;
    }
    return children;
};

const RouteChangeObserver = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

// انتقال منطق برنامه به کامپوننت داخلی
const AppContent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem("access_token");
        return {
            isLoggedIn: !!token,
            token,
            user: null,
        };
    });
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

const handleLogout = useCallback((isManual = false) => {
        if (isManual) {
            navigate('/');
        } else {
            navigate('/auth?mode=login');
        }

        setTimeout(() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setAuth({
                isLoggedIn: false,
                token: null,
                user: null,
            });
        }, 10);
    }, [navigate]);

    // استفاده از Interceptor سراسری برای گرفتن خطای ۴۰۱ از تمام ریکوئست‌های داشبورد بدون رفرش
    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                // اگر ارور 401 (احراز هویت) بود، کاربر را خودکار بیرون میندازیم
                if (error.response && error.response.status === 401) {
                    handleLogout(false); // خروج خودکار
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [handleLogout]);

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
            // اینجا هم مفسر بالا عمل خواهد کرد، اما محض اطمینان:
            if (err.response && err.response.status === 401) {
                handleLogout(false);
            }
        }
    };

    const handleLoginSuccess = (token) => {
        localStorage.setItem("access_token", token);
        setAuth({
            isLoggedIn: true,
            token,
            user: null,
        });
    };

    const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

    return (
        <div className="ch-app-wrapper">
            <CustomCursor />
            <Navbar
                isLoggedIn={auth.isLoggedIn}
                user={auth.user}
                // ارسال true به این معنی که خروج دستی بوده است
                handleLogout={() => handleLogout(true)}
                toggleMobileMenu={toggleMobileMenu}
            />

            <AIPopup isLoggedIn={auth.isLoggedIn} />
            <main style={{ flexGrow: 1 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/repo/:ownerName/:repoName" element={<RepoDetail />} />
                    <Route path="/auth" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute isLoggedIn={auth.isLoggedIn}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <Router>
            <RouteChangeObserver />
            <AppContent />
        </Router>
    );
}

export default App;