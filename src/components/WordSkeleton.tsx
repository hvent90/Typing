import React from "react";

export function WordSkeleton() {
  return (
    <div className="word-skeleton">
      <div className="skeleton-line">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="skeleton-line">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function OfflineNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="offline-notice">
      <span>couldn't load words - using offline list</span>
      <button onClick={onRetry}>retry</button>
    </div>
  );
}
