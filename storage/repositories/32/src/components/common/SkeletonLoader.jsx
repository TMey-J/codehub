import React from 'react';

const SkeletonLoader = ({ width = '100%', height = '150px', borderRadius = '8px', className = '' }) => {
  return (
    <div
      className={`skeleton-block ${className}`}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius
      }}
    ></div>
  );
};

export default SkeletonLoader;