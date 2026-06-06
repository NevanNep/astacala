"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DisasterType, ReportDraft, Severity } from "./report-flow";

export const EMPTY_REPORT_DRAFT: ReportDraft = {
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
  persist(
    (set) => ({
      draft: EMPTY_REPORT_DRAFT,
      hasHydrated: false,
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
      clearDraft: () => set({ draft: EMPTY_REPORT_DRAFT }),
    }),
    {
      name: "astacala-report-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ draft: state.draft }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
