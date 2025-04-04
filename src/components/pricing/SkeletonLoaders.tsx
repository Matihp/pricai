import { Skeleton } from "../ui/skeleton";
export const prerender = false;

export function ServiceCardSkeleton() {
  return (
    <div className="bg-card flex flex-col h-[369px] text-card-foreground gap-6 rounded-xl border py-6 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-center px-6 gap-3">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <Skeleton className="h-6 w-3/5" />
      </div>
      
      <div className="px-6">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="flex flex-wrap gap-1 mb-4 px-6">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
      </div>

      <div className="mb-4 px-6">
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="flex justify-around border-t pt-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </>
  );
}

export function FilterSidebarSkeleton() {
  return (
    <div className="w-full md:w-64 shrink-0 space-y-6">
      <div>
        <Skeleton className="h-6 w-1/2 mb-4" />
        <div className="space-y-2">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
      </div>

      <div>
        <Skeleton className="h-6 w-1/2 mb-4" />
        <div className="space-y-2">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <div className="space-y-6 flex-1">
      <div className="flex items-center gap-2 border-b">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      <ServiceGridSkeleton />
    </div>
  );
}
