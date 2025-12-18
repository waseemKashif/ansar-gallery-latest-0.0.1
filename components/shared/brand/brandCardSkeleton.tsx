export default function BrandCardSkeleton() {
  return (
    <div className="flex flex-col items-center py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 animate-pulse">
      {/* Logo skeleton */}
      <div className="w-full flex items-center justify-center overflow-hidden relative mb-2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      {/* Brand name skeleton */}
      <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
    </div>
  );
}

