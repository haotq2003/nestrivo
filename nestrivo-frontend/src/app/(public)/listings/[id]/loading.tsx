export default function ListingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-slate-200 rounded-md" />

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 xl:gap-12 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-8 sm:h-10 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-slate-200 rounded-md" />
          </div>

          <div className="aspect-[16/10] sm:h-[460px] w-full bg-slate-200 rounded-2xl" />

          <div className="grid grid-cols-4 gap-3">
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-20 bg-slate-200 rounded-xl" />
          </div>

          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>

        {/* Right Sticky Rail */}
        <div className="h-[480px] bg-slate-200 rounded-2xl hidden lg:block" />
      </div>
    </div>
  );
}

