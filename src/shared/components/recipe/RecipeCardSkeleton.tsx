import { Skeleton } from '@/shared/components/ui/skeleton';

export const RecipeCardSkeleton = () => (
  <div className="relative rounded-2xl overflow-hidden w-[200px] h-[200px] shrink-0 border border-neutral-200 bg-white">
    {/* Image placeholder */}
    <Skeleton className="absolute inset-0 w-full h-full" />
    
    {/* Bottom info placeholder */}
    <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-white/90 backdrop-blur-md rounded-b-2xl">
      {/* Category badge */}
      <Skeleton className="w-12 h-4 mb-2 rounded" />
      
      {/* Title */}
      <Skeleton className="w-3/4 h-5 mb-2 rounded" />
      
      {/* Meta info */}
      <div className="flex gap-3">
        <Skeleton className="w-12 h-3 rounded" />
        <Skeleton className="w-12 h-3 rounded" />
      </div>
    </div>
  </div>
);
