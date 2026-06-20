import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import api, { authService } from './services/api';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CustomCursor from './components/common/CustomCursor';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RepoDetail from './pages/RepoDetail';
import Auth from './pages/Auth';
import About from './pages/About';
import './App.css';
import AIPopup from './components/common/AIPopup';
import SearchResults from './pages/SearchResults';
import Explore from './pages/Explore';

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

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    handleLogout(false);
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
                handleLogout={() => handleLogout(true)}
                toggleMobileMenu={toggleMobileMenu}
                isMobileMenuOpen={isMobileMenuOpen}
            />

            <AIPopup isLoggedIn={auth.isLoggedIn} />
            <main style={{ flexGrow: 1 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/repo/:ownerName/:repoName" element={<RepoDetail />} />
                    <Route path="/auth" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/explore" element={<Explore />} />
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

            {/* Mobile Navigation Menu */}
            <div className={`ch-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                <Link to="/" onClick={toggleMobileMenu}>Home</Link>
                {/* <Link to="/explore" onClick={toggleMobileMenu}>Explore</Link> */}
                <Link to="/about" onClick={toggleMobileMenu}>About</Link>
                {auth.isLoggedIn ? (
                    <>
                        <Link to="/dashboard" onClick={toggleMobileMenu}>Dashboard</Link>
                        <button
                            className="ch-create-btn"
                            style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '12px', fontSize: '1rem' }}
                            onClick={() => {
                                toggleMobileMenu();
                                handleLogout(true);
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            Sign Out
                        </button>
                    </>
                ) : (
                    <Link to="/auth?mode=login" className="auth-btn primary" style={{ justifyContent: 'center', marginTop: '20px' }} onClick={toggleMobileMenu}>Sign In</Link>
                )}
            </div>
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