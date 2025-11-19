import PropTypes from 'prop-types';

export default function BookCardSkeleton({ listView = false }) {
  if (listView) {
    return (
      <div className="relative group">
        <div className="card flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-5 h-full overflow-hidden bg-gradient-to-r from-card/50 to-card border border-border/50">
          <div className="flex gap-3 sm:contents">
            <div className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 bg-muted/50 rounded-xl">
              <div className="w-full h-full bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 animate-pulse rounded-xl" />
            </div>

            <div className="flex-grow flex flex-col justify-between min-w-0">
              <div className="flex-grow space-y-1.5 sm:space-y-2">
                <div className="h-4 sm:h-5 bg-muted/60 rounded animate-pulse w-full" />
                <div className="h-4 sm:h-5 bg-muted/60 rounded animate-pulse w-3/4" />
                <div className="h-3 sm:h-4 bg-muted/60 rounded animate-pulse w-2/3" />
                <div className="h-5 bg-muted/60 rounded-full animate-pulse w-20" />
              </div>
              
              <div className="flex items-center justify-between mt-2 sm:hidden">
                <div className="h-5 bg-muted/60 rounded animate-pulse w-24" />
              </div>
            </div>
          </div>

          <div className="hidden sm:flex sm:flex-col sm:justify-between sm:min-w-0 sm:flex-grow">
            <div className="flex-grow space-y-2">
              <div className="h-4 bg-muted/60 rounded animate-pulse w-full" />
              <div className="h-4 bg-muted/60 rounded animate-pulse w-5/6" />
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
              <div className="h-7 bg-muted/60 rounded animate-pulse w-24" />
              <div className="flex gap-2">
                <div className="h-9 bg-muted/60 rounded animate-pulse w-20" />
                <div className="h-9 bg-muted/60 rounded animate-pulse w-16" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 sm:hidden">
            <div className="flex-1 h-8 bg-muted/60 rounded animate-pulse" />
            <div className="flex-1 h-8 bg-muted/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-gradient-to-br from-card via-card to-card/80 border border-border/50 rounded-xl shadow-sm">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/30 rounded-t-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 animate-pulse" />
      </div>
      
      {/* Content Container */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col bg-gradient-to-b from-card to-card/50">
        <div className="flex-grow space-y-1 sm:space-y-2">
          {/* Title - 2 lines */}
          <div className="space-y-1.5">
            <div className="h-4 sm:h-5 bg-muted/60 rounded animate-pulse w-full" />
            <div className="h-4 sm:h-5 bg-muted/60 rounded animate-pulse w-4/5" />
          </div>
          {/* Author */}
          <div className="h-3 sm:h-4 bg-muted/60 rounded animate-pulse w-3/5 mt-1" />
          {/* Category badge */}
          <div className="inline-block mt-1">
            <div className="h-5 sm:h-6 bg-muted/60 rounded-full animate-pulse w-20" />
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-auto space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-border/30">
          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="h-5 sm:h-6 bg-muted/60 rounded animate-pulse w-24" />
            {/* Cart button */}
            <div className="h-8 sm:h-10 w-8 sm:w-10 bg-muted/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

BookCardSkeleton.propTypes = {
  listView: PropTypes.bool,
};