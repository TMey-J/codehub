import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { repoService } from '../services/api';
import RepoCard from '../components/repository/RepoCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Sparkles, ArrowRight,ChevronLeft, ChevronRight  } from 'lucide-react';


const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const itemsPerPage = 9;

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const { data } = await repoService.search({ query: searchQuery });
                
                if (data.is_success) {
                    setResults(data.response || []);
                } else {
                    setError(data.errors?.[0] || 'خطایی در جستجو رخ داد.');
                }
            } catch (err) {
                setError(err.response?.data?.errors?.[0] || 'خطای ارتباط با سرور.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
        setCurrentPage(1); // با هر جستجوی جدید برگرد به صفحه اول
    }, [searchQuery]);

    // منطق صفحه‌بندی سمت کلاینت
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = results.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="ch-repo-container content-fade-in" style={{ direction: 'rtl', textAlign: 'right' }}>
            <header className="repo-inner-header" style={{ marginBottom: '30px' }}>
                <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                    <ArrowRight size={16} /> بازگشت
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={28} color="var(--ch-accent)" />
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>نتایج هوش مصنوعی</h1>
                </div>
                <p style={{ color: 'var(--ch-text-dim)', marginTop: '10px' }}>
                    نتایج جستجو برای: <strong style={{ color: 'white' }}>"{searchQuery}"</strong>
                </p>
            </header>

            {error && <div className="auth-error">{error}</div>}

            <div className="ch-grid" style={{ direction: 'ltr', textAlign: 'left' }}>
                {isLoading ? (
                    Array(9).fill(0).map((_, index) => (
                        <div key={index} className="ch-card" style={{ padding: '0', border: 'none' }}>
                            <SkeletonLoader height={200} />
                        </div>
                    ))
                ) : currentItems.length > 0 ? (
                    currentItems.map(repo => (
                        <RepoCard key={repo.id} repo={repo} />
                    ))
                ) : !error ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'var(--ch-surface-glass)', borderRadius: '16px' }}>
                        <h3 style={{ color: 'var(--ch-text)' }}>پروژه‌ای پیدا نشد!</h3>
                        <p style={{ color: 'var(--ch-text-dim)' }}>متاسفانه هوش مصنوعی موردی مرتبط با درخواست شما پیدا نکرد.</p>
                    </div>
                ) : null}
            </div>

            {totalPages > 1 && !isLoading && (
                <div className="ch-pagination" style={{ direction: 'ltr' }}>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
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
                    >
                       <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchResults;