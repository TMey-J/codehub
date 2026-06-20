import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonLoader = ({ count = 1, height, className }) => {
    return (
        <SkeletonTheme baseColor="rgba(255, 255, 255, 0.05)" highlightColor="rgba(168, 85, 247, 0.15)">
            <Skeleton count={count} height={height} className={className} style={{ borderRadius: '12px' }} />
        </SkeletonTheme>
    );
};

export default SkeletonLoader;