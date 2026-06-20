import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { repoService, fileService, downloadRepo, authService } from '../services/api';
import SkeletonLoader from '../components/common/SkeletonLoader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { faIR } from 'date-fns/locale';
import rehypeSlug from 'rehype-slug';
import { Code, Folder, File, ArrowLeft, Globe, Lock, Download, Calendar, ChevronRight, ChevronDown, FileText, Copy, Check, Info, Lightbulb, AlertTriangle, AlertCircle, Octagon, Trash2, Loader2, Zap, X , Edit3, Upload, Activity, Shield, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import { 
    SiJavascript, SiPython, SiReact, SiTypescript, 
    SiJson, SiMarkdown, SiPhp, SiCplusplus, SiRust, SiGo,
    SiVuedotjs, SiSvelte, SiAngular, SiRuby, SiKotlin, SiSwift, SiDart,
    SiGraphql, SiYaml, SiDocker, SiGit, SiUnity, SiTailwindcss, SiSass,
    SiGithub
} from 'react-icons/si';

import { 
    FaFolder, FaFolderOpen, FaImage, FaFont, FaFileCode, FaFileAlt, FaLock, 
    FaNpm, FaJava, FaHashtag, FaBoxOpen, FaCogs, FaVials,
    FaFileImage, FaFileVideo, FaFileAudio, FaFilePdf, 
    FaFileWord, FaFileExcel, FaFileCsv, FaDatabase, FaHtml5, FaCss3Alt
} from 'react-icons/fa';

// اضافه شدن پکیج Tabler Icons برای زبان C و C#
import { TbBrandCSharp, TbLetterC } from 'react-icons/tb';

import { VscFileZip, VscTerminalCmd } from 'react-icons/vsc';
import { BsFiletypeTxt, BsFiletypeSvg } from 'react-icons/bs';


const RTLSwal = Swal.mixin({
    background: 'rgba(16, 16, 24, 0.95)',
    color: '#fff',
    customClass: {
        title: 'swal-rtl-text',         // فقط عنوان راست‌چین می‌شود
        htmlContainer: 'swal-rtl-text'  // فقط محتوای متنی/HTML راست‌چین می‌شود
    }
});

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    
    // --- فایل‌های خاص با نام دقیق ---
    if (fileName.toLowerCase() === 'package.json') return <FaNpm size={16} color="#cb3837" />;
    if (fileName.toLowerCase() === 'vite.config.js' || fileName.toLowerCase() === 'vite.config.ts') return <SiJavascript size={16} color="#646cff" />;
    if (fileName.toLowerCase() === 'readme.md') return <SiMarkdown size={16} color="#ffffff" />;
    if (fileName.toLowerCase() === 'dockerfile' || fileName.toLowerCase() === 'docker-compose.yml') return <SiDocker size={16} color="#2496ed" />;
    if (fileName.toLowerCase() === '.gitignore') return <SiGit size={16} color="#f14e32" />;
    
    // فایل‌ها بر اساس پسوند
    switch (ext) {
        // --- فرانت‌اند و وب ---
        case 'js': 
        case 'mjs': 
        case 'cjs': return <SiJavascript size={16} color="#f7df1e" />;
        case 'jsx': return <SiReact size={16} color="#61dafb" />;
        case 'ts': return <SiTypescript size={16} color="#3178c6" />;
        case 'tsx': return <SiReact size={16} color="#3178c6" />;
        case 'vue': return <SiVuedotjs size={16} color="#4fc08d" />;
        case 'svelte': return <SiSvelte size={16} color="#ff3e00" />;
        case 'html': 
        case 'htm': return <FaHtml5 size={16} color="#e34f26" />;
        case 'css': return <FaCss3Alt size={16} color="#1572b6" />;
        case 'scss':
        case 'sass': return <SiSass size={16} color="#cc6699" />;
        
        // --- بک‌اند و اسکریپتینگ ---
        case 'py': 
        case 'pyc': return <SiPython size={16} color="#3776ab" />;
        case 'php': return <SiPhp size={16} color="#777bb4" />;
        case 'rb': return <SiRuby size={16} color="#cc342d" />;
        case 'go': return <SiGo size={16} color="#00add8" />;
        case 'java': return <FaJava size={16} color="#b07219" />;
        case 'kt': 
        case 'kts': return <SiKotlin size={16} color="#7f52ff" />;
        case 'cs': return <TbBrandCSharp size={16} color="#239120" />; // استفاده از TbBrandCSharp
        case 'cpp': 
        case 'cxx': 
        case 'hpp': return <SiCplusplus size={16} color="#00599c" />;
        case 'c': 
        case 'h': return <TbLetterC size={16} color="#a8b9cc" />; // استفاده از TbLetterC
        case 'rs': return <SiRust size={16} color="#dea584" />;
        case 'swift': return <SiSwift size={16} color="#fa7343" />;
        case 'dart': return <SiDart size={16} color="#0175c2" />;
        case 'asm': 
        case 's': return <FaFileCode size={16} color="#2b509b" />; // جایگزینی برای Assembly
        
        // --- داده، کانفیگ و نشانه‌گذاری ---
        case 'json': return <SiJson size={16} color="#cb3837" />;
        case 'xml': 
        case 'xmi': return <FaFileCode size={16} color="#fbbc05" />;
        case 'yaml': 
        case 'yml': return <SiYaml size={16} color="#cb171e" />;
        case 'md': 
        case 'mdx': return <SiMarkdown size={16} color="#ffffff" />;
        case 'graphql': 
        case 'gql': return <SiGraphql size={16} color="#e10098" />;
        case 'env': 
        case 'ini': 
        case 'conf':
        case 'toml': return <FaHashtag size={16} color="#9ca3af" />; // آیکون هشتگ برای فایل‌های کانفیگ
        
        // --- دیتابیس ---
        case 'sql':
        case 'db':
        case 'sqlite':
        case 'sqlite3': return <FaDatabase size={16} color="#6b7280" />; 

        // --- بازی‌سازی و سه‌بعدی ---
        case 'unity':
        case 'prefab':
        case 'mat':
        case 'shader': return <SiUnity size={16} color="#ffffff" />;
        
        // --- فرمت‌های تصویری ---
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'webp':
        case 'ico': return <FaFileImage size={16} color="#eab308" />;
        case 'svg': return <BsFiletypeSvg size={16} color="#fbbf24" />;
        
        // --- فرمت‌های ویدیویی و صوتی ---
        case 'mp4':
        case 'mkv':
        case 'avi': return <FaFileVideo size={16} color="#ec4899" />;
        case 'mp3':
        case 'wav':
        case 'ogg': return <FaFileAudio size={16} color="#8b5cf6" />;
        
        // --- اسناد متنی ---
        case 'txt':
        case 'log': return <BsFiletypeTxt size={16} color="#9ca3af" />;
        case 'pdf': return <FaFilePdf size={16} color="#ef4444" />;
        case 'doc':
        case 'docx': return <FaFileWord size={16} color="#2563eb" />;
        case 'xls':
        case 'xlsx': return <FaFileExcel size={16} color="#16a34a" />;
        case 'csv': return <FaFileCsv size={16} color="#10b981" />;
        
        // --- فایل‌های فشرده و اجرایی ---
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz': return <VscFileZip size={16} color="#f59e0b" />;
        case 'sh':
        case 'bat':
        case 'cmd':
        case 'exe': return <VscTerminalCmd size={16} color="#4ade80" />;
        
        // --- پیش‌فرض ---
        default: return <FaFileAlt size={16} color="var(--ch-text-dim)" />;
    }
};

const getFolderIcon = (folderName, isOpen) => {
    const name = folderName.toLowerCase();

    // ۱. فایل‌های سیستمی و پکیج‌ها (خاکستری/قرمز)
    if (name === 'node_modules' || name === 'vendor') return <FaBoxOpen size={16} color="#9ca3af" />;
    if (name === '.github' || name === 'github') return <SiGithub size={16} color="#ffffff" />;
    if (name === 'dist' || name === 'build' || name === 'out') return <FaCogs size={16} color="#9ca3af" />;

    // ۲. مدیا و فایل‌های استاتیک (زرد/نارنجی)
    if (['images', 'img', 'pic', 'pics', 'icons', 'svg'].includes(name)) return <FaImage size={16} color="#f59e0b" />;
    if (['fonts', 'font', 'typography'].includes(name)) return <FaFont size={16} color="#f43f5e" />;
    if (['assets', 'public', 'static'].includes(name)) return isOpen ? <FaFolderOpen size={16} color="#eab308" /> : <FaFolder size={16} color="#eab308" />;

    // ۳. هسته پروژه و سورس (سبز)
    if (['src', 'app', 'core', 'main'].includes(name)) return isOpen ? <FaFolderOpen size={16} color="#10b981" /> : <FaFolder size={16} color="#10b981" />;

    // ۴. کامپوننت‌ها و رابط کاربری (بنفش/صورتی)
    if (['components', 'ui', 'layouts', 'shared', 'partials'].includes(name)) return isOpen ? <FaFolderOpen size={16} color="#a855f7" /> : <FaFolder size={16} color="#a855f7" />;
    if (['pages', 'views', 'screens', 'routes'].includes(name)) return isOpen ? <FaFolderOpen size={16} color="#ec4899" /> : <FaFolder size={16} color="#ec4899" />;

    // ۵. منطق، دیتا و سرویس‌ها (آبی/فیروزه‌ای)
    if (['api', 'services', 'controllers', 'models', 'graphql', 'store', 'context', 'redux'].includes(name)) return isOpen ? <FaFolderOpen size={16} color="#3b82f6" /> : <FaFolder size={16} color="#3b82f6" />;
    if (['utils', 'helpers', 'lib', 'hooks', 'config', 'types', 'interfaces'].includes(name)) return isOpen ? <FaFolderOpen size={16} color="#06b6d4" /> : <FaFolder size={16} color="#06b6d4" />;

    // ۶. دیتابیس (خاکستری تیره)
    if (['db', 'database', 'prisma', 'migrations'].includes(name)) return <FaDatabase size={16} color="#9ca3af" />;

    // ۷. تست‌ها (نارنجی)
    if (['test', 'tests', '__tests__', 'coverage', 'spec', 'e2e'].includes(name)) return <FaVials size={16} color="#f97316" />;

    // ۸. پوشه پیش‌فرض (رنگ‌بندی داینامیک)
    const defaultColor = isOpen ? "var(--ch-accent)" : "#3b82f6"; // بنفش وقتی بازه، آبی وقتی بسته است
    return isOpen ? <FaFolderOpen size={16} color={defaultColor} /> : <FaFolder size={16} color={defaultColor} />;
};


// تابع کمکی برای مرتب‌سازی نودهای درخت (اول پوشه، بعد فایل)
const sortTreeNodes = (nodesArray) => {
    return nodesArray.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        // اگر هر دو هم‌نوع بودند، بر اساس الفبا مرتب شوند
        return a.name.localeCompare(b.name);
    });
};

const TreeNode = ({ node, onFileClick, activeFileId }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    if (node.type === 'file') {
        const isActive = activeFileId === node.data.id;
        return (
            <div className={`tree-file ${isActive ? 'active' : ''}`} onClick={() => onFileClick(node.data)}>
                {getFileIcon(node.name)}
                <span style={{ color: isActive ? 'var(--ch-accent)' : 'inherit', fontWeight: isActive ? '600' : 'normal' }}>
                    {node.name}
                </span>
            </div>
        );
    }
    
    return (
        <div>
            <div className="tree-folder" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <ChevronDown size={14} style={{ color: 'var(--ch-text-dim)' }} /> : <ChevronRight size={14} style={{ color: 'var(--ch-text-dim)' }} />}
                {getFolderIcon(node.name, isOpen)}
                <span>{node.name}</span>
            </div>
            {isOpen && (
                <div className="tree-children content-fade-in">
                    {sortTreeNodes(Object.values(node.children)).map((child, index) => (
                        <TreeNode key={index} node={child} onFileClick={onFileClick} activeFileId={activeFileId} />
                    ))}
                </div>
            )}
        </div>
    );
};

const RepoDetail = () => {
    // دریافت هر دو پارامتر از URL
    const { ownerName, repoName } = useParams();
    const navigate = useNavigate();
    const [repo, setRepo] = useState(null);
    const [files, setFiles] = useState([]);
    const [fileTree, setFileTree] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFile, setActiveFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [readmeContent, setReadmeContent] = useState('');
    const [readmeDirection, setReadmeDirection] = useState('ltr');
    const [isDownloadingRepo, setIsDownloadingRepo] = useState(false);
    const [isDeletingFile, setIsDeletingFile] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isBinaryFile, setIsBinaryFile] = useState(false);
    const [isDownloadingFile, setIsDownloadingFile] = useState(false);
    const [isGeneratingReadme, setIsGeneratingReadme] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isSavingOptimized, setIsSavingOptimized] = useState(false);
    const [optimizedContent, setOptimizedContent] = useState(null);
    const [isAnalyzingCode, setIsAnalyzingCode] = useState(false);
    const [starsCount, setStarsCount] = useState(0);
    const [isStarred, setIsStarred] = useState(false);
    const [isStarring, setIsStarring] = useState(false);

    const getAnalysisStatus = (file) => {
        if (!file) return { hasAnalysis: false, isUpToDate: false, cachedData: null, isEnglish: false };
        const cacheKey = `code_analysis_${file.id}`;
        const cachedDataStr = localStorage.getItem(cacheKey);
        
        if (!cachedDataStr) return { hasAnalysis: false, isUpToDate: false, cachedData: null, isEnglish: false };
        
        try {
            const parsedCache = JSON.parse(cachedDataStr);
            
            let rawFileDate = file.uploaded_at || (repo ? repo.updated_at : null);
            let normalizedFileDate = rawFileDate;
            
            if (typeof rawFileDate === 'string' && rawFileDate.includes(' | ')) {
                normalizedFileDate = rawFileDate.replace(' | ', 'T') + 'Z';
            }
            
            const fileDateMs = new Date(normalizedFileDate).getTime();
            const analysisDateMs = new Date(parsedCache.date).getTime();
            
            const isFileDateValid = !isNaN(fileDateMs);
            const isUpToDate = isFileDateValid ? analysisDateMs >= fileDateMs : true;
            
            return {
                hasAnalysis: true,
                isUpToDate: isUpToDate,
                cachedData: parsedCache.data,
                isEnglish: parsedCache.isEnglish === true // <--- اضافه شدن تشخیص دقیق زبان
            };
        } catch (error) {
            console.error("خطا در پردازش اطلاعات کش تحلیل:", error);
            return { hasAnalysis: false, isUpToDate: false, cachedData: null, isEnglish: false };
        }
    };

    // تابع نمایش پاپ‌آپ زیبای نتیجه تحلیل
    // تابع نمایش پاپ‌آپ زیبای نتیجه تحلیل
    const showAnalysisResults = (data, isEnglish = false) => {
        const getRatingColor = (rating) => {
            const r = String(rating).toLowerCase();
            if (r.includes('good') && !r.includes('very')) return '#10b981'; // سبز
            if (r.includes('very good')) return '#3b82f6'; // آبی
            if (r.includes('normal')) return '#eab308'; // زرد
            if (r.includes('bad') && !r.includes('very')) return '#f97316'; // نارنجی
            if (r.includes('very bad')) return '#ef4444'; // قرمز
            return 'var(--ch-accent)'; // پیش‌فرض
        };

        // مینی‌پارسر برای تبدیل فرمت مارک‌داون و \n به HTML معتبر داخل پاپ‌آپ
        const formatText = (text) => {
            if (!text) return '';
            return String(text)
                .replace(/\\n/g, '<br/>') // تبدیل \n متنی
                .replace(/\n/g, '<br/>')   // تبدیل اینترهای واقعی
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: white;">$1</strong>') // بولد کردن
                .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; color: #fb7185; font-family: monospace;">$1</code>'); // کدهای درون‌خطی
        };

        const ratingColor = getRatingColor(data.overall_rating);

        const t = {
            dir: isEnglish ? 'ltr' : 'rtl',
            align: isEnglish ? 'left' : 'right',
            title: isEnglish ? 'Code Analysis Report' : 'گزارش تحلیل کد',
            status: isEnglish ? 'Overall Status' : 'وضعیت کلی',
            scoresTitle: isEnglish ? 'Scores (out of 10)' : 'امتیازات کیفی',
            readability: isEnglish ? 'Readability' : 'خوانایی کد',
            security: isEnglish ? 'Security' : 'امنیت',
            performance: isEnglish ? 'Performance' : 'عملکرد',
            maintainability: isEnglish ? 'Maintainability' : 'نگهداری‌پذیری',
            vulnTitle: isEnglish ? 'Security Vulnerabilities' : 'آسیب‌پذیری‌ها و اخطارها',
            noVuln: isEnglish ? 'No critical vulnerabilities found. Great!' : 'هیچ آسیب‌پذیری مهمی یافت نشد. عالی!',
            feedbackTitle: isEnglish ? 'Suggestions for Improvement' : 'توصیه‌ها و پیشنهادات',
            closeBtn: isEnglish ? 'Close' : 'بستن'
        };

        const vulnerabilities = Array.isArray(data.critical_vulnerabilities) 
            ? data.critical_vulnerabilities 
            : [];

        const htmlContent = `
            <div style="text-align: ${t.align}; direction: ${t.dir}; font-family: 'Vazirmatn', 'Inter', sans-serif; max-height: 75vh; overflow-y: auto; overflow-x: hidden; padding-right: 5px;" class="custom-scrollbar">
                
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
                    <div style="padding: 10px 24px; border-radius: 12px; background: rgba(0,0,0,0.3); border: 1px solid ${ratingColor}; color: ${ratingColor}; font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; box-shadow: 0 0 20px ${ratingColor}20;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        ${t.status}: ${data.overall_rating}
                    </div>
                </div>
                
                <div class="analysis-popup-grid">
                    
                    <div class="analysis-col">
                        <div class="analysis-header" style="color: var(--ch-text-dim);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                            ${t.scoresTitle}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; height: 100%; align-content: start;">
                            <div style="background: rgba(255,255,255,0.05); padding: 16px 10px; border-radius: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.02);">
                                <span style="display: block; font-size: 0.85rem; color: var(--ch-text-dim); margin-bottom: 8px;">${t.readability}</span>
                                <strong style="font-size: 1.4rem; color: white;">${data.scores?.readability || 0}<span style="font-size:0.9rem; color:gray">/10</span></strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 16px 10px; border-radius: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.02);">
                                <span style="display: block; font-size: 0.85rem; color: var(--ch-text-dim); margin-bottom: 8px;">${t.security}</span>
                                <strong style="font-size: 1.4rem; color: white;">${data.scores?.security || 0}<span style="font-size:0.9rem; color:gray">/10</span></strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 16px 10px; border-radius: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.02);">
                                <span style="display: block; font-size: 0.85rem; color: var(--ch-text-dim); margin-bottom: 8px;">${t.performance}</span>
                                <strong style="font-size: 1.4rem; color: white;">${data.scores?.performance || 0}<span style="font-size:0.9rem; color:gray">/10</span></strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 16px 10px; border-radius: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.02);">
                                <span style="display: block; font-size: 0.85rem; color: var(--ch-text-dim); margin-bottom: 8px;">${t.maintainability}</span>
                                <strong style="font-size: 1.4rem; color: white;">${data.scores?.maintainability || 0}<span style="font-size:0.9rem; color:gray">/10</span></strong>
                            </div>
                        </div>
                    </div>

                    <div class="analysis-col">
                        <div class="analysis-header" style="color: #ef4444; border-bottom-color: rgba(239, 68, 68, 0.2);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            ${t.vulnTitle}
                        </div>
                        <ul style="color: var(--ch-text); padding-${isEnglish ? 'left' : 'right'}: 20px; font-size: 0.95rem; line-height: 1.7; margin: 0; text-align: justify;">
                            ${vulnerabilities.length > 0 
                                ? vulnerabilities.map(v => `<li style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.05);">${formatText(v)}</li>`).join('') 
                                : `<li style="color: #10b981; list-style: none; display: flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.1); padding: 12px; border-radius: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>${t.noVuln}</li>`
                            }
                        </ul>
                    </div>

                    <div class="analysis-col">
                        <div class="analysis-header" style="color: var(--ch-accent); border-bottom-color: rgba(168, 85, 247, 0.2);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                            ${t.feedbackTitle}
                        </div>
                        <p style="color: var(--ch-text); font-size: 0.95rem; line-height: 1.8; text-align: justify; margin: 0;">
                            ${formatText(data.actionable_feedback) || 'توصیه‌ای یافت نشد.'}
                        </p>
                    </div>

                </div>
            </div>
        `;

        Swal.fire({
            title: `<div style="display: flex; align-items: center; justify-content: center; gap: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> ${t.title}</div>`,
            html: htmlContent,
            width: '1100px', // عریض‌تر شدن پاپ‌آپ برای جا دادن سه ستون در دسکتاپ
            showConfirmButton: true,
            confirmButtonText: t.closeBtn,
            confirmButtonColor: 'var(--ch-accent)',
            background: 'rgba(16, 16, 24, 0.95)',
            color: '#fff',
            backdrop: 'rgba(0,0,0,0.6)',
            customClass: { 
                popup: 'swal-glass-popup',
                container: 'swal-top-safe-container' 
            }
        });
    };

    // تابع اصلی برای مدیریت کلیک روی دکمه تحلیل
    const handleCodeAnalysisClick = async () => {
        const status = getAnalysisStatus(activeFile);

        // اگر قبلاً تحلیل شده و فایل آپدیت نشده، مستقیماً نمایش بده
        if (status.hasAnalysis && status.isUpToDate) {
            // استفاده دقیق از زبانی که در کش ذخیره شده است
            showAnalysisResults(status.cachedData, status.isEnglish);
            return;
        }

        // اگر نیاز به تحلیل جدید است، ابتدا از کاربر می‌پرسیم
        const result = await RTLSwal.fire({
            title: 'تحلیل عمیق و امنیتی کد 🛡️',
            html: `
                <p style="margin-bottom: 15px; font-size: 0.95rem;">
                    هوش مصنوعی کیفیت، امنیت و عملکرد این فایل را بررسی می‌کند.
                </p>
                <div style="background: rgba(245, 158, 11, 0.1); border-right: 4px solid #f59e0b; padding: 10px; font-size: 0.85rem; color: #fcd34d; margin-bottom: 15px; text-align: right;">
                    <strong>توجه:</strong> به دلیل مصرف منابع بالا، شما برای هر نسخه از این فایل تنها <b>یک بار</b> می‌توانید درخواست تحلیل جدید بدهید، مگر اینکه فایل آپدیت شود.
                </div>
                <p style="margin-bottom: 10px;">زبان گزارش را انتخاب کنید:</p>
            `,
            icon: 'info',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'انگلیسی (English)',
            denyButtonText: 'فارسی (Persian)',
            cancelButtonText: 'انصراف',
            confirmButtonColor: '#3b82f6',
            denyButtonColor: '#10b981',
            cancelButtonColor: '#374151'
        });

        if (!result.isConfirmed && !result.isDenied) return;
        const en_response = result.isConfirmed;

        try {
            setIsAnalyzingCode(true);
            
            Swal.fire({
                title: en_response ? 'AI is Analyzing Code' : 'هوش مصنوعی در حال تحلیل کد',
                html: `
                    <div class="luminous-loader"></div>
                    <p style="margin-top:20px; color:var(--ch-text-dim); font-size: 0.9rem;">
                        ${en_response ? 'Checking readability, finding vulnerabilities, and scoring...' : 'در حال بررسی خوانایی، کشف آسیب‌پذیری‌ها و امتیازدهی...'}
                    </p>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
            });

            const res = await fileService.analyzeFile({
                file_id: activeFile.id,
                en_response: en_response
            });

            if (res.data.is_success) {
                const jsonString = res.data.response.content;
                let parsedData;
                try {
                    parsedData = JSON.parse(jsonString);
                } catch (e) {
                    throw new Error('فرمت خروجی سرور نامعتبر است.');
                }

                // استخراج فقط دیتای مورد نیاز
                const lightweightDataToCache = {
                    scores: parsedData.scores || {},
                    overall_rating: parsedData.overall_rating || '',
                    critical_vulnerabilities: parsedData.critical_vulnerabilities || [],
                    actionable_feedback: parsedData.actionable_feedback || ''
                };

                // ذخیره دیتا به همراه زبان انتخابی کاربر
                const cacheData = {
                    date: new Date().toISOString(),
                    data: lightweightDataToCache,
                    isEnglish: en_response // <--- ذخیره صریح انتخاب کاربر
                };
                
                try {
                    localStorage.setItem(`code_analysis_${activeFile.id}`, JSON.stringify(cacheData));
                } catch (storageError) {
                    console.warn("Storage is full, couldn't save cache:", storageError);
                }

                Swal.close();
                showAnalysisResults(parsedData, en_response);
            } else {
                throw new Error('تحلیل با خطا مواجه شد');
            }
        } catch (error) {
            console.error(error);
            RTLSwal.fire({
                icon: 'error',
                title: en_response ? 'Analysis Error' : 'خطا در تحلیل',
                text: en_response ? 'Failed to connect to AI server or invalid data format.' : 'ارتباط با سرور هوش مصنوعی برقرار نشد یا فرمت داده‌ها مشکل دارد.',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff'
            });
        } finally {
            setIsAnalyzingCode(false);
        }
    };
    // وابستگی‌های useEffect آپدیت شدن
    useEffect(() => {
        fetchRepositoryData();
        checkOwnership();
    }, [ownerName, repoName]);

    const checkOwnership = async () => {
        // ۱. بررسی می‌کنیم آیا کاربر توکن دارد (لاگین کرده است) یا خیر
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsOwner(false); // کاربر لاگین نیست، پس مدیر هم نیست
            return;
        }

        try {
            const userRes = await authService.getUserInfo();
            
            // ۲. پوشش دادن حالت‌های مختلفی که ممکن است بک‌اند اطلاعات را برگرداند
            const userData = userRes.data?.response || userRes.data;
            const currentUsername = userData?.username || userData?.name;

            // خط زیر را برای تست گذاشتم، اگر باز هم دکمه نیامد، F12 مرورگر را بزنید و در تب Console مقادیر را ببینید
            // console.log("Logged in as:", currentUsername, "| Repo Owner is:", ownerName);

            // ۳. مقایسه نام کاربری فعلی با سازنده ریپازیتوری (بدون حساسیت به حروف بزرگ و کوچک)
            if (currentUsername && ownerName && currentUsername.toLowerCase() === ownerName.toLowerCase()) {
                setIsOwner(true);
            } else {
                setIsOwner(false);
            }
        } catch (err) {
            console.error('Failed to fetch user info for ownership validation.', err);
            setIsOwner(false); // در صورت بروز خطا در دریافت اطلاعات، دسترسی مدیر بسته شود
        }
    };

    // تبدیل آرایه فایل‌ها به ساختار درختی و تودرتو
    const buildFileTree = (fileList) => {
        const root = { type: 'folder', name: 'root', children: {} };
        fileList.forEach(file => {
            const parts = file.relative_path.split('/').filter(Boolean);
            let current = root;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    current.children[part] = { type: 'file', name: part, data: file };
                } else {
                    if (!current.children[part]) {
                        current.children[part] = { type: 'folder', name: part, children: {} };
                    }
                    current = current.children[part];
                }
            }
        });
        return root;
    };

    const fetchRepositoryData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const repoRes = await repoService.getOne(ownerName, repoName);
            if (!repoRes.data.is_success) {
                setError('Repository not found.');
                return;
            }
            const repoData = repoRes.data.response;
            setRepo(repoData);
            
            // این مقدار را ست کنید:
            setStarsCount(repoData.stars_count || 0);
            const filesRes = await fileService.getFiles(repoData.id);
            if (filesRes.data.is_success) {
                const fetchedFiles = filesRes.data.response || [];
                setFiles(fetchedFiles);
                setFileTree(buildFileTree(fetchedFiles));
                const readmeFile = fetchedFiles.find(f => f.relative_path.toLowerCase() === 'readme.md');
                if (readmeFile) {
                    fetchReadmeContent(repoData.id, readmeFile.id);
                }
            }
        } catch (err) {
            setError('Error loading repository details.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleToggleStar = async () => {
        // ۱. بررسی ورود کاربر
        const token = localStorage.getItem('access_token');
        if (!token) {
            RTLSwal.fire({
                icon: 'warning',
                title: 'نیاز به ورود',
                text: 'برای ستاره دادن به این مخزن، ابتدا باید وارد حساب کاربری خود شوید.',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                navigate('/auth');
            });
            return;
        }

        // 👈 اضافه کردن این شرط: اگر کاربر مالک پروژه بود، اجازه ندهد
        if (isOwner) {
            RTLSwal.fire({
                icon: 'error',
                title: 'خطا',
                text: 'شما نمی‌توانید به ریپازیتوری خودتان ستاره بدهید!',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff'
            });
            return;
        }

        // ۲. ارسال درخواست در صورت لاگین بودن و مالک نبودن
        try {
            setIsStarring(true);
            const response = await repoService.toggleStar(repo.id);
            
            if (response.data.is_success) {
                setStarsCount(response.data.response.stars_count);
                setIsStarred(response.data.response.starred);
            }
        } catch (error) {
            RTLSwal.fire({
                icon: 'error',
                title: 'خطا',
                text: 'مشکلی در ارتباط با سرور پیش آمد.',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff'
            });
        } finally {
            setIsStarring(false);
        }
    };

    const fetchReadmeContent = async (repoId, fileId) => {
        try {
            const { data } = await fileService.getContent(repoId, fileId);
            if (data.is_success) setReadmeContent(data.response.content || '');
        } catch (err) {
            console.error('Failed to load README.md');
        }
    };

    const handleDownloadFile = async (file) => {
        try {
            setIsDownloadingFile(true);
            
            // نمایش پاپ‌آپ لودینگ
            RTLSwal.fire({
                title: 'در حال آماده‌سازی فایل',
                text: 'لطفاً چند لحظه صبر کنید',
                allowOutsideClick: false,
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fileService.downloadFile(repo.id, file.id);
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // هشدار موفقیت آمیز بودن دانلود
            RTLSwal.fire({
                icon: 'success',
                title: 'دانلود شروع شد!',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
                timer: 1500,
                showConfirmButton: false
            });

        } catch (err) {
            RTLSwal.fire({ 
                icon: 'error', 
                title: 'خطا در دانلود', 
                text: 'مشکلی در دانلود فایل پیش آمد.',
                background: 'rgba(16, 16, 24, 0.95)', 
                color: '#fff' 
            });
        } finally {
            setIsDownloadingFile(false);
        }
    };

    const handleDownloadRepository = async () => {
    try {
        setIsDownloadingRepo(true);
        
        // نمایش پاپ‌آپ لودینگ به کاربر تا زمان آماده شدن فایل
        RTLSwal.fire({
            title: 'در حال آماده‌سازی دانلود',
            text: 'لطفاً چند لحظه شکیبا باشید',
            allowOutsideClick: false,
            background: 'rgba(16, 16, 24, 0.95)',
            color: '#fff',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await downloadRepo(repo.id);
        const blob = new Blob([response.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${repo.name}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        RTLSwal.fire({
            icon: 'success',
            title: 'دانلود شروع شد!',
            text: 'کل ریپازیتوری با موفقیت دانلود شد',
            background: 'rgba(16, 16, 24, 0.95)',
            color: '#fff',
            timer: 2000,
            showConfirmButton: false
        });
    } catch (err) {
        RTLSwal.fire({
            icon: 'error',
            title: 'دانلود ناموفق',
            text: 'امکان دانلود ریپازیتوری وجود ندارد',
            background: 'rgba(16, 16, 24, 0.95)',
            color: '#fff'
        });
    } finally {
        setIsDownloadingRepo(false);
    }
    };

    const handleFileClick = async (file) => {
    setIsFileLoading(true);
    setActiveFile(file);
    setFileContent('');
    setIsBinaryFile(false);
    setOptimizedContent(null);

    // اگر از قبل می‌دانیم فایل باینری (مدیا، زیپ و...) است
    if (file.is_binary) {
        setIsBinaryFile(true);
        setIsFileLoading(false);
        return; // دیگر درخواستی به سرور نمی‌فرستیم
    }

    try {
        const { data } = await fileService.getContent(repo.id, file.id);
        if (data.is_success) {
            // ممکن است سرور پس از بررسی، فایل را باینری تشخیص دهد
            if (data.response.is_binary) {
                setIsBinaryFile(true); 
            } else {
                setFileContent(data.response.content || '');
            }
        } else {
            throw new Error('Could not view file content.');
        }
    } catch (err) {
        RTLSwal.fire({ icon: 'error', title: 'خطا در دریافت محتوای فایل', background: 'rgba(16, 16, 24, 0.95)', color: '#fff' });
        setActiveFile(null);
    } finally {
        setIsFileLoading(false);
    }
};

    const handleDeleteFile = async () => {
        const confirmResult = await RTLSwal.fire({
            title: 'آیا از حذف این فایل مطمئن هستید؟',
            text: "این عملیات غیرقابل بازگشت است!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', // قرمز برای خطر
            cancelButtonColor: '#3b82f6', // آبی برای انصراف
            confirmButtonText: 'بله، حذف کن',
            cancelButtonText: 'انصراف',
            background: 'rgba(16, 16, 24, 0.95)',
            color: '#fff'
        });

        if (confirmResult.isConfirmed) {
            try {
                setIsDeletingFile(true);
                RTLSwal.fire({
                    title: 'در حال حذف فایل',
                    allowOutsideClick: false,
                    background: 'rgba(16, 16, 24, 0.95)',
                    color: '#fff',
                    didOpen: () => Swal.showLoading()
                });

                const response = await fileService.deleteFile(repo.id, activeFile.id);
                
                if (response.data.is_success) {
                    RTLSwal.fire({
                        icon: 'success',
                        title: 'حذف شد!',
                        text: 'فایل با موفقیت حذف گردید.',
                        background: 'rgba(16, 16, 24, 0.95)',
                        color: '#fff',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    if (activeFile.file_name.toLowerCase() === 'readme.md') {
                        setReadmeContent(''); 
                    }

                    setActiveFile(null);
                    fetchRepositoryData();
                }
            } catch (error) {
                RTLSwal.fire({
                    icon: 'error',
                    title: 'خطا در حذف فایل',
                    text: 'مشکلی در ارتباط با سرور پیش آمد.',
                    background: 'rgba(16, 16, 24, 0.95)',
                    color: '#fff'
                });
            } finally {
                setIsDeletingFile(false);
            }
        }
    };

    const handleOptimizeCode = async () => {
        try {
            setIsOptimizing(true);
            RTLSwal.fire({
                title: 'هوش مصنوعی در حال بهینه سازی',
                html: `
                    <div class="luminous-loader"></div>
                    <p style="margin-top:20px; color:var(--ch-text-dim); font-size: 0.9rem;">
                        در حال بهینه‌سازی کد و رفع باگ‌ها.<br/>لطفاً منتظر بمانید
                    </p>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
            });

            const res = await fileService.optimizeFile(activeFile.id);

            if (res.data.is_success) {
                setOptimizedContent(res.data.response.content);
                Swal.close();
            } else {
                throw new Error('Failed to optimize');
            }
        } catch (error) {
            RTLSwal.fire({
                icon: 'error',
                title: 'خطا در بهینه‌سازی',
                text: 'مشکلی در ارتباط با سرور پیش آمد.',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff'
            });
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleAcceptOptimization = async () => {
        try {
            setIsSavingOptimized(true);
            RTLSwal.fire({
                title: 'در حال اعمال تغییرات',
                allowOutsideClick: false,
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
                didOpen: () => Swal.showLoading()
            });

            const res = await fileService.changeContent({
                file_id: activeFile.id,
                content: optimizedContent
            });

            if (res.data.is_success) {
                setFileContent(optimizedContent); 
                setOptimizedContent(null); 
                RTLSwal.fire({
                    icon: 'success',
                    title: 'جادو انجام شد! ✨',
                    text: 'کد با موفقیت بهینه‌سازی و جایگزین شد.',
                    background: 'rgba(16, 16, 24, 0.95)',
                    color: '#fff',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            RTLSwal.fire({
                icon: 'error',
                title: 'خطا در جایگزینی',
                text: 'ذخیره فایل با مشکل مواجه شد.',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff'
            });
        } finally {
            setIsSavingOptimized(false);
        }
    };

    const handleRejectOptimization = () => {
        setOptimizedContent(null);
    };
    const handleGenerateReadme = async () => {
        const result = await RTLSwal.fire({
            title: 'ساخت فایل README با هوش مصنوعی ✨',
            html: readmeContent 
                ? '<p style="color: #ef4444; margin-bottom: 15px; font-weight: bold;">⚠️ فایل README فعلی شما پاک شده و با نسخه جدید جایگزین می‌شود!</p> لطفاً زبان ریدمی جدید را انتخاب کنید:' 
                : '<p style="margin-bottom: 15px;">هوش مصنوعی کدهای شما را بررسی کرده و بهترین مستندات را می‌سازد. لطفاً زبان ریدمی را انتخاب کنید:</p>',
            icon: readmeContent ? 'warning' : 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'انگلیسی (English)',
            denyButtonText: 'فارسی (Persian)',
            cancelButtonText: 'انصراف',
            confirmButtonColor: '#3b82f6',
            denyButtonColor: '#10b981',
            cancelButtonColor: '#374151'
        });

        // اگر کاربر انصراف داد
        if (!result.isConfirmed && !result.isDenied) return;

        // اگر روی انگلیسی کلیک کرد true و اگر فارسی false
        const en_response = result.isConfirmed; 

        try {
            setIsGeneratingReadme(true);
            
            // ۲. نمایش لودینگ اختصاصی و جذابِ هوش مصنوعی
            Swal.fire({
                title: 'هوش مصنوعی در حال تفکر',
                html: `
                    <div class="luminous-loader"></div>
                    <p style="margin-top:20px; color:var(--ch-text-dim); font-size: 0.9rem;">
                        در حال بررسی کدهای شما و تولید مستندات.<br/>این فرآیند ممکن است کمی طول بکشد
                    </p>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
            });

            // ۳. ارسال درخواست به API
            const res = await repoService.generateReadme({
                repository_id: repo.id,
                en_response: en_response
            });

            if (res.data.is_success) {
                // ۴. جایگذاری محتوای جدید
                setReadmeContent(res.data.response.content);
                // اگر قبلا فایلی نبوده، فایل‌تری را رفرش می‌کنیم تا ریدمی اضافه شود
                fetchRepositoryData(); 
                
                RTLSwal.fire({
                    icon: 'success',
                    title: 'جادو انجام شد! ✨',
                    text: 'فایل README با موفقیت تولید و جایگزین گردید.',
                    background: 'rgba(16, 16, 24, 0.95)',
                    color: '#fff',
                    timer: 2500,
                    showConfirmButton: false
                });
            } else {
                throw new Error('Failed to generate');
            }
        } catch (error) {
            // 👇 اضافه شدن این بخش برای هندل کردن خطای تغییر نکردن فایل‌ها
            if (error.response && error.response.status === 400) {
                const backendErrors = error.response.data?.errors || [];
                
                // بررسی می‌کنیم که آیا این همان خطای آپدیت نشدن فایل‌ها است
                if (backendErrors.includes("Repository files not changed")) {
                    RTLSwal.fire({
                        icon: 'info',
                        title: 'پروژه تغییری نکرده است!',
                        text: 'از آخرین باری که برای این پروژه README ساخته‌اید، فایلی آپدیت نشده است. نیازی به ساخت مجدد نیست.',
                        background: 'rgba(16, 16, 24, 0.95)',
                        color: '#fff',
                        confirmButtonText: 'متوجه شدم',
                        confirmButtonColor: 'var(--ch-accent)'
                    });
                    return; // خروج از تابع تا پیام خطای پیش‌فرض زیر اجرا نشود
                }
            }

            // خطای عمومی در صورت قطع سرور یا ارورهای دیگر
            RTLSwal.fire({
                icon: 'error',
                title: 'خطا در تولید ریدمی',
                text: 'مشکلی در ارتباط با سرور هوش مصنوعی پیش آمد. لطفاً دوباره تلاش کنید.',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff'
            });
        } finally {
            setIsGeneratingReadme(false);
        }
    };

        // ۱. کامپوننت برای بلاک‌های کد (شامل دکمه کپی)
    const CodeBlock = ({ inline, className, children, ...props }) => {
        const [copied, setCopied] = useState(false);
        const match = /language-(\w+)/.exec(className || '');
        const codeString = String(children).replace(/\n$/, '');

        const handleCopy = () => {
            navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        if (!inline && match) {
            return (
                <div style={{ margin: '16px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--ch-border)' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'rgba(20, 20, 20, 0.8)', padding: '8px 16px',
                        borderBottom: '1px solid var(--ch-border)', fontSize: '0.85rem', color: 'var(--ch-text-dim)'
                    }}>
                        <span style={{ textTransform: 'lowercase' }}>{match[1]}</span>
                        <button onClick={handleCopy} style={{
                            background: 'transparent', border: 'none', color: copied ? 'var(--ch-success)' : 'var(--ch-text-dim)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Vazirmatn', 'InterLocal', sans-serif", transition: 'color 0.2s'
                        }}>
                            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'کپی شد' : 'کپی'}
                        </button>
                    </div>
                    <SyntaxHighlighter
                        {...props}
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, background: 'transparent',fontFamily:'inherit' }}
                    >
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            );
        }
        return <code className={className} style={{ background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', color: '#fb7185' }} {...props}>{children}</code>;
    };

    // ۲. کامپوننت برای هشدارهای گیت‌هاب (Alerts)
    const CustomBlockquote = ({ children, ...props }) => {
        const firstChild = React.Children.toArray(children)[0];
        let alertType = null;
        let newChildren = children;

        // بررسی می‌کنیم که آیا بلاک‌کوت با تگ‌های هشدار شروع شده یا نه
        if (React.isValidElement(firstChild) && firstChild.type === 'p') {
            const pChildren = React.Children.toArray(firstChild.props.children);
            const firstText = pChildren[0];
            if (typeof firstText === 'string') {
                const match = firstText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
                if (match) {
                    alertType = match[1].toLowerCase();
                    // حذف تگ [!NOTE] از ابتدای متن
                    const newFirstText = firstText.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');
                    const newP = React.cloneElement(firstChild, {}, newFirstText, ...pChildren.slice(1));
                    newChildren = [newP, ...React.Children.toArray(children).slice(1)];
                }
            }
        }

        if (alertType) {
            const alertsConfig = {
                note: { icon: <Info size={18} />, title: 'Note', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
                tip: { icon: <Lightbulb size={18} />, title: 'Tip', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
                important: { icon: <AlertCircle size={18} />, title: 'Important', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
                warning: { icon: <AlertTriangle size={18} />, title: 'Warning', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
                caution: { icon: <Octagon size={18} />, title: 'Caution', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
            };
            const config = alertsConfig[alertType];

            return (
                <div style={{
                    borderLeft: `4px solid ${config.color}`,
                    background: config.bg,
                    padding: '12px 16px',
                    borderRadius: '0 8px 8px 0',
                    margin: '16px 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: config.color, fontWeight: '600', marginBottom: '8px' }}>
                        {config.icon} <span>{config.title}</span>
                    </div>
                    <div style={{ color: 'var(--ch-text)' }}>{newChildren}</div>
                </div>
            );
        }
        // اگر هشدار نبود، همان blockquote معمولی را رندر کن
        return <blockquote style={{ borderLeft: '4px solid var(--ch-border)', paddingLeft: '16px', color: 'var(--ch-text-dim)', margin: '16px 0' }} {...props}>{children}</blockquote>;
    };

// ۳. کامپوننت برای لینک‌ها (رفع مشکل رفرش، اسکرول نرم و پشتیبانی کامل از فارسی/ایموجی)
const CustomLink = ({ href, children, ...props }) => {
    if (href && href.startsWith('#')) {
        return (
            <a href={href} onClick={(e) => {
                e.preventDefault();
                const targetId = href.slice(1);
                const decodedId = decodeURIComponent(targetId);
                
                // تلاش اول: پیدا کردن المان با ID دقیق
                let target = document.getElementById(targetId) || document.getElementById(decodedId);
                
                // تلاش دوم: اگر پیدا نشد (به دلیل ایموجی یا نیم‌فاصله در هدرهای فارسی)
                if (!target) {
                    const headers = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6');
                    
                    // حذف نیم‌فاصله (\u200c) و تبدیل خط‌تیره به فاصله برای مطابقت هوشمند
                    const searchStr = decodedId.replace(/-/g, ' ').replace(/[\u200c]/g, '').toLowerCase();
                    
                    for (let header of headers) {
                        const headerText = header.textContent.replace(/[\u200c]/g, '').toLowerCase();
                        if (headerText.includes(searchStr)) {
                            target = header;
                            break;
                        }
                    }
                }

                // اگر هدر پیدا شد، با فاصله مناسب اسکرول کن
                if (target) {
                    const headerOffset = 110; // ارتفاع هدر (جلوگیری از رفتن متن زیر منوی شیشه‌ای)
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }} {...props}>
                {children}
            </a>
        );
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
};

    const getFileLanguage = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        const extensionMap = {
            js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
            py: 'python', php: 'php', cs: 'csharp', cpp: 'cpp',
            html: 'html', css: 'css', json: 'json', md: 'markdown',
            go: 'go', rs: 'rust', yml: 'yaml', yaml: 'yaml', xml: 'xml'
        };
        return extensionMap[ext] || 'text';
    };


    // تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
    const toPersianDigits = (str) => {
        return str.toString().replace(/\d/g, (x) => '۰۱۲۳۴۵۶۷۸۹'[x]);
    };

    const formatDateSafe = (dateString) => {
        if (!dateString) return 'نامشخص';
        
        let normalizedDateString = dateString;
        if (typeof dateString === 'string' && dateString.includes(' | ')) {
            normalizedDateString = dateString.replace(' | ', 'T') + 'Z';
        }
        
        const date = new Date(normalizedDateString);
        
        if (!isValid(date)) return toPersianDigits(dateString);

        // محاسبه زمان نسبی با پشتیبانی از زبان فارسی
        const result = formatDistanceToNow(date, { addSuffix: true, locale: faIR });
        
        // در نهایت خروجی را از فیلتر اعداد فارسی عبور می‌دهیم
        return toPersianDigits(result);
    };
    if (isLoading) {
        return (
            <div className="ch-repo-container content-fade-in">
                {/* اسکلتون یکپارچه برای هدر ریپازیتوری */}
                <div style={{ marginBottom: '20px' }}>
                    <SkeletonLoader height="140px" borderRadius="16px" />
                </div>
                
                <div className="repo-explorer-layout">
                    <aside style={{ border: 'none', padding: 0, background: 'transparent' }}>
                        <SkeletonLoader height="600px" borderRadius="12px" />
                    </aside>

                    {/* اسکلتون یکپارچه برای محتوای اصلی (ریدمی یا فایل) */}
                    <main>
                        <SkeletonLoader height="600px" borderRadius="12px" />
                    </main>
                </div>
            </div>
        );
    }

    if (error || !repo) {
        return (
            <div className="ch-repo-container content-fade-in">
                <button className="back-btn" onClick={() => navigate('/')}><ArrowLeft size={16} /> Back to Home</button>
                <div className="auth-error" style={{ marginTop: '20px' }}>{error || 'Repository not found.'}</div>
            </div>
        );
    }

    return (
        <div className="ch-repo-container content-fade-in">
            {/* Header */}
            <header className="repo-inner-header">
                <div className="header-top-row">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> <span className="hide-text-mobile">برگشت</span>
                    </button>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* این بخش فقط برای سازنده نمایش داده می‌شود */}
                        {isOwner && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className="back-btn action-btn" 
                                    style={{ padding: '6px 16px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}
                                    onClick={() => navigate('/dashboard', { state: { action: 'upload', repo: repo } })} 
                                    title="آپلود فایل"
                                >
                                    <Upload size={16} /> <span className="hide-text-mobile">آپلود</span>
                                </button>
                                
                                <button 
                                    className="back-btn action-btn" 
                                    style={{ padding: '6px 16px', color: 'var(--ch-accent)', borderColor: 'rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)' }}
                                    onClick={() => navigate('/dashboard', { state: { action: 'edit', repo: repo } })} 
                                    title="ویرایش ریپازیتوری"
                                >
                                    <Edit3 size={16} /> <span className="hide-text-mobile">ویرایش</span>
                                </button>
                            </div>
                        )}

                        <div className="repo-meta-tags">
                            <span className="status-dot"></span>
                            <span style={{ textTransform: 'capitalize' }}>
                            {repo.visibility === 'public' ? 'عمومی' : 'خصوصی'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="repo-main-info">
                    <div className="repo-title-wrapper">
                        <div className="repo-icon-box"><Code size={32} /></div>
                        <div className="repo-title-content">
                            <h1>{repo.name}</h1>
                            <p className="repo-desc">{repo.description || 'توضیحاتی برای این ریپازیتوری ثبت نشده است.'}</p>
                        </div>
                    </div>
                    
                    <div className="repo-stats-pills">
                        <div className="pill" style={{ color: 'var(--ch-accent)', borderColor: 'var(--ch-accent)' }}>
                            <Code size={16} /> 
                            {repo.language ? repo.language.split(',').map(l => l.trim()).join(' • ') : 'Unknown'}
                        </div>

                        <button className="pill" 
                            onClick={handleToggleStar}
                            disabled={isStarring}
                            style={{ 
                                cursor: isStarring ? 'wait' : 'pointer',
                                background: isStarred ? 'rgba(168, 85, 247, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                                color: isStarred ? 'var(--ch-accent)' : 'var(--ch-text-dim)',
                                borderColor: isStarred ? 'var(--ch-accent)' : 'var(--ch-border)',
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                fontFamily: 'inherit',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}>
                            {isStarring ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Star 
                                    size={16} 
                                    fill={isStarred ? "var(--ch-accent)" : "none"} 
                                    color={isStarred ? "var(--ch-accent)" : "currentColor"} 
                                />
                            )}
                            <span style={{ direction: 'ltr', display: 'inline-block', minWidth: '10px', textAlign: 'center' }}>
                                {starsCount}
                            </span>
                            {isStarred ? 'ستاره داده شده' : 'ستاره'}
                        </button>
                        
                        <div className="pill">
                            <Calendar size={16} /> 
                            آپدیت شده {formatDateSafe(repo.updated_at)}
                        </div>

                        <button className="pill" 
                            onClick={!isDownloadingRepo ? handleDownloadRepository : undefined} 
                            disabled={isDownloadingRepo}
                            style={{ 
                                cursor: isDownloadingRepo ? 'wait' : 'pointer', 
                                background: isDownloadingRepo ? 'rgba(168, 85, 247, 0.5)' : 'var(--ch-accent)', 
                                color: 'white',
                                border: 'none',
                                fontFamily: 'inherit',
                                fontWeight: '600'
                            }}>
                            {isDownloadingRepo ? (
                                <Loader2 size={16} className="animate-spin" /> 
                            ) : (
                                <Download size={16} />
                            )}
                            {isDownloadingRepo ? 'در حال آماده‌سازی...' : 'دانلود ریپازیتوری'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Layout Code Explorer */}
            <div className="repo-explorer-layout">
                {/* Sidebar: Tree View */}
                <aside className="repo-tree-sidebar">
                    <div style={{ marginBottom: '16px', fontSize: '0.8rem', color: 'var(--ch-text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Project Explorer
                    </div>
                    {fileTree && Object.values(fileTree.children).length > 0 ? (
                        sortTreeNodes(Object.values(fileTree.children)).map((child, idx) => (
                            <TreeNode key={idx} node={child} onFileClick={handleFileClick} activeFileId={activeFile?.id} />
                        ))
                    ) : (
                        <p style={{ color: 'var(--ch-text-dim)', fontSize: '0.9rem' }}>فایلی وجود ندارد</p>
                    )}
                </aside>

                {/* Main Content: File Viewer / README */}
                <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {activeFile ? (
                        <div className="file-list-card content-fade-in" style={{ background: 'var(--ch-surface-glass)', border: '1px solid var(--ch-border)' }}>
                            {/* هدر نمایشگر فایل */}
                            <div style={{ 
                                padding: '12px 20px', 
                                background: 'rgba(0,0,0,0.3)', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                borderBottom: '1px solid var(--ch-border)',
                                gap: '16px' // ایجاد فاصله امن بین متن و دکمه‌ها
                            }}>
                                
                                {/* بخش سمت چپ: آیکون، نام فایل و مسیر (با قابلیت اسکرول) */}
                                <div className="ch-file-header-info" style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    flex: '1 1 0%', // اجازه می‌دهد کل فضای خالی را بگیرد
                                    minWidth: 0, // کلید طلایی: اجازه می‌دهد محتوا اسکرول شود و باکس را نشکند
                                    overflowX: 'auto', // فعال‌سازی اسکرول افقی
                                    paddingBottom: '4px' // فضایی برای اسکرول‌بار
                                }}>
                                    <div style={{ flexShrink: 0 }}>
                                        {getFileIcon(activeFile.file_name)}
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                        {/* نام فایل - درشت و سفید */}
                                        <span style={{ 
                                            fontWeight: 600, 
                                            color: 'white', 
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.95rem' 
                                        }}>
                                            {activeFile.file_name}
                                        </span>
                                        
                                        {/* مسیر فایل - ریز و خاکستری */}
                                        {activeFile.relative_path.includes('/') && (
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                color: 'var(--ch-text-dim)', 
                                                whiteSpace: 'nowrap', 
                                                marginTop: '2px', 
                                                direction: 'ltr', 
                                                textAlign: 'left'
                                            }}>
                                                {/* گرفتن مسیر بدون نام فایل */}
                                                {activeFile.relative_path.substring(0, activeFile.relative_path.lastIndexOf('/') + 1)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* بخش سمت راست: دکمه‌ها */}
                                {/* بخش سمت راست: دکمه‌ها */}
<div className="ch-file-header-actions" style={{ 
    display: 'flex', 
    flexWrap: 'nowrap',
    gap: '8px', 
    flexShrink: 0,
    overflowX: 'auto',
    paddingBottom: '4px'
}}>
    

                                    {isOwner && (
                                        <button 
                                            className="back-btn action-btn" 
                                            style={{ padding: '6px 12px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }} 
                                            onClick={handleDeleteFile}
                                            disabled={isDeletingFile}
                                            title="حذف فایل"
                                        >
                                            {isDeletingFile ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                                            <span className="hide-text-mobile">حذف</span>
                                        </button>
                                    )}
                                    {isOwner && !isBinaryFile && (
                                        <button 
                                            className="back-btn action-btn" 
                                            style={{ padding: '6px 12px', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#eab308', background: 'rgba(234, 179, 8, 0.05)' }} 
                                            onClick={handleOptimizeCode}
                                            disabled={isOptimizing}
                                            title="بهینه‌سازی کد با هوش مصنوعی"
                                        >
                                            {isOptimizing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} 
                                            <span className="hide-text-mobile">بهینه‌سازی</span>
                                        </button>
                                    )}
                                    {!isBinaryFile && (
                                        <button 
                                            className="back-btn action-btn" 
                                            style={{ 
                                                padding: '6px 12px', 
                                                borderColor: getAnalysisStatus(activeFile).isUpToDate ? 'rgba(59, 130, 246, 0.4)' : 'rgba(168, 85, 247, 0.4)', 
                                                color: getAnalysisStatus(activeFile).isUpToDate ? '#3b82f6' : 'var(--ch-accent)', 
                                                background: getAnalysisStatus(activeFile).isUpToDate ? 'rgba(59, 130, 246, 0.05)' : 'rgba(168, 85, 247, 0.05)' 
                                            }} 
                                            onClick={handleCodeAnalysisClick}
                                            disabled={isAnalyzingCode}
                                            title={getAnalysisStatus(activeFile).isUpToDate ? "مشاهده تحلیل (ذخیره شده)" : "تحلیل امنیتی و کیفی کد"}
                                        >
                                            {isAnalyzingCode ? <Loader2 size={16} className="animate-spin" /> : 
                                                getAnalysisStatus(activeFile).isUpToDate ? <Shield size={16} /> : <Activity size={16} />
                                            } 
                                            <span className="hide-text-mobile">
                                                {getAnalysisStatus(activeFile).isUpToDate ? 'مشاهده تحلیل' : 'تحلیل کد'}
                                            </span>
                                        </button>
                                    )}
                                    <button 
                                        className="back-btn action-btn" 
                                        style={{ padding: '6px 12px' }} 
                                        onClick={() => handleDownloadFile(activeFile)}
                                        disabled={isDownloadingFile}
                                        title="دانلود فایل"
                                    >
                                        {isDownloadingFile ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                                        <span className="hide-text-mobile">دانلود</span>
                                    </button>
                                    <button 
                                        className="back-btn action-btn" 
                                        style={{ padding: '6px 12px', borderColor: 'rgba(255,255,255,0.2)' }} 
                                        onClick={() => setActiveFile(null)}
                                        title="بستن"
                                    >
                                        <X size={16} />
                                        <span className="hide-text-mobile">بستن</span>
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '15px', overflowX: 'auto', fontSize: '0.9rem' }}>
                                {isFileLoading ? (
                                    <SkeletonLoader height="400px" borderRadius="8px" />
                                ) : isBinaryFile ? (
                                    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '270px', color: 'var(--ch-text-dim)' }}>
                                        <div style={{ transform: 'scale(4)', marginBottom: '35px', opacity: 0.8 }}>
                                            {getFileIcon(activeFile.file_name)}
                                        </div>
                                        <h3 style={{ marginBottom: '10px', color: 'var(--ch-text)' }}>{activeFile.file_name}</h3>
                                        <p style={{ marginBottom: '25px' }}>این فایل قابل نمایش در ویرایشگر نیست.</p>
                                        <button 
                                            onClick={() => handleDownloadFile(activeFile)}
                                            disabled={isDownloadingFile}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                                background: 'var(--ch-accent)', color: 'white', border: 'none', borderRadius: '8px',
                                                cursor: isDownloadingFile ? 'wait' : 'pointer', fontFamily: 'inherit', fontWeight: 'bold',
                                                opacity: isDownloadingFile ? 0.7 : 1
                                            }}
                                        >
                                            {isDownloadingFile ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                                            {isDownloadingFile ? 'در حال دانلود' : 'دانلود فایل'}
                                        </button>
                                    </div>
                                ) : optimizedContent !== null ? (
                                    <div className="optimization-view content-fade-in" style={{ border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ padding: '12px 15px', background: 'rgba(234, 179, 8, 0.1)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontWeight: 'bold', direction: 'rtl' }}>
                                                <Zap size={18} />
                                                کد بهینه‌شده آماده بررسی است
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', direction: 'rtl' }}>
                                                <button
                                                    onClick={handleAcceptOptimization}
                                                    disabled={isSavingOptimized}
                                                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: isSavingOptimized ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', fontWeight: 'bold' }}
                                                >
                                                    {isSavingOptimized ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                    {isSavingOptimized ? 'در حال ذخیره' : 'تایید و جایگزینی'}
                                                </button>
                                                <button
                                                    onClick={handleRejectOptimization}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
                                                >
                                                    <X size={14} /> لغو
                                                </button>
                                            </div>
                                        </div>
                                        <SyntaxHighlighter
                                            language={getFileLanguage(activeFile.file_name)}
                                            style={atomDark}
                                            customStyle={{ background: 'transparent', padding: '15px', margin: 0 }}
                                            showLineNumbers={true}
                                        >
                                            {optimizedContent}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <SyntaxHighlighter
                                        language={getFileLanguage(activeFile.file_name)}
                                        style={atomDark}
                                        customStyle={{ background: 'transparent', padding: 0, margin: 0 }}
                                        showLineNumbers={true}
                                    >
                                        {fileContent}
                                    </SyntaxHighlighter>
                                )}
                            </div>
                        </div>
                    ) : (
                        readmeContent && (
                            <div className="about-card content-fade-in" style={{ background: 'var(--ch-surface-glass)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: 'white', borderBottom: '1px solid var(--ch-border)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={18} style={{ color: 'var(--ch-accent)' }} />
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>README.md</h3>
                                    </div>

                                    
                                    
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {isOwner && (
                                            <button
                                                onClick={handleGenerateReadme}
                                                disabled={isGeneratingReadme}
                                                style={{
                                                    background: 'rgba(168, 85, 247, 0.15)',
                                                    color: 'var(--ch-accent)',
                                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    cursor: isGeneratingReadme ? 'wait' : 'pointer',
                                                    fontFamily: 'inherit',
                                                    transition: 'all 0.2s ease',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                                onMouseEnter={(e) => { if(!isGeneratingReadme){ e.currentTarget.style.background = 'var(--ch-accent)'; e.currentTarget.style.color = 'white'; } }}
                                                onMouseLeave={(e) => { if(!isGeneratingReadme){ e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)'; e.currentTarget.style.color = 'var(--ch-accent)'; } }}
                                            >
                                                {isGeneratingReadme ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />}
                                               ساختن با هوش مصنوعی 
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setReadmeDirection('ltr')}
                                            style={{ 
                                                background: readmeDirection === 'ltr' ? 'var(--ch-accent)' : 'transparent',
                                                color: readmeDirection === 'ltr' ? 'white' : 'var(--ch-text-dim)',
                                                border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                                                fontFamily: 'inherit', transition: 'all 0.2s ease', fontWeight: readmeDirection === 'ltr' ? '600' : '400'
                                            }}
                                        >
                                            چپ به راست (LTR)
                                        </button>
                                        <button 
                                            onClick={() => setReadmeDirection('rtl')}
                                            style={{ 
                                                background: readmeDirection === 'rtl' ? 'var(--ch-accent)' : 'transparent',
                                                color: readmeDirection === 'rtl' ? 'white' : 'var(--ch-text-dim)',
                                                border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                                                fontFamily: 'inherit', transition: 'all 0.2s ease', fontWeight: readmeDirection === 'rtl' ? '600' : '400'
                                            }}
                                        >
                                            راست به چپ (RTL)
                                        </button>
                                    </div>
                                </div>

                                {/* اعمال هوشمند جهت کامپوننت بر اساس استیت */}
                                <div 
                                    className="markdown-body" 
                                    dir={readmeDirection}
                                    style={{ 
                                        color: 'var(--ch-text)', 
                                        lineHeight: '1.8', 
                                        fontSize: '0.95rem',
                                        textAlign: readmeDirection === 'rtl' ? 'right' : 'left',
                                        /* اگر متن فارسی شد اولویت اول رندر را به Vazirmatn بدهد تا زیباتر دیده شود */
                                        fontFamily: readmeDirection === 'rtl' ? "'Vazirmatn', 'InterLocal', sans-serif" : "inherit"
                                    }}
                                >
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]} 
                                        rehypePlugins={[rehypeRaw, rehypeSlug]} // اضافه شدن rehypeSlug
                                        components={{
                                            code: CodeBlock,
                                            blockquote: CustomBlockquote,
                                            a: CustomLink
                                        }}
                                    >
                                        {readmeContent}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )
                        )}

                    {!activeFile && !readmeContent && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ch-text-dim)', background: 'var(--ch-surface-glass)', borderRadius: '12px', border: '1px solid var(--ch-border)' }}>
                            <Code size={48} style={{ opacity: 0.2, marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
                            <p>یک فایل را از پنل فایل انتخاب کنید تا نمایش داده شود</p>
                            
                            {isOwner && (
                                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', marginBottom: '16px' }}>
                                        <Lightbulb size={32} color="var(--ch-accent)" />
                                    </div>
                                    <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.2rem',direction:'rtl' }}>این ریپازیتوری فایل README ندارد!</h3>
                                    <p style={{ marginBottom: '24px', fontSize: '0.95rem', maxWidth: '400px' }}>
                                        می‌توانید با کمک هوش مصنوعی، همین حالا یک فایل ریدمی حرفه‌ای و استاندارد برای پروژه خود بسازید.
                                    </p>
                                    <button 
                                        onClick={handleGenerateReadme}
                                        disabled={isGeneratingReadme}
                                        style={{ 
                                            background: 'linear-gradient(90deg, #a855f7, #6366f1)', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '12px 28px', 
                                            borderRadius: '8px', 
                                            cursor: isGeneratingReadme ? 'wait' : 'pointer', 
                                            fontFamily: 'inherit', 
                                            fontWeight: 'bold', 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            direction:'rtl',
                                            gap: '10px',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        {isGeneratingReadme ? <Loader2 size={20} className="animate-spin" /> : <SiGithub size={20} />}
                                        {isGeneratingReadme ? 'در حال تفکر' : 'ساخت README با هوش مصنوعی ✨'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default RepoDetail;