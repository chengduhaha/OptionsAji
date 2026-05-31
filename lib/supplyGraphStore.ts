"use client";

import { create } from "zustand";

type SupplyGraphState = {
  perspective: string;
  focus: string;
  depth: number;
  relTypes: string[];
  businessSegment: string;
  moatTier: string;
  asOfDate: string;
  layout: "layered" | "radial" | "force";
  setPerspective: (value: string) => void;
  setFocus: (value: string) => void;
  setDepth: (value: number) => void;
  toggleRelType: (value: string) => void;
  setBusinessSegment: (value: string) => void;
  setMoatTier: (value: string) => void;
  setAsOfDate: (value: string) => void;
  setLayout: (value: "layered" | "radial" | "force") => void;
  hydrateFromQuery: (params: URLSearchParams) => void;
};

export const useSupplyGraphStore = create<SupplyGraphState>((set) => ({
  perspective: "company",
  focus: "SPCX",
  depth: 2,
  relTypes: [],
  businessSegment: "",
  moatTier: "",
  asOfDate: "",
  layout: "layered",
  setPerspective: (perspective) => set({ perspective }),
  setFocus: (focus) => set({ focus: focus.trim().toUpperCase() || "SPCX" }),
  setDepth: (depth) => set({ depth: Math.max(1, Math.min(4, Math.round(depth))) }),
  toggleRelType: (value) =>
    set((state) => ({
      relTypes: state.relTypes.includes(value)
        ? state.relTypes.filter((item) => item !== value)
        : [...state.relTypes, value],
    })),
  setBusinessSegment: (businessSegment) => set({ businessSegment }),
  setMoatTier: (moatTier) => set({ moatTier }),
  setAsOfDate: (asOfDate) => set({ asOfDate }),
  setLayout: (layout) => set({ layout }),
  hydrateFromQuery: (params) =>
    set({
      focus: params.get("focus")?.toUpperCase() || "SPCX",
      perspective: params.get("perspective") || "company",
      depth: Math.max(1, Math.min(4, Number(params.get("depth") || 2))),
      relTypes: (params.get("rel_types") || "").split(",").map((v) => v.trim()).filter(Boolean),
      businessSegment: params.get("segment") || "",
      moatTier: params.get("moat_tier") || "",
      asOfDate: params.get("as_of_date") || "",
    }),
}));
