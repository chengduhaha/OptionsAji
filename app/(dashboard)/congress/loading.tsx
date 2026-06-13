function TableRowSkeleton() {
  return (
    <tr className="border-b border-glass-border/50">
      <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-muted/40" /></td>
      <td className="px-4 py-3"><div className="h-4 w-8 rounded bg-muted/40" /></td>
      <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-muted/40" /></td>
      <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-muted/40" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-muted/40" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-muted/40" /></td>
    </tr>
  );
}

export default function CongressLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted/40" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-muted/50" />
          <div className="h-4 w-56 rounded bg-muted/30" />
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-glass border border-glass-border w-fit">
        <div className="h-9 w-20 rounded-lg bg-muted/40" />
        <div className="h-9 w-20 rounded-lg bg-muted/30" />
        <div className="h-9 w-20 rounded-lg bg-muted/30" />
      </div>

      <div className="rounded-xl border border-glass-border bg-glass/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-glass-border bg-glass/60">
              {["议员", "院", "股票", "类型", "金额范围", "日期"].map((label) => (
                <th key={label} className="px-4 py-3 text-left">
                  <div className="h-3 w-14 rounded bg-muted/40" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </tbody>
        </table>
      </div>
    </div>
  );
}
