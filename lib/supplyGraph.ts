import { apiFetch } from "@/lib/apiBase";
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

export type GraphBootstrapResponse = {
  graph: SupplyGraphResponse;
  views: GraphView[];
  timelineDates: string[];
  source: "snapshot" | "bootstrap";
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

function graphParams(query: GraphQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set("focus", query.focus || "SPCX");
  params.set("perspective", query.perspective || "company");
  params.set("depth", String(query.depth || 2));
  if (query.relTypes.length > 0) params.set("rel_types", query.relTypes.join(","));
  if (query.moatTier) params.set("moat_tier", query.moatTier);
  if (query.asOfDate) params.set("as_of_date", query.asOfDate);
  return params;
}

function metaViews(graph: SupplyGraphResponse): GraphView[] {
  const views = graph.meta?.views;
  return Array.isArray(views) ? (views as GraphView[]) : [];
}

function metaTimelineDates(graph: SupplyGraphResponse): string[] {
  const dates = graph.meta?.timelineDates;
  return Array.isArray(dates) ? dates.map(String) : [];
}

function canUseDefaultSnapshot(query: GraphQuery): boolean {
  return (
    (query.focus || "SPCX").toUpperCase() === "SPCX" &&
    (query.perspective || "company") === "company" &&
    Number(query.depth || 2) === 2 &&
    query.relTypes.length === 0 &&
    !query.moatTier &&
    !query.asOfDate
  );
}

export async function fetchSupplyGraph(query: GraphQuery): Promise<SupplyGraphResponse> {
  const params = graphParams(query);
  const res = await apiFetch(`/api/graph?${params.toString()}`);
  return readJson<SupplyGraphResponse>(res);
}

export async function fetchGraphSnapshot(slug: string): Promise<SupplyGraphResponse> {
  const res = await apiFetch(`/api/graph/snapshot/${encodeURIComponent(slug)}`);
  return readJson<SupplyGraphResponse>(res);
}

export async function fetchGraphBootstrap(query: GraphQuery): Promise<GraphBootstrapResponse> {
  if (canUseDefaultSnapshot(query)) {
    try {
      const graph = await fetchGraphSnapshot("spacex-2026-supply-chain");
      return {
        graph,
        views: graph.meta?.view ? [graph.meta.view as GraphView] : [],
        timelineDates: graph.meta?.asOf ? [String(graph.meta.asOf)] : [],
        source: "snapshot",
      };
    } catch {
      // Fall through to bootstrap when the static snapshot has not been generated yet.
    }
  }
  const params = graphParams(query);
  const graph = await readJson<SupplyGraphResponse>(await apiFetch(`/api/graph/bootstrap?${params.toString()}`));
  return {
    graph,
    views: metaViews(graph),
    timelineDates: metaTimelineDates(graph),
    source: "bootstrap",
  };
}

export async function fetchGraphNode(nodeId: string): Promise<SupplyGraphResponse> {
  const res = await apiFetch(`/api/graph/node/${encodeURIComponent(nodeId)}`);
  return readJson<SupplyGraphResponse>(res);
}

export async function searchSupplyGraph(q: string): Promise<GraphNode[]> {
  if (!q.trim()) return [];
  const res = await apiFetch(`/api/graph/search?q=${encodeURIComponent(q)}&limit=8`);
  const data = await readJson<SupplyGraphResponse>(res);
  return data.nodes;
}

export async function fetchGraphViews(): Promise<GraphView[]> {
  const res = await apiFetch("/api/graph/views");
  const data = await readJson<{ meta?: { views?: GraphView[] } }>(res);
  return data.meta?.views ?? [];
}

export async function fetchGraphTimeline(focus: string, depth: number): Promise<string[]> {
  const params = new URLSearchParams({ focus: focus || "SPCX", depth: String(depth || 2) });
  const res = await apiFetch(`/api/graph/timeline?${params.toString()}`);
  const data = await readJson<{ meta?: { dates?: string[] } }>(res);
  return data.meta?.dates ?? [];
}

export type GraphInsightResponse = {
  insight: string;
  cache?: string;
  error?: string;
};

export async function fetchGraphInsight(payload: Record<string, unknown>): Promise<GraphInsightResponse> {
  const res = await apiFetch("/api/graph/insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readJson<{ meta?: GraphInsightResponse }>(res);
  const meta = data.meta;
  if (!meta?.insight) {
    throw new Error(meta?.error || "未返回解读内容");
  }
  return { insight: meta.insight, cache: meta.cache, error: meta.error };
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
  const res = await apiFetch("/api/graph/views", {
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
