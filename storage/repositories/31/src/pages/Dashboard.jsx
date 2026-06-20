import React, { useState, useEffect } from 'react';
import { repoService, fileService } from '../services/api';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FolderPlus, Trash2, Edit3, Upload, Globe, Lock, Code, File, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
    const navigate = useNavigate();
    const [repos, setRepos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const [uploadMode, setUploadMode] = useState('files');
    const [targetPath, setTargetPath] = useState('');

    // مدیریت وضعیت ویوها: 'list' | 'create' | 'edit' | 'upload'
    const [view, setView] = useState('list'); 
    const [selectedRepo, setSelectedRepo] = useState(null);

    // فرم ریپازیتوری
    const [repoForm, setRepoForm] = useState({
        name: '',
        description: '',
        visibility: 'public',
        language: ''
    });

    // فرم آپلود فایل
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        fetchUserRepos();
    }, []);

    const fetchUserRepos = async () => {
        try {
            setIsLoading(true);
            const { data } = await repoService.getUser();
            if (data.is_success) {
                setRepos(data.response || []);
            } else {
                setError('Failed to fetch repositories.');
            }
        } catch (err) {
            setError('Error loading dashboard data.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setRepoForm({ ...repoForm, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setRepoForm({ name: '', description: '', visibility: 'public', language: '' });
        setSelectedFiles([]);
        setError(null);
        setSuccessMessage(null);
        setTargetPath(''); // اضافه کردن این خط
        setUploadMode('files'); // ریست کردن mode
    };

    const handleCreateRepo = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { data } = await repoService.create(repoForm);
            if (data.is_success) {
                setSuccessMessage('Repository created successfully!');
                fetchUserRepos();
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
                fetchUserRepos();
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
                fetchUserRepos();
            } else {
                setError(data.errors?.[0] || 'Delete failed.');
            }
        } catch (err) {
            setError('Server error occurred during deletion.');
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // اعتبارسنجی برای حالت ZIP
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
                    e.target.value = ''; // پاک کردن input
                    return;
                }
            }
        }
        
        setSelectedFiles(files);
    };
    const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    // بررسی فایل ZIP در حالت آپلود
    if (uploadMode === 'zip') {
        if (selectedFiles.length === 0) {
            setError('Please select a ZIP file.');
            return;
        }
        
        const zipFile = selectedFiles[0];
        // بررسی پسوند فایل
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
            
            // استفاده از API اختصاصی importZip
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
    
    // کد قبلی برای حالت‌های files و folder
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
            relativePath = file.webkitRelativePath || file.name;
        } else if (uploadMode === 'files') {
            let cleanTarget = targetPath.replace(/^\/+|\/+$/g, '');
            relativePath = cleanTarget ? `${cleanTarget}/${file.name}` : file.name;
        }
        formData.append('files', file);
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

    return (
        <div className="ch-repo-container content-fade-in">
            <header className="repo-inner-header">
                <div className="repo-main-info" style={{ alignItems: 'center' }}>
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

            {successMessage && <div className="repo-meta-tags" style={{ marginBottom: '20px', display: 'inline-block' }}>{successMessage}</div>}
            {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

            {view === 'list' && (
                <div className="ch-grid">
                    {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                            <div key={index} className="ch-card" style={{ padding: '0', border: 'none' }}>
                                <SkeletonLoader height={180} />
                            </div>
                        ))
                    ) : repos.length === 0 ? (
                        <p style={{ color: 'var(--ch-text-dim)' }}>You don't have any repositories yet. Create one to get started!</p>
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
                                        <span>
                                            {repo.visibility === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                                            <span style={{ textTransform: 'capitalize' }}>{repo.visibility}</span>
                                        </span>
                                    </div>
                                    <span className="ch-tag">{repo.language}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* نمای فرم ساخت / ویرایش */}
            {(view === 'create' || view === 'edit') && (
                <div className="auth-card" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: 'var(--ch-surface-glass)' }}>
                    <button className="back-btn" style={{ marginBottom: '20px' }} onClick={() => setView('list')}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h2 style={{ marginBottom: '24px' }}>{view === 'create' ? 'Create New Repository' : 'Edit Repository'}</h2>
                    <form onSubmit={view === 'create' ? handleCreateRepo : handleUpdateRepo}>
                        <div className="field">
                            <input 
                                name="name" 
                                value={repoForm.name} 
                                onChange={handleFormChange} 
                                required 
                                placeholder=" "
                                disabled={view === 'edit'} // طبق استانداردهای مرسوم نام ریپازیتوری در حالت ادیت ثابت می‌ماند
                            />
                            <label>Repository Name (letters, numbers, -, _)</label>
                        </div>
                        <div className="field">
                            <input 
                                name="language" 
                                value={repoForm.language} 
                                onChange={handleFormChange} 
                                required 
                                placeholder=" "
                            />
                            <label>Programming Language (e.g., Python, React)</label>
                        </div>
                        <div className="field">
                            <textarea 
                                name="description" 
                                value={repoForm.description} 
                                onChange={handleFormChange}
                                placeholder="Description (Optional)"
                                rows={4}
                                style={{
                                    width: '94%', padding: '12px 10px', background: '#00000073', 
                                    border: '1px solid var(--ch-border)', borderRadius: '8px', color: 'white', fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <div className="field" style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingLeft: '10px' }}>
                            <span style={{ color: 'var(--ch-text-dim)' }}>Visibility:</span>
                            <label style={{ position: 'static', transform: 'none', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input type="radio" name="visibility" value="public" checked={repoForm.visibility === 'public'} onChange={handleFormChange} /> Public
                            </label>
                            <label style={{ position: 'static', transform: 'none', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input type="radio" name="visibility" value="private" checked={repoForm.visibility === 'private'} onChange={handleFormChange} /> Private
                            </label>
                        </div>
                        <button type="submit" style={{ marginTop: '20px' }}>
                            {view === 'create' ? 'Create Repository' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )}

            {view === 'upload' && (
                <div className="auth-card" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', background: 'var(--ch-surface-glass)' }}>
                    <button className="back-btn" type="button" style={{ marginBottom: '20px' }} onClick={() => setView('list')}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    
                    <h2 style={{ marginBottom: '10px' }}>Upload Content</h2>
                    <p style={{ color: 'var(--ch-text-dim)', marginBottom: '24px', fontSize: '0.9rem' }}>
                        Repository: <strong style={{ color: 'white' }}>{selectedRepo?.name}</strong>
                    </p>

                    <div className="upload-type-selector">
                        <button type="button" className={`upload-type-btn ${uploadMode === 'files' ? 'active' : ''}`} onClick={() => { setUploadMode('files'); setSelectedFiles([]); }}>
                            Single/Multiple Files
                        </button>
                        <button type="button" className={`upload-type-btn ${uploadMode === 'folder' ? 'active' : ''}`} onClick={() => { setUploadMode('folder'); setSelectedFiles([]); }}>
                            Entire Folder
                        </button>
                        <button type="button" className={`upload-type-btn ${uploadMode === 'zip' ? 'active' : ''}`} onClick={() => { setUploadMode('zip'); setSelectedFiles([]); }}>
                            Zip Extract
                        </button>
                    </div>

                    <form onSubmit={handleUploadSubmit}>
                        {uploadMode === 'files' && (
                            <div className="field">
                                <input
                                    name="targetPath"
                                    value={targetPath}
                                    onChange={(e) => setTargetPath(e.target.value)}
                                    placeholder=" "
                                />
                                <label>Target Directory (e.g. src/components/ - optional)</label>
                            </div>
                        )}

                        <div className="field" style={{ border: '1px dashed var(--ch-border)', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: 'rgba(0, 0, 0, 0.4)' }}>
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
                            <label htmlFor="file-upload-input" style={{ position: 'static', transform: 'none', pointerEvents: 'auto', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <Upload size={40} style={{ color: 'var(--ch-accent)' }} />
                                <span style={{ color: 'white', fontWeight: '500' }}>
                                    {uploadMode === 'files' && 'Click to select files'}
                                    {uploadMode === 'folder' && 'Click to select a folder (preserves structure)'}
                                    {uploadMode === 'zip' && 'Click to select a .zip archive (auto-extract)'}
                                </span>
                                {uploadMode === 'folder' && selectedFiles.length > 0 && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--ch-text-dim)', marginTop: '8px' }}>
                                        Selected folder contains: {selectedFiles.length} files
                                    </span>
                                )}
                                {uploadMode === 'zip' && selectedFiles.length > 0 && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--ch-success)', marginTop: '8px' }}>
                                        Selected: {selectedFiles[0]?.name}
                                    </span>
                                )}
                            </label>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div style={{ marginTop: '20px', maxHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--ch-accent)', marginBottom: '10px', fontWeight: '600' }}>Selected ({selectedFiles.length}):</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                                    {selectedFiles.slice(0, 10).map((file, idx) => (
                                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--ch-text-dim)' }}>
                                            <File size={14} /> {file.webkitRelativePath || file.name}
                                        </li>
                                    ))}
                                    {selectedFiles.length > 10 && (
                                        <li style={{ color: 'var(--ch-text-dim)', fontStyle: 'italic', marginTop: '8px' }}>...and {selectedFiles.length - 10} more files</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {isLoading ? (
                            <div style={{ textAlign: 'center', marginTop: '25px' }}>
                                <div className="luminous-loader"></div>
                                <p style={{ color: 'var(--ch-text-dim)', marginTop: '10px' }}>
                                    {uploadMode === 'zip' ? 'Extracting and uploading...' : 'Uploading files...'}
                                </p>
                            </div>
                        ) : (
                            <button type="submit" style={{ marginTop: '25px' }}>
                                Start Upload Process
                            </button>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

export default Dashboard;