export type GraphNode = {
  id: string;
  type: "company" | "segment" | "industry" | "product" | string;
  ticker?: string | null;
  market?: string | null;
  label: string;
  nameZh?: string | null;
  nameEn?: string | null;
  sector?: string | null;
  isListed?: boolean;
  logo?: string | null;
  metrics?: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  relType: string;
  direction: string;
  label?: string | null;
  semantic?: string | null;
  moatTier?: string | null;
  weight?: number | null;
  attrs?: Record<string, unknown>;
  confidence?: string;
  evidence?: string | null;
  sourceUrl?: string | null;
  asOfDate?: string | null;
};

export type SupplyGraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: Record<string, unknown>;
};

export type GraphView = {
  id: string;
  slug: string;
  title: string;
  perspective: string;
  focusNodeId?: string | null;
  description?: string | null;
  config?: Record<string, unknown>;
};

export type GraphQuery = {
  focus: string;
  perspective: string;
  depth: number;
  relTypes: string[];
  moatTier: string;
  asOfDate?: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data?.error?.message || data?.detail?.message || data?.message || `请求失败 (${res.status})`;
    throw new Error(String(message));
  }
  return data as T;
}

export async function fetchSupplyGraph(query: GraphQuery): Promise<SupplyGraphResponse> {
  const params = new URLSearchParams();
  params.set("focus", query.focus || "SPCX");
  params.set("perspective", query.perspective || "company");
  params.set("depth", String(query.depth || 2));
  if (query.relTypes.length > 0) params.set("rel_types", query.relTypes.join(","));
  if (query.moatTier) params.set("moat_tier", query.moatTier);
  if (query.asOfDate) params.set("as_of_date", query.asOfDate);
  const res = await fetch(`/api/graph?${params.toString()}`, { cache: "no-store" });
  return readJson<SupplyGraphResponse>(res);
}

export async function searchSupplyGraph(q: string): Promise<GraphNode[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/graph/search?q=${encodeURIComponent(q)}&limit=8`, { cache: "no-store" });
  const data = await readJson<SupplyGraphResponse>(res);
  return data.nodes;
}

export async function fetchGraphViews(): Promise<GraphView[]> {
  const res = await fetch("/api/graph/views", { cache: "no-store" });
  const data = await readJson<{ meta?: { views?: GraphView[] } }>(res);
  return data.meta?.views ?? [];
}

export async function fetchGraphTimeline(focus: string, depth: number): Promise<string[]> {
  const params = new URLSearchParams({ focus: focus || "SPCX", depth: String(depth || 2) });
  const res = await fetch(`/api/graph/timeline?${params.toString()}`, { cache: "no-store" });
  const data = await readJson<{ meta?: { dates?: string[] } }>(res);
  return data.meta?.dates ?? [];
}

export async function saveGraphView(
  payload: {
    slug: string;
    title: string;
    perspective: string;
    focus: string;
    description?: string;
    config: Record<string, unknown>;
  },
  token?: string | null,
): Promise<GraphView> {
  const res = await fetch("/api/graph/views", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await readJson<{ meta?: { view?: GraphView } }>(res);
  if (!data.meta?.view) throw new Error("保存结果缺少 view");
  return data.meta.view;
}
