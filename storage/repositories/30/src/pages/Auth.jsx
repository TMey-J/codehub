import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const Auth = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    // تنظیم حالت صفحه (ورود یا ثبت‌نام) بر اساس پارامترهای URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const m = params.get("mode");
        if (m === "register" || m === "login") {
            setMode(m);
        }
    }, [location.search]);

    // محاسبه قدرت رمز عبور برای افکت‌های بصری
    const passwordStrength = (() => {
        const p = form.password;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[a-z]/.test(p)) score++;
        if (/\d/.test(p)) score++;
        return score;
    })();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === "login") {
                const { data } = await authService.login({ username: form.username, password: form.password });
                if (data.is_success && data.response?.access_token) {
                    onLoginSuccess(data.response.access_token);
                    navigate("/dashboard");
                } else {
                    throw new Error(data?.errors?.[0] || "Authentication failed");
                }
            } else {
                // حالت ثبت نام
                const { data: regData } = await authService.register({
                    username: form.username,
                    email: form.email,
                    password: form.password
                });

                if (regData.is_success) {
                    // لاگین خودکار بلافاصله بعد از ثبت نام
                    const { data: loginData } = await authService.login({ 
                        username: form.username, 
                        password: form.password 
                    });
                    
                    if (loginData.is_success && loginData.response?.access_token) {
                        onLoginSuccess(loginData.response.access_token);
                        navigate("/dashboard");
                    }
                } else {
                    throw new Error(regData?.errors?.[0] || "Registration failed");
                }
            }
        } catch (err) {
            setError(err.response?.data?.errors?.[0] || err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container content-fade-in">
            <div className={`auth-card ${mode}`}>
                <div className="auth-particles" />
                <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
                
                <form onSubmit={submit}>
                    <div className="field">
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            placeholder=" "
                        />
                        <label>Username</label>
                    </div>
                    
                    {mode === "register" && (
                        <div className="field">
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label>Email</label>
                        </div>
                    )}
                    
                    <div className="field">
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder=" "
                        />
                        <label>Password</label>
                        {mode === "register" && (
                            <div className={`strength s${passwordStrength}`}>
                                <span />
                            </div>
                        )}
                    </div>
                    
                    {error && <div className="auth-error">{error}</div>}
                    
                    <button type="submit" disabled={loading}>
                        {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
                    </button>
                </form>
                
                <p className="switch">
                    <button
                        type="button"
                        className="switch-btn"
                        onClick={() => {
                            setMode(mode === "login" ? "register" : "login");
                            setError("");
                        }}
                    >
                        {mode === "login" ? " Sign up" : " Login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;