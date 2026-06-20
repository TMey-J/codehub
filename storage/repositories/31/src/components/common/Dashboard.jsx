import React, { useState, useEffect, useRef, useCallback } from 'react';
import { repoService, fileService } from '../services/api';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FolderPlus, Trash2, Edit3, Upload, Globe, Lock, Code, File, ArrowLeft ,ChevronLeft, ChevronRight,Folder, Search, X , Star, FolderGit2, FileText, AlertTriangle, Package, Eye, HardDrive, FolderOpen, Info, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import { Link , useLocation, useNavigate, useSearchParams} from 'react-router-dom';



const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [repos, setRepos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isFromRepo, setIsFromRepo] = useState(false);
    
    const [uploadMode, setUploadMode] = useState('files');
    const [targetPath, setTargetPath] = useState('');

    // مدیریت وضعیت ویوها: 'list' | 'create' | 'edit' | 'upload'
    const [view, setView] = useState('list');
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    // سرچ
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const searchTimerRef = useRef(null);

    // فرم ریپازیتوری
    const [repoForm, setRepoForm] = useState({
        name: '',
        description: '',
        visibility: 'public',
        language: ''
    });

    // فرم آپلود فایل
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [repoFolders, setRepoFolders] = useState(['/']);
    const [isFetchingFolders, setIsFetchingFolders] = useState(false);
    const [repoExistingFiles, setRepoExistingFiles] = useState([]);
    const [showExistingFiles, setShowExistingFiles] = useState(false);
    const [zipWarningAccepted, setZipWarningAccepted] = useState(false);
    const [uploadTargetPath, setUploadTargetPath] = useState('');
    const [isTreeExpanded, setIsTreeExpanded] = useState(true);

    const fetchUserRepos = useCallback(async (page, search) => {
        try {
            setIsLoading(true);
            const { data } = await repoService.getUser(page, 9, search);
            if (data.is_success) {
                setRepos(data.response?.items || []);
                setTotalPages(data.response?.total_pages || 1);
                setTotalItems(data.response?.total_items || 0);
            } else {
                setError('Failed to fetch repositories.');
            }
        } catch (err) {
            setError('Error loading dashboard data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserRepos(currentPage, searchTerm);
    }, [currentPage, searchTerm, fetchUserRepos]);

    useEffect(() => {
        if (location.state?.action && location.state?.repo) {
            const passedRepo = location.state.repo;
            setIsFromRepo(true); // 👈 ذخیره می‌کنیم که از صفحه ریپازیتوری آمده است
            
            if (location.state.action === 'upload') {
                setSelectedRepo(passedRepo);
                setView('upload');
                setError(null);
            } else if (location.state.action === 'edit') {
                setSelectedRepo(passedRepo);
                setRepoForm({
                    name: passedRepo.name,
                    description: passedRepo.description || '',
                    visibility: passedRepo.visibility,
                    language: passedRepo.language
                });
                setView('edit');
            }
            
            window.history.replaceState({}, document.title);
            
        } else {
            const viewParam = searchParams.get('view');
            if (viewParam === 'create') {
                setView('create');
                resetForm();
            }
        }
    }, [location.state, searchParams]);

    // Debounced search
    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setSearchTerm(value.trim());
            setCurrentPage(1);
        }, 500);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);


    const handleFormChange = (e) => {
        setRepoForm({ ...repoForm, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setRepoForm({ name: '', description: '', visibility: 'public', language: '' });
        setSelectedFiles([]);
        setError(null);
        setSuccessMessage(null);
        setTargetPath('');
        setUploadTargetPath('');
        setUploadMode('files');
        setZipWarningAccepted(false);
        setShowExistingFiles(false);
    };

    // زمانی که کاربر وارد تب آپلود می‌شود، فایل‌ها را می‌گیریم
    useEffect(() => {
        if (view === 'upload' && selectedRepo) {
            fetchRepoFolders(selectedRepo.id);
        }
    }, [view, selectedRepo]);

    const fetchRepoFolders = async (repoId) => {
        setIsFetchingFolders(true);
        try {
            const { data } = await fileService.getFiles(repoId);
            if (data.is_success) {
                const files = data.response || [];
                setRepoExistingFiles(files);
                const folders = new Set(['/']);
                
                files.forEach(file => {
                    const parts = file.relative_path.split('/');
                    if (parts.length > 1) {
                        let currentPath = '';
                        for (let i = 0; i < parts.length - 1; i++) {
                            currentPath += (currentPath ? '/' : '') + parts[i];
                            folders.add(currentPath);
                        }
                    }
                });
                
                setRepoFolders(Array.from(folders).sort());
            }
        } catch (err) {
            console.error("Error fetching folders:", err);
        } finally {
            setIsFetchingFolders(false);
        }
    };

    const getFilesForPath = (path) => {
        if (!path || path === '/') {
            return repoExistingFiles.filter(f => !f.relative_path.includes('/'));
        }
        const prefix = path + '/';
        return repoExistingFiles.filter(f => {
            const rel = f.relative_path;
            return rel.startsWith(prefix) && rel.substring(prefix.length).indexOf('/') === -1;
        });
    };

    const handleCreateRepo = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { data } = await repoService.create(repoForm);
            if (data.is_success) {
                setSuccessMessage('Repository created successfully!');
                setCurrentPage(1);
                setSearchTerm('');
                setSearchInput('');
                fetchUserRepos(1, '');
                setView('list');
                resetForm();
            } else {
                setError(data.errors?.[0] || 'Validation failed.');
            }
        } catch (err) {
            setError(err.response?.data?.errors?.[0] || 'Server error occurred.');
        }
    };

    const handleEditClick = (repo) => {
        setSelectedRepo(repo);
        setRepoForm({
            name: repo.name,
            description: repo.description || '',
            visibility: repo.visibility,
            language: repo.language
        });
        setView('edit');
    };

    const handleUpdateRepo = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { data } = await repoService.update({
                id: selectedRepo.id,
                name: repoForm.name,
                description: repoForm.description,
                visibility: repoForm.visibility,
                language: repoForm.language
            });

            if (data.is_success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Repository updated successfully.',
                    background: 'rgba(16, 16, 24, 0.85)',
                    color: '#fff',
                    confirmButtonColor: 'var(--ch-accent)'
                });
                fetchUserRepos(currentPage, searchTerm);
                setView('list');
                resetForm();
            } else {
                const errorMsg = data.errors?.[0] || 'Update failed.';
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: errorMsg,
                    background: 'rgba(16, 16, 24, 0.95)',
                    color: '#fff',
                    confirmButtonColor: '#ff0000',
                    customClass: { popup: 'glass-error-popup' }
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: err.response?.data?.errors?.[0] || 'An unexpected error occurred.',
                background: 'rgba(16, 16, 24, 0.95)',
                color: '#fff',
                confirmButtonColor: '#ff0000',
                customClass: { popup: 'glass-error-popup' }
            });
        }
    };

    const handleDeleteRepo = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff0000', // قرمز بسیار چشم‌گیر و تند
            cancelButtonColor: 'rgba(255, 255, 255, 0.1)',
            confirmButtonText: 'Yes, delete it',
            background: 'rgba(16, 16, 24, 0.85)',
            color: '#fff',
            backdrop: 'rgba(0, 0, 0, 0.6)',
            customClass: {
                popup: 'glass-popup-style', // می‌توانی در App.css به این کلاس افکت بلور بدهی
            }
        });

        if (!result.isConfirmed) return;

        setError(null);
        try {
            const { data } = await repoService.delete({ id });
            if (data.is_success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Repository has been deleted.',
                    background: 'rgba(16, 16, 24, 0.85)',
                    color: '#fff',
                    confirmButtonColor: 'var(--ch-accent)'
                });
                setCurrentPage(1);
                fetchUserRepos(1, searchTerm);
            } else {
                setError(data.errors?.[0] || 'Delete failed.');
            }
        } catch (err) {
            setError('Server error occurred during deletion.');
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (uploadMode === 'zip') {
            if (files.length > 0) {
                const zipFile = files[0];
                const fileExt = zipFile.name.split('.').pop().toLowerCase();
                if (fileExt !== 'zip') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid File',
                        text: 'Only ZIP files are allowed for archive upload.',
                        background: 'rgba(16, 16, 24, 0.95)',
                        color: '#fff',
                        confirmButtonColor: '#ff0000'
                    });
                    e.target.value = '';
                    return;
                }
                if (!zipWarningAccepted) {
                    Swal.fire({
                        icon: 'warning',
                        title: '⚠️ ZIP Upload Warning',
                        html: '<div style="text-align:left;line-height:1.7;font-size:0.9rem;"><p style="color:#fbbf24;font-weight:600;">This action will <b style="color:#ef4444;">delete ALL existing files</b> in the repository!</p><p style="color:#e2e8f0;">The entire project will be replaced with the contents of the ZIP file. This cannot be undone.</p><p style="color:#94a3b8;">Are you sure you want to continue?</p></div>',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Replace All Files',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: 'rgba(255,255,255,0.1)',
                        background: 'rgba(16, 16, 24, 0.95)',
                        color: '#fff',
                        customClass: { popup: 'glass-popup-style' }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setZipWarningAccepted(true);
                            setSelectedFiles(files);
                        } else {
                            e.target.value = '';
                            setSelectedFiles([]);
                        }
                    });
                    return;
                }
            }
        }
        
        setSelectedFiles(files);
    };
    const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadMode === 'zip') {
        if (selectedFiles.length === 0) {
            setError('Please select a ZIP file.');
            return;
        }
        
        const zipFile = selectedFiles[0];
        const fileExt = zipFile.name.split('.').pop().toLowerCase();
        if (fileExt !== 'zip') {
            setError('Only ZIP files are allowed for archive upload. Please select a .zip file.');
            return;
        }
        
        setError(null);
        setIsLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('zip_file', zipFile);
            
            const { data } = await fileService.importZip(selectedRepo.id, formData);
            
            if (data.is_success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'ZIP file extracted and uploaded successfully!',
                    background: 'rgba(16, 16, 24, 0.85)',
                    color: '#fff',
                    confirmButtonColor: 'var(--ch-accent)',
                    timer: 2000
                });
                setView('list');
                setSelectedFiles([]);
                setZipWarningAccepted(false);
            } else {
                setError(data.errors?.[0] || 'ZIP upload failed.');
            }
        } catch (err) {
            console.error('ZIP upload error:', err);
            setError(err.response?.data?.errors?.[0] || 'Error uploading ZIP file.');
        } finally {
            setIsLoading(false);
        }
        return;
    }
    
    if (selectedFiles.length === 0) {
        setError('Please select at least one file.');
        return;
    }
    
    setError(null);
    setIsLoading(true);
    const formData = new FormData();
    const paths = [];
    
    for (const file of selectedFiles) {
    let relativePath = '';
    if (uploadMode === 'folder') {
        const rawPath = file.webkitRelativePath || file.name;
        let cleanTarget = uploadTargetPath.replace(/^\/+|\/+$/g, '');
        if (cleanTarget) {
            const parts = rawPath.split('/');
            parts.shift();
            relativePath = cleanTarget + '/' + parts.join('/');
        } else {
            relativePath = rawPath;
        }
    } else if (uploadMode === 'files') {
        let cleanTarget = uploadTargetPath.replace(/^\/+|\/+$/g, '');
        relativePath = cleanTarget ? `${cleanTarget}/${file.name}` : file.name;
    }

    formData.append('files', file, file.name);
    paths.push(relativePath);
    }
    paths.forEach(p => formData.append('paths', p));
    
    try {
        const { data } = await fileService.uploadFiles(selectedRepo.id, formData);
        if (data.is_success) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Files uploaded successfully!',
                background: 'rgba(16, 16, 24, 0.85)',
                color: '#fff',
                confirmButtonColor: 'var(--ch-accent)'
            });
            setView('list');
            setSelectedFiles([]);
            
            const fileInput = document.getElementById('file-upload-input');
            if (fileInput) fileInput.value = '';
        } else {
            setError(data.errors?.[0] || 'Upload failed.');
        }
    } catch (err) {
        console.error('Upload error:', err);
        setError(err.response?.data?.errors?.[0] || 'Error uploading files.');
    } finally {
        setIsLoading(false);
    }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="ch-pagination">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="قبلی"
                >
                    <ChevronLeft size={18} />
                </button>
                
                {[...Array(totalPages)].map((_, idx) => (
                    <button
                        key={idx + 1}
                        className={currentPage === idx + 1 ? 'active' : ''}
                        onClick={() => setCurrentPage(idx + 1)}
                    >
                        {idx + 1}
                    </button>
                ))}

                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="بعدی"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    };

    return (
        
        <div className="ch-repo-container content-fade-in">
            {view !== 'create' && view !== 'edit'&& view !== 'upload'&&(
            <header className="repo-inner-header">
                <div className="repo-main-info" style={{ alignItems: 'center',textAlign:'center' ,direction:'ltr'}}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>User Dashboard</h1>
                        <p style={{ color: 'var(--ch-text-dim)' }}>Manage your open-source projects, components, and files.</p>
                    </div>
                    {view === 'list' && (
                        <button className="ch-create-btn" onClick={() => { setView('create'); resetForm(); }}>
                            <FolderPlus size={16} /> Create Repository
                        </button>
                    )}
                </div>
            </header>
            )}

            {successMessage && <div className="repo-meta-tags" style={{ marginBottom: '20px', display: 'inline-block' }}>{successMessage}</div>}
            {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

            {/* Search bar for Dashboard */}
            {view === 'list' && (
                <div className="ch-dashboard-search-wrapper" style={{ marginBottom: '24px' }}>
                    <div className="ch-dashboard-search">
                        <Search size={18} style={{ color: 'var(--ch-text-dim)', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search your repositories..."
                            value={searchInput}
                            onChange={handleSearchInput}
                        />
                        {searchInput && (
                            <button
                                className="ch-dashboard-search-clear"
                                onClick={handleClearSearch}
                                title="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    
                </div>
            )}

            {view === 'list' && (
                <div className="ch-grid">
                    {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                            <div key={index} className="ch-card" style={{ padding: '0', border: 'none' }}>
                                <SkeletonLoader height={180} />
                            </div>
                        ))
                    ) : repos.length === 0 ? (
                        <p style={{ color: 'var(--ch-text-dim)' }}>
                            {searchTerm
                                ? `No repositories found matching "${searchTerm}".`
                                : "You don't have any repositories yet. Create one to get started!"}
                        </p>
                    ) : (
                        repos.map(repo => (
                            <div 
                                key={repo.id} 
                                className="ch-card"
                                onClick={() => navigate(`/repo/${repo.owner_name}/${repo.name}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="ch-card-header" style={{ justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="ch-card-icon"><Code size={20} /></div>
                                        <h3>{repo.name}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="ch-icon-btn" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); // جلوگیری از انتقال صفحه هنگام کلیک روی دکمه
                                                handleEditClick(repo); 
                                            }} 
                                            title="Edit Repository"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            className="ch-icon-btn" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); // جلوگیری از انتقال صفحه هنگام کلیک روی دکمه
                                                setSelectedRepo(repo); 
                                                setView('upload'); 
                                                setError(null); 
                                            }} 
                                            title="Upload Files"
                                        >
                                            <Upload size={16} />
                                        </button>
                                        <button 
                                            className="ch-icon-btn" 
                                            style={{ color: '#ef4444' }} 
                                            onClick={(e) => { 
                                                e.stopPropagation(); // جلوگیری از انتقال صفحه هنگام کلیک روی دکمه
                                                handleDeleteRepo(repo.id); 
                                            }} 
                                            title="Delete Repository"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p>{repo.description || 'No description provided.'}</p>
                                <div className="ch-card-footer">
                                    <div className="ch-stats">
                                        <span title="Stars">
                                            <Star 
                                                size={14} 
                                                style={{ 
                                                    color: 'var(--ch-accent)', 
                                                    fill: repo.stars_count > 0 ? 'var(--ch-accent)' : 'none' 
                                                }} 
                                            />
                                            <span style={{ marginLeft: '4px' }}>{repo.stars_count || 0}</span>
                                        </span>
                                    </div>
                                    <span className="ch-tag">{repo.language}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {view === 'list' && !isLoading && renderPagination()}

            {(view === 'create' || view === 'edit') && (
                <div className="ch-form-card">
                    <div className="ch-form-card-header">
                        <button
                            className="back-btn"
                            onClick={() => {
                                if (view === 'edit' && isFromRepo && selectedRepo) {
                                    navigate(`/repo/${selectedRepo.owner_name}/${selectedRepo.name}`);
                                } else {
                                    setView('list');
                                    resetForm();
                                }
                            }}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="ch-form-card-title">
                            <div className="ch-form-card-icon">
                                {view === 'create' ? <FolderGit2 size={28} /> : <Edit3 size={28} />}
                            </div>
                            <div>
                                <h2>{view === 'create' ? 'Create New Repository' : 'Edit Repository'}</h2>
                                <p className="ch-form-card-subtitle">
                                    {view === 'create' ? 'Start a new project and share your code with the world' : `Editing: ${selectedRepo?.name}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={view === 'create' ? handleCreateRepo : handleUpdateRepo} className="ch-form-body">
                        <div className="ch-form-grid">
                            <div className="field">
                                <label className="ch-field-label">
                                    <FolderGit2 size={14} /> Repository Name
                                </label>
                                <input
                                    name="name"
                                    value={repoForm.name}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="my-awesome-project"
                                    disabled={view === 'edit'}
                                    className="ch-input-enhanced"
                                />
                                {view === 'edit' && <span className="ch-field-hint">Repository name cannot be changed after creation</span>}
                            </div>
                            <div className="field">
                                <label className="ch-field-label">
                                    <Code size={14} /> Programming Language
                                </label>
                                <input
                                    name="language"
                                    value={repoForm.language}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="e.g., Python, React, TypeScript"
                                    className="ch-input-enhanced"
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="ch-field-label">
                                <FileText size={14} /> Description
                            </label>
                            <textarea
                                name="description"
                                value={repoForm.description}
                                onChange={handleFormChange}
                                placeholder="Describe your project, its purpose, and technologies used..."
                                rows={4}
                                className="ch-input-enhanced ch-textarea"
                            />
                        </div>

                        <div className="ch-visibility-section">
                            <label className="ch-field-label" style={{ marginBottom: '12px' }}>
                                <Info size={14} /> Visibility
                            </label>
                            <div className="ch-visibility-options">
                                <label className={`ch-visibility-card ${repoForm.visibility === 'public' ? 'active' : ''}`}>
                                    <input type="radio" name="visibility" value="public" checked={repoForm.visibility === 'public'} onChange={handleFormChange} />
                                    <div className="ch-visibility-content">
                                        <Globe size={22} />
                                        <div>
                                            <span className="ch-visibility-title">Public</span>
                                            <span className="ch-visibility-desc">Anyone can see this repository</span>
                                        </div>
                                    </div>
                                </label>
                                <label className={`ch-visibility-card ${repoForm.visibility === 'private' ? 'active' : ''}`}>
                                    <input type="radio" name="visibility" value="private" checked={repoForm.visibility === 'private'} onChange={handleFormChange} />
                                    <div className="ch-visibility-content">
                                        <Lock size={22} />
                                        <div>
                                            <span className="ch-visibility-title">Private</span>
                                            <span className="ch-visibility-desc">Only you can see this repository</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="ch-submit-btn">
                            {view === 'create' ? (
                                <><FolderPlus size={18} /> Create Repository</>
                            ) : (
                                <><Edit3 size={18} /> Save Changes</>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {view === 'upload' && (
                <div className="ch-form-card ch-upload-card">
                    <div className="ch-form-card-header">
                        <button
                            className="back-btn"
                            type="button"
                            onClick={() => {
                                if (isFromRepo && selectedRepo) {
                                    navigate(`/repo/${selectedRepo.owner_name}/${selectedRepo.name}`);
                                } else {
                                    setView('list');
                                    resetForm();
                                }
                            }}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="ch-form-card-title">
                            <div className="ch-form-card-icon">
                                <Upload size={28} />
                            </div>
                            <div>
                                <h2>Upload Content</h2>
                                <p className="ch-form-card-subtitle">
                                    Repository: <strong>{selectedRepo?.name}</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUploadSubmit} className="ch-form-body">
                        {/* Tabs */}
                        <div className="ch-upload-tabs">
                            <button type="button" className={`ch-upload-tab ${uploadMode === 'files' ? 'active' : ''}`} onClick={() => { setUploadMode('files'); setSelectedFiles([]); setZipWarningAccepted(false); }}>
                                <File size={16} /> Files
                            </button>
                            <button type="button" className={`ch-upload-tab ${uploadMode === 'folder' ? 'active' : ''}`} onClick={() => { setUploadMode('folder'); setSelectedFiles([]); setZipWarningAccepted(false); }}>
                                <FolderOpen size={16} /> Folder
                            </button>
                            <button type="button" className={`ch-upload-tab ${uploadMode === 'zip' ? 'active' : ''}`} onClick={() => { setUploadMode('zip'); setSelectedFiles([]); setZipWarningAccepted(false); }}>
                                <Package size={16} /> Zip
                            </button>
                        </div>

                        {/* Target Path Selector - for all modes */}
                        <div className="ch-upload-path-section">
                            <label className="ch-field-label">
                                <Folder size={14} /> Target Path
                            </label>
                            {isFetchingFolders ? (
                                <div className="ch-upload-loading">
                                    <div className="luminous-loader" style={{ width: '20px', height: '20px', borderWidth: '2px', margin: '0 auto 8px' }}></div>
                                    <span>Loading folder structure...</span>
                                </div>
                            ) : (
                                <div className="ch-folder-selector">
                                    {repoFolders.map((folder, idx) => {
                                        const isSelected = uploadTargetPath === (folder === '/' ? '' : folder);
                                        const isRoot = folder === '/';
                                        const parts = folder.split('/');
                                        const depth = isRoot ? 0 : parts.length;
                                        const displayName = isRoot ? 'Root (/)' : parts[parts.length - 1];
                                        const filesInFolder = getFilesForPath(isRoot ? '/' : folder);
                                        
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setUploadTargetPath(folder === '/' ? '' : folder)}
                                                className={`ch-folder-item ${isSelected ? 'selected' : ''}`}
                                                style={{ paddingLeft: `${14 + (depth * 20)}px` }}
                                            >
                                                {!isRoot && depth > 1 && (
                                                    <div className="ch-folder-tree-line" style={{ left: `${14 + ((depth - 1) * 20) + 6}px` }} />
                                                )}
                                                <Folder size={15} className="ch-folder-icon" />
                                                <span className="ch-folder-name">{displayName}</span>
                                                <span className="ch-folder-file-count">{filesInFolder.length} files</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Existing Files Tree - Read Only */}
                        <div className="ch-existing-files-section">
                            <button
                                type="button"
                                className="ch-existing-files-toggle"
                                onClick={() => setShowExistingFiles(!showExistingFiles)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Eye size={15} />
                                    <span>Existing Files ({repoExistingFiles.length})</span>
                                </div>
                                {showExistingFiles ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                            {showExistingFiles && (
                                <div className="ch-existing-files-list">
                                    {repoExistingFiles.length === 0 ? (
                                        <div className="ch-empty-files">
                                            <HardDrive size={20} />
                                            <span>No files in repository yet</span>
                                        </div>
                                    ) : (
                                        repoExistingFiles.map((file, idx) => (
                                            <div key={idx} className="ch-existing-file-item">
                                                <File size={13} />
                                                <span className="ch-existing-file-name">{file.relative_path}</span>
                                                <span className="ch-existing-file-size">{file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ZIP Warning */}
                        {uploadMode === 'zip' && (
                            <div className="ch-zip-warning">
                                <AlertTriangle size={18} />
                                <div>
                                    <strong>Warning:</strong> Uploading a ZIP file will <span>permanently delete all existing files</span> and replace them with the archive contents.
                                </div>
                            </div>
                        )}

                        {/* Drop Zone */}
                        <div className="ch-drop-zone">
                            <input
                                type="file"
                                multiple={uploadMode === 'files'}
                                {...(uploadMode === 'folder' ? {
                                    webkitdirectory: "true",
                                    directory: "true",
                                    multiple: true
                                } : {})}
                                {...(uploadMode === 'zip' ? {
                                    accept: ".zip",
                                    multiple: false
                                } : {})}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="file-upload-input"
                            />
                            <label htmlFor="file-upload-input" className="ch-drop-zone-label">
                                <div className="ch-drop-zone-icon">
                                    <Upload size={36} />
                                </div>
                                <span className="ch-drop-zone-title">
                                    {uploadMode === 'files' && 'Click to select files'}
                                    {uploadMode === 'folder' && 'Click to select a folder'}
                                    {uploadMode === 'zip' && 'Click to select a .zip archive'}
                                </span>
                                <span className="ch-drop-zone-hint">
                                    {uploadMode === 'files' && 'Select one or more files to upload'}
                                    {uploadMode === 'folder' && 'Folder structure will be preserved'}
                                    {uploadMode === 'zip' && 'The archive will be automatically extracted'}
                                </span>
                            </label>
                        </div>

                        {/* Selected Files Preview */}
                        {selectedFiles.length > 0 && (
                            <div className="ch-selected-files">
                                <div className="ch-selected-files-header">
                                    <File size={15} />
                                    <span>Selected Files ({selectedFiles.length})</span>
                                </div>
                                <div className="ch-selected-files-list">
                                    {selectedFiles.slice(0, 15).map((file, idx) => (
                                        <div key={idx} className="ch-selected-file-item">
                                            <File size={13} />
                                            <span>{file.webkitRelativePath || file.name}</span>
                                        </div>
                                    ))}
                                    {selectedFiles.length > 15 && (
                                        <div className="ch-selected-more">...and {selectedFiles.length - 15} more files</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        {isLoading ? (
                            <div className="ch-upload-loading">
                                <div className="luminous-loader"></div>
                                <p>{uploadMode === 'zip' ? 'Extracting and uploading...' : 'Uploading files...'}</p>
                            </div>
                        ) : (
                            <button type="submit" className="ch-submit-btn">
                                <Upload size={18} /> Start Upload
                            </button>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

export default Dashboard;