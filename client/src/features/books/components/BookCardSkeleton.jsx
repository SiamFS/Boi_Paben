import PropTypes from 'prop-types';

export default function BookCardSkeleton({ listView = false }) {
  if (listView) {
    return (
      <div className="card flex gap-4 p-5 h-full">
        <div className="w-24 h-32 bg-muted rounded-xl skeleton" />
        <div className="flex-grow flex flex-col justify-between min-w-0">
          <div className="flex-grow space-y-3">
            <div className="h-6 bg-muted rounded skeleton" />
            <div className="h-4 bg-muted rounded w-3/4 skeleton" />
            <div className="h-6 bg-muted rounded w-20 skeleton" />
            <div className="h-4 bg-muted rounded w-full skeleton" />
            <div className="h-4 bg-muted rounded w-2/3 skeleton" />
          </div>
          <div className="flex items-center justify-between mt-4 pt-3">
            <div className="h-8 bg-muted rounded w-24 skeleton" />
            <div className="flex gap-2">
              <div className="h-9 bg-muted rounded w-20 skeleton" />
              <div className="h-9 bg-muted rounded w-16 skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-gradient-to-br from-card via-card to-card/80 border border-border/50 rounded-xl shadow-sm">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-t-xl">
        <div className="absolute inset-0 bg-muted animate-pulse" />
      </div>
      
      {/* Content Container */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col bg-gradient-to-b from-card to-card/50">
        <div className="flex-grow space-y-1 sm:space-y-2">
          <div className="h-5 sm:h-6 bg-muted skeleton rounded min-h-[2rem] sm:min-h-[2.5rem]" />
          <div className="h-4 sm:h-5 bg-muted skeleton rounded w-3/4 min-h-[1rem] sm:min-h-[1.25rem]" />
          <div className="h-5 bg-muted skeleton rounded w-16" />
        </div>
        <div className="mt-auto space-y-2 pt-2 sm:pt-3 border-t border-border/30">
          <div className="flex justify-between items-center">
            <div className="h-6 sm:h-7 bg-muted skeleton rounded w-20" />
            <div className="h-8 sm:h-9 bg-muted skeleton rounded w-8 sm:w-9" />
          </div>
        </div>
      </div>
    </div>
  );
}

BookCardSkeleton.propTypes = {
  listView: PropTypes.bool,
};