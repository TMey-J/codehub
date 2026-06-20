import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { repoService } from '../services/api';
import RepoCard from '../components/repository/RepoCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
    const pageButtons = useMemo(() => {
        return [...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
                <button
                    key={pageNum}
                    className={currentPage === pageNum ? 'active' : ''}
                    onClick={() => onPageChange(pageNum)}
                >
                    {pageNum}
                </button>
            );
        });
    }, [currentPage, totalPages, onPageChange]);

    if (totalPages <= 1) return null;

    return (
        <div className="ch-pagination">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Previous"
            >
                <ChevronLeft size={18} />
            </button>
            {pageButtons}
            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Next"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
});

const Explore = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const pageFromUrl = Number(searchParams.get('page')) || 1;

    const [repositories, setRepositories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(pageFromUrl);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        setCurrentPage(pageFromUrl);
    }, [pageFromUrl]);

    const fetchRepos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await repoService.getAll(currentPage, 9, query);
            if (data.is_success) {
                setRepositories(data.response?.items ?? []);
                setTotalPages(data.response?.total_pages ?? 1);
                setTotalItems(data.response?.total_items ?? 0);
            } else {
                setError(data.errors?.[0] ?? 'Failed to load repositories.');
            }
        } catch {
            setError('Network error. Could not connect to API.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, query]);

    useEffect(() => {
        fetchRepos();
    }, [fetchRepos]);

    const handlePageChange = useCallback(
        (page) => {
            setCurrentPage(page);
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (page > 1) params.set('page', String(page));
            setSearchParams(params, { replace: true });
        },
        [query, setSearchParams]
    );

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="ch-card" style={{ padding: 0, border: 'none' }}>
                    <SkeletonLoader height={200} />
                </div>
            ));
        }
        if (repositories.length) {
            return repositories.map((repo) => <RepoCard key={repo.id} repo={repo} />);
        }
        if (!error) {
            return (
                <div
                    style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'var(--ch-surface-glass)',
                        borderRadius: '16px',
                        border: '1px solid var(--ch-border)',
                    }}
                >
                    <Search size={48} style={{ color: 'var(--ch-text-dim)', marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--ch-text)', marginBottom: '8px' }}>
                        {query ? 'No repositories found' : 'No repositories available'}
                    </h3>
                    <p style={{ color: 'var(--ch-text-dim)', margin: 0 }}>
                        {query
                            ? `No repositories matching "${query}" were found. Try a different search term.`
                            : 'There are no public repositories yet. Be the first to create one!'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="ch-home-layout content-fade-in" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto' }}>
            <section className="ch-hero" style={{ padding: '40px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Search size={32} color="var(--ch-accent)" />
                    <h1 style={{ margin: 0, fontSize: '2.2rem' }} className="text-gradient">
                        {query ? `"${query}"` : 'Explore Repositories'}
                    </h1>
                </div>
                {!query && (
                    <p style={{ color: 'var(--ch-text-dim)' }}>
                        Discover and explore all public repositories
                    </p>
                )}
            </section>

            <main className="ch-main-content" style={{ padding: '0 40px 60px', boxSizing: 'border-box' }}>
                {error && <div className="auth-error">{error}</div>}
                <div className="ch-grid">{renderContent()}</div>
                {!isLoading && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                )}
            </main>
        </div>
    );
};

export default Explore;