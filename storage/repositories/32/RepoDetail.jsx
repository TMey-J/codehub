import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { repoService, fileService , downloadRepo } from '../services/api';
import SkeletonLoader from '../components/common/SkeletonLoader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { faIR } from 'date-fns/locale';
import rehypeSlug from 'rehype-slug';
import { Code, Folder, File, ArrowLeft, Globe, Lock, Download, Calendar, ChevronRight, ChevronDown, FileText, Copy, Check, Info, Lightbulb, AlertTriangle, AlertCircle, Octagon } from 'lucide-react';
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
    // وابستگی‌های useEffect آپدیت شدن
    useEffect(() => {
        fetchRepositoryData();
    }, [ownerName, repoName]);

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
            // ارسال نام سازنده و نام ریپازیتوری به سرویس API
            const repoRes = await repoService.getOne(ownerName, repoName);
            if (!repoRes.data.is_success) {
                setError('Repository not found.');
                return;
            }
            const repoData = repoRes.data.response;
            setRepo(repoData);
            const filesRes = await fileService.getFiles(repoData.id);
            if (filesRes.data.is_success) {
                const fetchedFiles = filesRes.data.response || [];
                setFiles(fetchedFiles);
                setFileTree(buildFileTree(fetchedFiles));
                const readmeFile = fetchedFiles.find(f => f.relative_path.toLowerCase() === 'readme.md' || f.file_name.toLowerCase() === 'readme.md');
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
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Download Failed', background: 'rgba(16, 16, 24, 0.95)', color: '#fff' });
        }
    };

    const handleDownloadRepository = async () => {
        try {
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
            
            Swal.fire({
                icon: 'success',
                title: '!دانلود شروع شد',
                text: 'کل ریپازیتوری در حال دانلود است',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'دانلود ناموفق',
                text: 'امکان دانلود ریپازیتوری وجود ندارد',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff'
            });
        }
    };

    const handleFileClick = async (file) => {
        if (file.is_binary) {
            Swal.fire({
                icon: 'info',
                title: 'Binary File',
                text: 'This file cannot be viewed in the editor. Downloading instead...',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
                timer: 2000,
                showConfirmButton: false
            });
            handleDownloadFile(file);
            return;
        }

        try {
            setIsFileLoading(true);
            setActiveFile(file);
            setFileContent('');
            const { data } = await fileService.getContent(repo.id, file.id);
            if (data.is_success) {
                if (data.response.is_binary) {
                    handleDownloadFile(file);
                    setActiveFile(null);
                } else {
                    setFileContent(data.response.content || '');
                }
            } else {
                throw new Error('Could not view file content.');
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error fetching file', background: 'rgba(16, 16, 24, 0.95)', color: '#fff' });
            setActiveFile(null);
        } finally {
            setIsFileLoading(false);
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
                        <ArrowLeft size={16} /> برگشت
                    </button>
                    <div className="repo-meta-tags">
                        <span className="status-dot"></span>
                        <span style={{ textTransform: 'capitalize' }}>
                        {repo.visibility === 'public' ? 'عمومی' : 'خصوصی'}
                        </span>
                    </div>
                </div>
                <div className="repo-main-info">
                    <div className="repo-title-wrapper">
                        <div className="repo-icon-box"><Code size={28} /></div>
                        <div>
                            <h1>{repo.name}</h1>
                            <p>{repo.description || 'No description provided.'}</p>
                        </div>
                    </div>
                    <div className="repo-stats-pills">
                        <div className="pill" style={{ color: 'var(--ch-accent)' }}>
                            <Code size={14} /> 
                            {repo.language ? repo.language.split(',').map(l => l.trim()).join(' • ') : 'Unknown'}
                        </div>
                        <div className="pill"><Calendar size={14} /> آپدیت شده {formatDateSafe(repo.updated_at)}</div>
                        <div className="pill" onClick={handleDownloadRepository} style={{ cursor: 'pointer', background: 'var(--ch-accent)', color: 'white' }}>
                            <Download size={14} /> دانلود ریپازیتوری
                        </div>
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
                            <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ch-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {getFileIcon(activeFile.file_name)}
                                    <span style={{ fontWeight: 600 }}>{activeFile.relative_path}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="back-btn" style={{ padding: '4px 12px' }} onClick={() => handleDownloadFile(activeFile)}>
                                        <Download size={14} /> دانلود
                                    </button>
                                    <button className="back-btn" style={{ padding: '4px 12px', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => setActiveFile(null)}>
                                        بستن
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '15px', overflowX: 'auto', fontSize: '0.9rem' }}>
                                {isFileLoading ? (
                                    <SkeletonLoader height="400px" borderRadius="8px" />
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
                                    
                                    {/* دکمه‌های سوییچ جهت متن با رعایت دیزاین پروژه و font-family: inherit */}
                                    <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px', border: '1px solid var(--ch-border)' }}>
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
                            <Code size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>یک فایل را از پنل سمت چپ انتخاب کنید تا نمایش داده شود</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default RepoDetail;