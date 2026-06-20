import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="ch-footer">
            <div className="footer-links">
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/terms">Terms of Service</Link>
            </div>
            <p>&copy; {new Date().getFullYear()} CodeHub. All rights reserved.</p>
        </footer>
    );
};

export default Footer;