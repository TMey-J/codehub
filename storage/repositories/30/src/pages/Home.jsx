import React, { useState, useEffect } from 'react';
import { repoService } from '../services/api';
import RepoCard from '../components/repository/RepoCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

const Home = () => {
    const [repositories, setRepositories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                setIsLoading(true);
                const { data } = await repoService.getAll();
                if (data.is_success) {
                    setRepositories(data.response || []);
                } else {
                    setError(data.errors?.[0] || 'Failed to load repositories.');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Network error. Could not connect to API.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRepos();
    }, []);

    return (
        <>
            <section className="ch-hero">
                <h1>Welcome to <span className="text-gradient">CodeHub</span></h1>
                <p>Explore, collaborate, and create. Discover a universe of open-source projects.</p>
            </section>
            <div className="ch-home-layout content-fade-in" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto' }}>
                <main className="ch-main-content">
                    <h2>Latest Repositories</h2>
                    {error && <div className="auth-error">{error}</div>}
                    <div className="ch-grid">
                        {isLoading ? (
                            Array(6).fill(0).map((_, index) => (
                                <div key={index} className="ch-card" style={{ padding: '0', border: 'none' }}>
                                    <SkeletonLoader height={200} />
                                </div>
                            ))
                        ) : (
                            repositories.map(repo => (
                                <RepoCard key={repo.id} repo={repo} />
                            ))
                        )}
                        {!isLoading && repositories.length === 0 && !error && (
                            <p style={{ color: 'var(--ch-text-dim)' }}>No repositories found.</p>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default Home;