export default function BookCardSkeleton() {
  return (
    <div className="card h-full">
      <div className="aspect-[3/4] bg-muted skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-6 bg-muted skeleton rounded" />
        <div className="h-4 bg-muted skeleton rounded w-3/4" />
        <div className="h-4 bg-muted skeleton rounded w-1/2" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-muted skeleton rounded w-20" />
          <div className="h-9 bg-muted skeleton rounded w-9" />
        </div>
      </div>
    </div>
  );
}