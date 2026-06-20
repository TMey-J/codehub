import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Code, Layers, Users, Zap, Globe, Shield,
    Database, Cpu, Palette, Bug, FileText, Server,
    Sparkles, GitBranch, Cloud, Lock, Smartphone,
    Monitor, ArrowRight, Languages, Heart, Target,
    UserCog, Braces, PenTool, SearchCheck, HardDrive,
    Crown, Terminal, TestTube, BookOpen, Binary
} from 'lucide-react';

const content = {
    en: {
        heroTitle: "About",
        heroHighlight: "CodeHub",
        heroSubtitle: "The ultimate platform for code collaboration, discovery, and innovation. Built by developers, for developers.",
        projectTitle: "What is CodeHub?",
        projectDesc: "CodeHub is a modern, open-source code hosting and collaboration platform designed to streamline the way developers discover, share, and work on projects. With a focus on user experience, performance, and community-driven development, CodeHub provides a seamless environment for both individual developers and teams.",
        featuresTitle: "Key Features",
        features: [
            { icon: GitBranch, title: "Repository Management", desc: "Create, browse, and manage Git repositories with an intuitive interface. Full support for branches, commits, and pull requests." },
            { icon: SearchCheck, title: "Advanced Search", desc: "Powerful search capabilities to find repositories, code snippets, and developers across the platform instantly." },
            { icon: Cloud, title: "Cloud-Based Storage", desc: "All your code is securely stored and accessible from anywhere. Automatic backups and version history included." },
            { icon: Users, title: "Team Collaboration", desc: "Built-in tools for code review, issue tracking, and team discussions to boost productivity." },
            { icon: Shield, title: "Security First", desc: "Enterprise-grade security with role-based access control, encrypted connections, and vulnerability scanning." },
            { icon: Monitor, title: "Modern UI/UX", desc: "A sleek, responsive interface with glassmorphism design, smooth animations, and both light/dark themes." }
        ],
        teamTitle: "Meet Our Team",
        teamSubtitle: "A passionate group of developers working together to build something amazing.",
        team: [
            { name: "Mohammad Ali Najafzadeh", role: "Project Manager", icon: Crown, color: "#f59e0b", bio: "Leading the vision, roadmap, and overall coordination of the CodeHub project." },
            { name: "Taha Meymene", role: "Backend Developer", icon: Server, color: "#10b981", bio: "Building robust APIs, server architecture, and ensuring high-performance data processing." },
            { name: "Reza Dehghani", role: "Frontend Developer", icon: Braces, color: "#3b82f6", bio: "Crafting responsive, interactive user interfaces with React and modern web technologies." },
            { name: "Reza Charstad", role: "UI/UX Designer", icon: PenTool, color: "#a855f7", bio: "Designing intuitive, beautiful interfaces and ensuring the best user experience across the platform." },
            { name: "Ali Mosallanejad", role: "Tester & Documentarian", icon: BookOpen, color: "#ef4444", bio: "Ensuring code quality through rigorous testing and maintaining comprehensive project documentation." },
            { name: "Amirhossein Hassani", role: "Database Engineer", icon: Database, color: "#06b6d4", bio: "Designing efficient database schemas, optimizing queries, and managing data integrity." }
        ],
        langLabel: "فارسی",
        ctaText: "Explore Repositories",
        statsCodehub: "Open Source",
        statsTeam: "6 Members",
        statsFeatures: "Many Features"
    },
    fa: {
        heroTitle: "درباره",
        heroHighlight: "کدهاب",
        heroSubtitle: "پلتفرم نهایی برای همکاری، کشف و نوآوری در کدنویسی. ساخته شده توسط توسعه‌دهندگان، برای توسعه‌دهندگان.",
        projectTitle: "کدهاب چیست؟",
        projectDesc: "کدهاب یک پلتفرم مدرن و متن‌باز برای میزبانی و همکاری روی کد است که با هدف ساده‌سازی فرآیند کشف، اشتراک‌گذاری و کار روی پروژه‌ها طراحی شده است. با تمرکز بر تجربه کاربری، عملکرد و توسعه جامعه‌محور، کدهاب محیطی یکپارچه برای توسعه‌دهندگان فردی و تیم‌ها فراهم می‌کند.",
        featuresTitle: "قابلیت‌های کلیدی",
        features: [
            { icon: GitBranch, title: "مدیریت مخازن", desc: "ایجاد، مرور و مدیریت مخازن گیت با رابط کاربری intuitive. پشتیبانی کامل از برنچ‌ها، کامیت‌ها و درخواست‌های ادغام." },
            { icon: SearchCheck, title: "جستجوی پیشرفته", desc: "قابلیت‌های جستجوی قدرتمند برای یافتن مخازن، قطعات کد و توسعه‌دهندگان در سراسر پلتفرم، به صورت لحظه‌ای." },
            { icon: Cloud, title: "ذخیره‌سازی ابری", desc: "تمام کدهای شما به صورت امن ذخیره شده و از هر جایی قابل دسترسی است. پشتیبان‌گیری خودکار و تاریخچه نسخه‌ها." },
            { icon: Users, title: "همکاری تیمی", desc: "ابزارهای داخلی برای بازبینی کد، پیگیری مسائل و بحث‌های تیمی برای افزایش بهره‌وری." },
            { icon: Shield, title: "امنیت بالا", desc: "امنیت در سطح سازمانی با کنترل دسترسی مبتنی بر نقش، ارتباطات رمزنگاری شده و اسکن آسیب‌پذیری." },
            { icon: Monitor, title: "رابط کاربری مدرن", desc: "رابط کاربری شیک و واکنش‌گرا با طراحی گلس‌مورفیسم، انیمیشن‌های نرم و پشتیبانی از تم روشن و تاریک." }
        ],
        teamTitle: "آشنایی با تیم ما",
        teamSubtitle: "گروهی پرشور از توسعه‌دهندگان که با هم برای ساختن چیزی فوق‌العاده تلاش می‌کنند.",
        team: [
            { name: "محمد علی نجف زاده", role: "مدیر پروژه", icon: Crown, color: "#f59e0b", bio: "هدایت چشم‌انداز، نقشه راه و هماهنگی کلی پروژه کدهاب." },
            { name: "طاها میمنه", role: "توسعه‌دهنده بک‌اند", icon: Server, color: "#10b981", bio: "ساخت APIهای قدرتمند، معماری سرور و تضمین پردازش داده با کارایی بالا." },
            { name: "رضا دهقانی", role: "توسعه‌دهنده فرانت‌اند", icon: Braces, color: "#3b82f6", bio: "ساخت رابط‌های کاربری واکنش‌گرا و تعاملی با React و تکنولوژی‌های مدرن وب." },
            { name: "رضا چارستاد", role: "طراح UI/UX", icon: PenTool, color: "#a855f7", bio: "طراحی رابط‌های کاربری زیبا و intuitive و تضمین بهترین تجربه کاربری در سراسر پلتفرم." },
            { name: "علی مصلی نژاد", role: "تستر و مستندساز", icon: BookOpen, color: "#ef4444", bio: "تضمین کیفیت کد از طریق تست‌های دقیق و نگهداری مستندات جامع پروژه." },
            { name: "امیرحسین حسنی", role: "مهندس دیتابیس", icon: Database, color: "#06b6d4", bio: "طراحی اسکیمای کارآمد دیتابیس، بهینه‌سازی کوئری‌ها و مدیریت یکپارچگی داده‌ها." }
        ],
        langLabel: "English",
        ctaText: "مشاهده مخازن",
        statsCodehub: "متن‌باز",
        statsTeam: "۶ عضو",
        statsFeatures: "قابلیت‌های متنوع"
    }
};

const About = () => {
    const [lang, setLang] = useState('en');
    const t = content[lang];
    const isRTL = lang === 'fa';
    const toggleLang = useCallback(() => setLang(l => (l === 'en' ? 'fa' : 'en')), []);

    const [revealed, setRevealed] = useState({});
    const sectionRefs = useRef([]);

    const observer = useMemo(() => new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const idx = entry.target.dataset.revealIndex;
                    setRevealed(prev => ({ ...prev, [idx]: true }));
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    ), []);

    useEffect(() => {
        sectionRefs.current.forEach(ref => ref && observer.observe(ref));
        return () => observer.disconnect();
    }, [observer]);

    const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${4 + Math.random() * 8}px`,
        duration: `${6 + Math.random() * 10}s`,
        delay: `${Math.random() * 5}s`,
        opacity: 0.08 + Math.random() * 0.12
    })), []);

    return (
        <div className={`ch-about-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="about-particles">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="about-particle"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                            opacity: p.opacity
                        }}
                    />
                ))}
            </div>

            <section className="about-hero" ref={el => (sectionRefs.current[0] = el)} data-reveal-index="0">
                <div className={`about-hero-content ${revealed[0] ? 'revealed' : ''}`}>
                    <div className="about-hero-badge"><Sparkles size={16} /><span>{t.heroHighlight}</span></div>
                    <h1 className="about-hero-title">{t.heroTitle} <span className="text-gradient">{t.heroHighlight}</span></h1>
                    <p className="about-hero-sub">{t.heroSubtitle}</p>
                    <div className="about-hero-stats">
                        <div className="about-stat-item"><div className="about-stat-icon"><Heart size={18} /></div><span>{t.statsCodehub}</span></div>
                        <div className="about-stat-divider" />
                        <div className="about-stat-item"><div className="about-stat-icon"><Users size={18} /></div><span>{t.statsTeam}</span></div>
                        <div className="about-stat-divider" />
                        <div className="about-stat-item"><div className="about-stat-icon"><Zap size={18} /></div><span>{t.statsFeatures}</span></div>
                    </div>
                    <button className="about-lang-toggle" onClick={toggleLang}>
                        <Languages size={18} /><span>{t.langLabel}</span>
                    </button>
                </div>
                <div className="about-hero-ring ring-1" />
                <div className="about-hero-ring ring-2" />
                <div className="about-hero-ring ring-3" />
            </section>

            <section className="about-project" ref={el => (sectionRefs.current[1] = el)} data-reveal-index="1">
                <div className={`about-section-inner ${revealed[1] ? 'revealed' : ''}`}>
                    <div className="about-project-grid">
                        <div className="about-project-text">
                            <div className="about-section-label"><Code size={14} /><span>{lang === 'en' ? 'The Platform' : 'پلتفرم'}</span></div>
                            <h2 className="about-section-title">{t.projectTitle}</h2>
                            <p className="about-section-desc">{t.projectDesc}</p>
                            <a href="/" className="about-cta-btn"><span>{t.ctaText}</span><ArrowRight size={16} /></a>
                        </div>
                        <div className="about-project-visual">
                            <div className="about-visual-card">
                                <div className="about-code-lines" dir="ltr" style={{ direction: "ltr", unicodeBidi: "bidi-override", textAlign: "left" }}>
                                    <div className="code-line"><span className="code-keyword">import</span> <span className="code-string">&#123; CodeHub &#125;</span> <span className="code-keyword">from</span> <span className="code-string">'@universe/core'</span></div>
                                    <div className="code-line"><span className="code-keyword">const</span> <span className="code-var">app</span> = <span className="code-keyword">new</span> <span className="code-class">CodeHub</span>()</div>
                                    <div className="code-line"><span className="code-var">app</span>.<span className="code-method">create</span>(<span className="code-string">'innovation'</span>)</div>
                                    <div className="code-line"><span className="code-var">app</span>.<span className="code-method">collaborate</span>()</div>
                                    <div className="code-line"><span className="code-var">app</span>.<span className="code-method">ship</span>(<span className="code-string">'🚀'</span>)</div>
                                </div>
                            </div>
                            <div className="about-visual-orb orb-1" />
                            <div className="about-visual-orb orb-2" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-features" ref={el => (sectionRefs.current[2] = el)} data-reveal-index="2">
                <div className={`about-section-inner ${revealed[2] ? 'revealed' : ''}`}>
                    <div className="about-section-label center"><Layers size={14} /><span>{lang === 'en' ? 'Capabilities' : 'قابلیت‌ها'}</span></div>
                    <h2 className="about-section-title center">{t.featuresTitle}</