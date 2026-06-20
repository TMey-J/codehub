import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Lock, Globe, User } from 'lucide-react';

const RepoCard = ({ repo }) => {
    return (
        <Link to={`/repo/${repo.owner_name}/${repo.name}`} className="ch-card">
            <div className="ch-card-header">
                <div className="ch-card-icon">
                    <Code size={24} />
                </div>
                <h3>{repo.name}</h3>
            </div>
            <p>{repo.description || 'No description provided.'}</p>
            <div className="ch-card-footer">
                <div className="ch-stats">
                    <span>
                        {repo.visibility === 'public' ? <Globe size={16} /> : <Lock size={16} />}
                        <span style={{ textTransform: 'capitalize' }}>{repo.visibility}</span>
                    </span>
                    {repo.owner_name && (
                        <span>
                            <User size={14} />
                            <span>{repo.owner_name}</span>
                        </span>
                    )}
                </div>
                <span className="ch-tag">{repo.language || 'Unknown'}</span>
            </div>
        </Link>
    );
};

export default RepoCard;