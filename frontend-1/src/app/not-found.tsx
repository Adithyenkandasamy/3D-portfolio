import Link from "next/link";
import { Terminal, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-surface border border-border space-y-6 text-center relative overflow-hidden">
        {/* Subtle geometric accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

        <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-border flex items-center justify-center mx-auto text-accent">
          <Terminal className="w-6 h-6" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
            ERR_404 &bull; COORDINATES_UNRESOLVED
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Transmission Lost
          </h1>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            The requested trajectory does not exist in the active neural index or has been migrated to an alternate sector.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Command Console</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
