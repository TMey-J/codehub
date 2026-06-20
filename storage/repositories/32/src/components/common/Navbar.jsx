import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// مجموعه آیکون‌های استفاده شده در نوبار
const ICONS = {
    Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
};

const Navbar = ({ isLoggedIn, user, handleLogout, toggleMobileMenu }) => {
    const [isProfileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="ch-navbar">
            <div className="ch-nav-left">
                <Link to="/" className="ch-logo-area">
                    <svg width="35" height="35" viewBox="0 0 500 500" className="app-logo">
                        <g fill="#a855f7">
                            <path d=" M 209.92 9.62 C 228.81 6.81 248.07 4.96 267.15 6.90 C 313.64 9.70 359.10 26.57 396.47 54.34 C 435.59 83.25 465.87 124.04 481.91 169.99 C 491.06 195.52 495.35 222.60 495.96 249.65 C 480.72 238.38 462.80 230.87 444.19 227.42 C 435.49 225.80 426.70 224.45 417.85 224.05 C 391.46 221.88 364.75 224.98 339.18 231.68 C 319.72 236.89 301.23 245.01 282.18 251.47 C 271.17 255.06 259.62 257.61 247.97 257.16 C 240.01 256.84 232.76 253.30 225.26 251.05 C 244.14 230.32 269.92 218.00 295.39 207.40 C 331.02 192.17 368.54 179.97 400.47 157.42 C 415.64 146.51 429.06 132.54 436.99 115.44 C 402.87 108.69 367.45 106.51 333.08 112.71 C 302.14 118.26 272.84 131.81 247.98 150.96 C 226.44 167.40 208.02 187.58 191.85 209.24 C 186.58 209.90 181.25 209.45 176.02 208.67 C 149.33 207.21 121.64 208.75 96.89 219.74 C 75.10 229.09 57.17 247.15 48.33 269.19 C 42.58 282.31 47.84 299.55 60.78 306.23 C 73.29 313.33 86.72 318.66 99.94 324.20 C 98.68 324.23 96.17 324.28 94.92 324.31 C 70.83 329.23 46.57 335.17 24.65 346.62 C 15.46 324.37 9.32 300.85 6.87 276.90 C 6.03 264.31 4.67 251.63 6.01 239.00 C 8.55 175.77 37.59 114.25 84.17 71.47 C 118.85 39.16 163.17 17.38 209.92 9.62 Z" />
                            <path d=" M 122.63 251.43 C 119.71 244.46 123.86 234.57 132.05 234.17 C 140.27 232.06 146.07 240.20 148.39 246.98 C 146.04 252.67 141.70 258.68 135.03 259.20 C 130.06 258.70 124.30 256.66 122.63 251.43 Z" />
                            <path d=" M 418.08 257.15 C 428.19 254.65 438.65 253.80 449.03 253.81 C 465.17 254.41 481.22 258.78 495.28 266.76 C 493.95 288.09 490.01 309.31 483.00 329.52 C 473.75 314.13 458.10 302.19 440.16 299.36 C 429.39 297.30 418.35 301.37 409.73 307.72 C 397.55 317.14 387.68 329.04 377.26 340.26 C 362.63 356.53 345.05 370.67 324.46 378.56 C 321.09 379.97 317.51 380.79 314.13 382.16 C 313.47 382.26 312.14 382.46 311.47 382.56 L 311.56 383.33 C 310.18 383.39 308.81 383.47 307.45 383.56 L 307.49 384.61 C 306.69 384.56 305.10 384.47 304.30 384.42 L 304.63 385.78 C 304.05 385.61 302.90 385.27 302.32 385.10 L 302.68 386.39 C 301.20 386.40 299.71 386.38 298.24 386.32 C 298.37 386.58 298.65 387.10 298.78 387.35 C 297.66 387.40 295.42 387.51 294.29 387.56 L 294.76 388.38 C 292.99 388.52 289.45 388.80 287.69 388.94 C 295.87 392.04 304.30 394.67 312.96 396.04 C 332.99 398.90 353.26 394.28 371.78 386.74 C 386.34 381.64 399.62 372.69 415.12 370.52 C 421.98 369.55 427.86 374.15 431.92 379.16 C 436.91 385.52 441.87 391.92 446.88 398.27 C 424.90 428.01 395.82 452.41 363.00 469.40 C 310.57 496.64 248.19 503.66 190.98 489.21 C 147.48 478.42 107.13 455.23 75.85 423.15 C 57.24 404.44 41.95 382.51 30.27 358.88 C 37.12 358.00 44.03 357.62 50.89 356.91 C 61.28 356.53 71.68 356.52 82.07 356.92 C 95.36 358.19 108.72 359.06 121.90 361.38 C 155.70 366.77 189.58 375.67 224.06 372.63 C 250.02 370.27 274.22 357.74 293.50 340.56 C 295.08 339.06 296.74 337.64 298.49 336.34 C 316.14 322.86 332.62 307.95 349.61 293.68 C 369.74 277.25 392.58 263.24 418.08 257.15 Z" />
                        </g>
                    </svg>
                    <span className="ch-brand">CODEHUB</span>
                </Link>
                <div className="ch-search-wrapper">
                    <ICONS.Search />
                    <input type="text" placeholder="Explore projects..." />
                </div>
            </div>

            <div className="ch-nav-right">
                {/* <Link to="#">Marketplace</Link>
                <Link to="#">Community</Link> */}
                {/* <button className="ch-icon-btn"><ICONS.Bell /></button> */}
                <Link 
                    to={isLoggedIn ? "/dashboard" : "/auth?mode=login"} 
                    className="ch-create-btn"
                    style={{ textDecoration: 'none' }}
                >
                    <ICONS.Plus /> New
                </Link>
                
                <div className="ch-avatar-container" ref={profileRef}>
                    <div className="ch-avatar" onClick={() => setProfileOpen(prev => !prev)}>
                        <ICONS.User />
                    </div>
                    {isProfileOpen && (
                        <div className="ch-profile-dropdown content-fade-in">
                            {isLoggedIn ? (
                                <>
                                    {user && (
                                        <div className="ch-user-info">
                                            <div className="ch-user-name">{user.username}</div>
                                            <div className="ch-user-email">{user.email}</div>
                                        </div>
                                    )}
                                    {/* اضافه شدن لینک داشبورد */}
                                    <Link to="/dashboard" onClick={() => setProfileOpen(false)}>
                                        <ICONS.Settings /> Dashboard
                                    </Link>
                                    {/* <Link to="#"><ICONS.User /> Profile</Link> */}
                                    <div className="divider"></div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setProfileOpen(false);
                                        }}
                                    >
                                        <ICONS.LogOut /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/auth?mode=login"
                                        className="auth-btn primary"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/auth?mode=register"
                                        className="auth-btn"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <button className="ch-hamburger-menu" onClick={toggleMobileMenu}>
                <ICONS.Menu />
            </button>
        </nav>
    );
};

export default Navbar;