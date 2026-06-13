"use client";

import { create } from "zustand";
import { DisasterType, ReportDraft, Severity } from "./report-flow";

export const REPORT_DRAFT_STORAGE_KEY = "astacala-report-draft";

export function createEmptyReportDraft(): ReportDraft {
  return {
    latitude: null,
    longitude: null,
    alamat: "",
    detail: "",
    jenis_bencana: "",
    keparahan: "",
    deskripsi: "",
    kebutuhan: [],
    media_paths: [],
  };
}

export const EMPTY_REPORT_DRAFT: ReportDraft = createEmptyReportDraft();

function clearLegacyPersistedDraft() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(REPORT_DRAFT_STORAGE_KEY);
}

const INITIAL_REPORT_DRAFT: ReportDraft = {
  latitude: null,
  longitude: null,
  alamat: "",
  detail: "",
  jenis_bencana: "",
  keparahan: "",
  deskripsi: "",
  kebutuhan: [],
  media_paths: [],
};

type LocationDraft = Pick<ReportDraft, "latitude" | "longitude" | "alamat" | "detail">;
type ConditionDraft = {
  jenis_bencana: DisasterType | "";
  keparahan: Severity | "";
  deskripsi: string;
  kebutuhan: string[];
};

interface ReportDraftState {
  draft: ReportDraft;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setLocation: (location: LocationDraft) => void;
  setCondition: (condition: ConditionDraft) => void;
  clearDraft: () => void;
}

export const useReportDraftStore = create<ReportDraftState>()(
  (set) => ({
    draft: INITIAL_REPORT_DRAFT,
    hasHydrated: true,
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    setLocation: (location) =>
      set((state) => ({
        draft: {
          ...state.draft,
          ...location,
        },
      })),
    setCondition: (condition) =>
      set((state) => ({
        draft: {
          ...state.draft,
          ...condition,
        },
      })),
    clearDraft: () => {
      clearLegacyPersistedDraft();
      set({ draft: createEmptyReportDraft() });
    },
  })
);
