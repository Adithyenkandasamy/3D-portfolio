"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Runtime Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-surface border border-border space-y-6 text-center relative overflow-hidden">
        {/* Geometric red accent rule */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent" />

        <div className="w-12 h-12 rounded-xl bg-accent-red/10 border border-accent-red/30 flex items-center justify-center mx-auto text-accent-red">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-accent-red font-semibold block mb-2">
            CRITICAL_INTERRUPT &bull; RUNTIME_ANOMALY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            System Execution Halted
          </h1>
          <p className="text-xs text-muted mt-3 font-mono leading-relaxed bg-surface-elevated p-3 rounded-lg border border-border/60 break-words">
            {error.message || "An unanticipated state transition occurred during execution."}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-initialize Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}
