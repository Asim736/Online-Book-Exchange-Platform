import React from 'react';
import './styles/SkeletonCard.css';

const SkeletonCard = () => {
    return (
        <div className="book-card skeleton-card">
            {/* Image Skeleton - Fixed dimensions to prevent layout shift */}
            <div className="book-image-container skeleton-image">
                <div className="skeleton-shimmer"></div>
            </div>

            {/* Book Info Skeleton */}
            <div className="book-info">
                <div className="skeleton-title skeleton-shimmer"></div>
                <div className="skeleton-author skeleton-shimmer"></div>
                
                {/* Meta Tags Skeleton */}
                <div className="book-meta">
                    <div className="skeleton-tag skeleton-shimmer"></div>
                </div>
            </div>
        </div>
    );
};

// Component to render multiple skeleton cards
export const SkeletonCardGrid = ({ count = 6 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
            ))}
        </>
    );
};

export default SkeletonCard;
