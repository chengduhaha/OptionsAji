function StatSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-5">
      <div className="h-3 w-20 rounded bg-muted/50" />
      <div className="mt-3 h-8 w-16 rounded bg-muted/40" />
    </div>
  );
}

function ListRowSkeleton() {
  return (
    <li className="grid grid-cols-1 md:grid-cols-[48px_80px_1fr_100px_100px_100px] gap-2 md:gap-3 px-5 py-4">
      <div className="h-6 w-9 rounded bg-muted/50" />
      <div className="h-5 w-14 rounded bg-muted/50" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted/40" />
        <div className="h-3 w-2/3 rounded bg-muted/30" />
      </div>
      <div className="h-4 w-16 rounded bg-muted/40 md:ml-auto" />
      <div className="h-4 w-14 rounded bg-muted/40 md:ml-auto" />
      <div className="h-4 w-12 rounded bg-muted/40 md:ml-auto" />
    </li>
  );
}

export default function XpozLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-pulse">
      <header className="space-y-3 border-b border-border pb-6">
        <div className="h-3 w-36 rounded bg-muted/50" />
        <div className="h-8 w-40 rounded bg-muted/40" />
        <div className="h-4 w-full max-w-2xl rounded bg-muted/30" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[48px_80px_1fr_100px_100px_100px] gap-3 px-5 py-3 border-b border-border bg-card/40">
          <div className="h-3 w-6 rounded bg-muted/40" />
          <div className="h-3 w-8 rounded bg-muted/40" />
          <div className="h-3 w-20 rounded bg-muted/40" />
          <div className="h-3 w-14 rounded bg-muted/40 justify-self-end" />
          <div className="h-3 w-12 rounded bg-muted/40 justify-self-end" />
          <div className="h-3 w-12 rounded bg-muted/40 justify-self-end" />
        </div>
        <ul className="divide-y divide-border">
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
        </ul>
      </div>
    </div>
  );
}
