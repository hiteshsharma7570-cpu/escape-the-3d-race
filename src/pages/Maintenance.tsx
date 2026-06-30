import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react";

interface MaintenanceRow {
  id: string;
  created_at: string;
  error_type: string;
  error_message: string | null;
  stack: string | null;
  context: Record<string, unknown> | null;
  ai_diagnosis: string | null;
  ai_suggested_fix: string | null;
  diagnosed_at: string | null;
}

const isDevMode = () =>
  import.meta.env.DEV ||
  (typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("dev") === "1");

const Maintenance = () => {
  const [rows, setRows] = useState<MaintenanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState<string | null>(null);
  const allowed = isDevMode();

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("ai_maintenance_log")
      .select("id, created_at, error_type, error_message, stack, context, ai_diagnosis, ai_suggested_fix, diagnosed_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) setError(error.message);
    else setRows((data ?? []) as MaintenanceRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (allowed) void load();
  }, [allowed]);

  const triggerDiagnose = async (id: string) => {
    setDiagnosing(id);
    try {
      await supabase.functions.invoke("ai-diagnose-error", { body: { id } });
      await load();
    } finally {
      setDiagnosing(null);
    }
  };

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold text-amber-300">Maintenance panel</h1>
          <p className="text-sm text-slate-400">
            This panel is only available in development. Append <code>?dev=1</code>
            {" "}to the URL to view it locally.
          </p>
          <Link to="/" className="inline-block text-amber-300 underline text-sm">
            ← Back to game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-amber-300">
            <ArrowLeft className="w-4 h-4" /> Back to game
          </Link>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-amber-300">AI Maintenance Log</h1>
          <p className="text-sm text-slate-400">
            Runtime errors caught by the self-healing layer, with AI-drafted diagnoses
            for human review. Nothing here is auto-applied — fixes are suggestions only.
          </p>
        </header>

        {error && (
          <div className="text-sm text-red-400 border border-red-500/30 rounded p-3">
            {error}
          </div>
        )}

        {rows.length === 0 && !loading && (
          <div className="text-sm text-slate-500 italic">No errors recorded. Nice.</div>
        )}

        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {row.error_type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => triggerDiagnose(row.id)}
                  disabled={diagnosing === row.id}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {row.ai_diagnosis ? "Re-diagnose" : "Diagnose"}
                </Button>
              </div>

              {row.error_message && (
                <p className="text-sm text-slate-200 font-mono break-words">
                  {row.error_message}
                </p>
              )}

              {row.context && Object.keys(row.context).length > 0 && (
                <details className="text-xs text-slate-400">
                  <summary className="cursor-pointer">Context</summary>
                  <pre className="whitespace-pre-wrap mt-1 text-[11px]">
                    {JSON.stringify(row.context, null, 2)}
                  </pre>
                </details>
              )}

              {row.stack && (
                <details className="text-xs text-slate-400">
                  <summary className="cursor-pointer">Stack</summary>
                  <pre className="whitespace-pre-wrap mt-1 text-[11px]">{row.stack}</pre>
                </details>
              )}

              {(row.ai_diagnosis || row.ai_suggested_fix) && (
                <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                  {row.ai_diagnosis && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-amber-300 mb-1">
                        AI Diagnosis
                      </div>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">
                        {row.ai_diagnosis}
                      </p>
                    </div>
                  )}
                  {row.ai_suggested_fix && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-amber-300 mb-1">
                        Suggested fix (developer-reviewed)
                      </div>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">
                        {row.ai_suggested_fix}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Maintenance;