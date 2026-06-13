"use client";

import { ReactNode, useCallback, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { clearReportMediaFiles } from "../../lib/report-flow";
import { useReportDraftStore } from "../../lib/report-draft-store";

function isReportCreateStep(pathname: string) {
  return pathname === "/report/step1" || pathname === "/report/step2" || pathname === "/report/step3";
}

export default function ReportLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const clearDraft = useReportDraftStore((state) => state.clearDraft);
  const previousPathname = useRef<string | null>(null);

  const clearTemporaryReportState = useCallback(() => {
    clearDraft();
    void clearReportMediaFiles().catch(() => undefined);
  }, [clearDraft]);

  useLayoutEffect(() => {
    return () => {
      clearTemporaryReportState();
    };
  }, [clearTemporaryReportState]);

  useLayoutEffect(() => {
    const previous = previousPathname.current;
    const wasInCreateFlow = previous ? isReportCreateStep(previous) : false;
    const isInCreateFlow = isReportCreateStep(pathname);

    if (previous === null && isInCreateFlow) {
      clearTemporaryReportState();
    } else if (pathname === "/report/step1" && !wasInCreateFlow) {
      clearTemporaryReportState();
    } else if (wasInCreateFlow && !isInCreateFlow) {
      clearTemporaryReportState();
    }

    previousPathname.current = pathname;
  }, [clearTemporaryReportState, pathname]);

  return children;
}
