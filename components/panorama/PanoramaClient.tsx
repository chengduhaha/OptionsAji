"use client";

import { BookmarkPlus, RefreshCw, Share2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import type { GraphView, SupplyGraphResponse } from "@/lib/supplyGraph";
import { fetchGraphTimeline, fetchGraphViews, fetchSupplyGraph, saveGraphView } from "@/lib/supplyGraph";
import { useSupplyGraphStore } from "@/lib/supplyGraphStore";
import { DepthSlider } from "./DepthSlider";
import { EntitySearch } from "./EntitySearch";
import { GraphCanvas } from "./GraphCanvas";
import { IndustryGraphCanvas } from "./IndustryGraphCanvas";
import { LayoutSwitcher } from "./LayoutSwitcher";
import { PerspectiveTabs } from "./PerspectiveTabs";
import { RelationLegend } from "./RelationLegend";
import { TimelineReplay } from "./TimelineReplay";
import { filterGraphByBusinessSegment, segmentOptions, toProductGraph } from "./graph-utils";

export function PanoramaClient() {
  const router = useRouter();
  const { token, isAdmin } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    perspective,
    focus,
    depth,
    relTypes,
    businessSegment,
    moatTier,
    asOfDate,
    layout,
    hydrateFromQuery,
    setPerspective,
    setFocus,
    setDepth,
    toggleRelType,
    setBusinessSegment,
    setMoatTier,
    setAsOfDate,
    setLayout,
  } = useSupplyGraphStore();
  const [graph, setGraph] = useState<SupplyGraphResponse | null>(null);
  const [views, setViews] = useState<GraphView[]>([]);
  const [timelineDates, setTimelineDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrateFromQuery(new URLSearchParams(searchParams.toString()));
  }, [hydrateFromQuery, searchParams]);

  const query = useMemo(
    () => ({ focus, perspective, depth, relTypes, moatTier, asOfDate }),
    [asOfDate, depth, focus, moatTier, perspective, relTypes],
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("focus", focus);
    params.set("perspective", perspective);
    params.set("depth", String(depth));
    if (relTypes.length > 0) params.set("rel_types", relTypes.join(","));
    if (businessSegment) params.set("segment", businessSegment);
    if (moatTier) params.set("moat_tier", moatTier);
    if (asOfDate) params.set("as_of_date", asOfDate);
    const next = `${pathname}?${params.toString()}`;
    router.replace(next, { scroll: false });
  }, [asOfDate, businessSegment, depth, focus, moatTier, pathname, perspective, relTypes, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextGraph, nextViews, nextTimeline] = await Promise.all([
        fetchSupplyGraph(query),
        views.length ? Promise.resolve(views) : fetchGraphViews(),
        fetchGraphTimeline(focus, depth),
      ]);
      setGraph(nextGraph);
      setViews(nextViews);
      setTimelineDates(nextTimeline);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "图谱加载失败");
    } finally {
      setLoading(false);
    }
  }, [depth, focus, query, views]);

  useEffect(() => {
    void load();
  }, [load]);

  const focusView = views.find((view) => view.slug === "spacex-2026-supply-chain");
  const segments = useMemo(() => segmentOptions(graph?.nodes ?? []), [graph]);
  const visibleGraph = useMemo(() => {
    if (!graph) return null;
    const filtered = filterGraphByBusinessSegment(graph.nodes, graph.edges, businessSegment);
    const shaped = perspective === "product" ? toProductGraph(filtered.nodes, filtered.edges) : filtered;
    return { ...graph, nodes: shaped.nodes, edges: shaped.edges };
  }, [businessSegment, graph, perspective]);

  async function handleSaveView() {
    const title = window.prompt("策展图名称", `${focus} ${perspective} depth ${depth}`);
    if (!title) return;
    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    setSaving(true);
    setError(null);
    try {
      const view = await saveGraphView(
        {
          slug: slug || `view-${Date.now()}`,
          title,
          perspective,
          focus,
          description: `Saved from /panorama at depth=${depth}`,
          config: {
            default_depth: depth,
            rel_types: relTypes,
            moat_tier: moatTier || undefined,
            business_segment: businessSegment || undefined,
            as_of_date: asOfDate || undefined,
            layout,
          },
        },
        token,
      );
      setViews((current) => [view, ...current.filter((item) => item.slug !== view.slug)]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存策展图失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <header className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-panel/75 px-4 py-3 backdrop-blur-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary">
            <Share2 className="h-3.5 w-3.5" />
            产业星图
          </div>
          <h1 className="mt-1 text-[20px] font-semibold text-foreground">
            {focusView?.title || "SpaceX 2026 全业务供应链"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PerspectiveTabs value={perspective} onChange={setPerspective} />
          <EntitySearch value={focus} onSelect={setFocus} />
          <DepthSlider value={depth} onChange={setDepth} />
          <TimelineReplay dates={timelineDates} value={asOfDate} onChange={setAsOfDate} />
          <LayoutSwitcher value={layout} onChange={setLayout} />
          {isAdmin ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveView()}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-3 text-[12px] text-gold hover:bg-gold/15 disabled:opacity-50"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              {saving ? "保存中" : "保存策展"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void load()}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-glass px-3 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
        </div>
      </header>

      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-panel/60 px-4 py-2 backdrop-blur-xl">
        <RelationLegend
          relTypes={relTypes}
          businessSegment={businessSegment}
          segmentOptions={segments}
          moatTier={moatTier}
          onToggleRelType={toggleRelType}
          onBusinessSegment={setBusinessSegment}
          onMoatTier={setMoatTier}
        />
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>节点 {visibleGraph?.nodes.length ?? 0}</span>
          <span>关系 {visibleGraph?.edges.length ?? 0}</span>
          <span>As of {String(graph?.meta?.asOf || "N/A")}</span>
          <span>{graph?.meta?.cache === "hit" ? "Redis 命中" : "实时查询"}</span>
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[12px] text-red">
          {error}
        </div>
      ) : null}

      <div className="min-h-0 flex-1">
        {perspective === "industry" ? (
          <IndustryGraphCanvas graph={visibleGraph} loading={loading} />
        ) : (
          <GraphCanvas graph={visibleGraph} perspective={perspective} layout={layout} loading={loading} />
        )}
      </div>
    </div>
  );
}
