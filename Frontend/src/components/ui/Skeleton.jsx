const Skeleton = ({ className = "" }) => {
  return <div className={`animate-pulse rounded-2xl bg-white/10 ${className}`} />;
};

const CardSkeleton = () => {
  return (
    <div className="glass-panel card-glow rounded-2xl p-6">
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="mb-3 h-10 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
};

export { CardSkeleton, Skeleton };
