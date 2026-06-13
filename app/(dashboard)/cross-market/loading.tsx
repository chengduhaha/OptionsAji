function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-5">
      <div className="h-3 w-20 rounded bg-muted/50" />
      <div className="mt-3 h-8 w-16 rounded bg-muted/40" />
      <div className="mt-3 h-3 w-28 rounded bg-muted/30" />
    </div>
  );
}

function RowSkeleton({ width }: { width: string }) {
  return (
    <div className="rounded-lg px-3 py-3">
      <div className={`h-4 rounded bg-muted/50 ${width}`} />
      <div className="mt-2 h-3 w-52 max-w-full rounded bg-muted/30" />
    </div>
  );
}

export default function CrossMarketLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-pulse">
      <header className="space-y-3 border-b border-border pb-6">
        <div className="h-3 w-24 rounded bg-muted/50" />
        <div className="h-8 w-40 rounded bg-muted/40" />
        <div className="h-4 w-full max-w-2xl rounded bg-muted/30" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>

      <article className="rounded-xl border border-border bg-card/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-muted/50" />
          <div className="h-3 w-10 rounded bg-muted/30" />
        </div>
        <div className="p-5 space-y-1">
          <RowSkeleton width="w-11/12" />
          <RowSkeleton width="w-9/12" />
          <RowSkeleton width="w-10/12" />
          <RowSkeleton width="w-8/12" />
        </div>
      </article>
    </div>
  );
}
