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
  game_state: Record<string, unknown> | null;
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
      .select("id, created_at, error_type, error_message, stack, context, game_state, ai_diagnosis, ai_suggested_fix, diagnosed_at")
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

  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const fmt = (v: number | null) => (v == null ? "—" : `₹${Math.round(v).toLocaleString()}`);

  /** Extract the key vitals from a GameState snapshot for at-a-glance triage. */
  const summarizeGameState = (gs: Record<string, unknown> | null) => {
    if (!gs) return null;
    const assets = Array.isArray(gs.assets) ? (gs.assets as Array<{ value?: number }>) : [];
    const liabs = Array.isArray(gs.liabilities) ? (gs.liabilities as Array<{ principal?: number }>) : [];
    const exps = Array.isArray(gs.expenses) ? (gs.expenses as Array<{ monthlyAmount?: number }>) : [];
    const cash = num(gs.cash);
    const assetTotal = assets.reduce((s, a) => s + (a.value ?? 0), 0);
    const debtTotal = liabs.reduce((s, l) => s + (l.principal ?? 0), 0);
    const monthlyOut = exps.reduce((s, e) => s + (e.monthlyAmount ?? 0), 0);
    return {
      playerName: typeof gs.playerName === "string" ? gs.playerName : null,
      profession: typeof gs.profession === "string" ? gs.profession : null,
      position: num(gs.position),
      turnCount: num(gs.turnCount),
      cash,
      salary: num(gs.salary),
      passiveIncome: num(gs.passiveIncome),
      netWorth: cash != null ? cash + assetTotal - debtTotal : null,
      assetCount: assets.length,
      assetTotal,
      liabilityCount: liabs.length,
      debtTotal,
      expenseCount: exps.length,
      monthlyOut,
    };
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
                  variant={row.ai_diagnosis ? "ghost" : "default"}
                  onClick={() => triggerDiagnose(row.id)}
                  disabled={diagnosing === row.id}
                  title="Ask the AI to read this error + GameState and write a fresh diagnosis"
                >
                  <Sparkles className={`w-3.5 h-3.5 mr-1 ${diagnosing === row.id ? "animate-pulse" : ""}`} />
                  {diagnosing === row.id
                    ? "Re-running…"
                    : row.ai_diagnosis
                      ? "Re-run diagnosis"
                      : "Diagnose"}
                </Button>
              </div>

              {/* Raw error context chips — tile type, turn, anything else the
                  reporter attached. Always visible for fast triage. */}
              {row.context && Object.keys(row.context).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(row.context).map(([k, v]) => (
                    <span
                      key={k}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300"
                    >
                      <span className="text-slate-500">{k}:</span>{" "}
                      <span className="text-slate-200">
                        {typeof v === "object"
                          ? JSON.stringify(v).slice(0, 60)
                          : String(v).slice(0, 60)}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {row.error_message && (
                <p className="text-sm text-slate-200 font-mono break-words">
                  {row.error_message}
                </p>
              )}

              {/* GameState snapshot — the moral equivalent of a diff: it's the
                  state at the moment of the crash, which is what a developer
                  needs to reproduce locally. */}
              {(() => {
                const gs = summarizeGameState(row.game_state);
                if (!gs) return null;
                return (
                  <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1 p-2 rounded border border-slate-700/40 bg-slate-950/40">
                    {gs.playerName && (
                      <div><span className="text-slate-500">player</span>{" "}<span className="text-slate-200">{gs.playerName}</span></div>
                    )}
                    {gs.profession && (
                      <div><span className="text-slate-500">profession</span>{" "}<span className="text-slate-200">{gs.profession}</span></div>
                    )}
                    <div><span className="text-slate-500">turn</span>{" "}<span className="text-slate-200">{gs.turnCount ?? "—"}</span></div>
                    <div><span className="text-slate-500">position</span>{" "}<span className="text-slate-200">{gs.position ?? "—"}</span></div>
                    <div><span className="text-slate-500">cash</span>{" "}<span className="text-emerald-300">{fmt(gs.cash)}</span></div>
                    <div><span className="text-slate-500">salary</span>{" "}<span className="text-slate-200">{fmt(gs.salary)}</span></div>
                    <div><span className="text-slate-500">passive</span>{" "}<span className="text-slate-200">{fmt(gs.passiveIncome)}</span></div>
                    <div><span className="text-slate-500">net worth</span>{" "}<span className="text-amber-300">{fmt(gs.netWorth)}</span></div>
                    <div><span className="text-slate-500">assets</span>{" "}<span className="text-slate-200">{gs.assetCount} ({fmt(gs.assetTotal)})</span></div>
                    <div><span className="text-slate-500">debt</span>{" "}<span className="text-red-300">{gs.liabilityCount} ({fmt(gs.debtTotal)})</span></div>
                    <div><span className="text-slate-500">expenses</span>{" "}<span className="text-slate-200">{gs.expenseCount} ({fmt(gs.monthlyOut)}/mo)</span></div>
                  </div>
                );
              })()}

              <details className="text-xs text-slate-400">
                <summary className="cursor-pointer">Raw context JSON</summary>
                <pre className="whitespace-pre-wrap mt-1 text-[11px]">
                  {JSON.stringify(row.context ?? {}, null, 2)}
                </pre>
              </details>

              {row.game_state && (
                <details className="text-xs text-slate-400">
                  <summary className="cursor-pointer">Full GameState snapshot</summary>
                  <pre className="whitespace-pre-wrap mt-1 text-[11px] max-h-80 overflow-auto">
                    {JSON.stringify(row.game_state, null, 2)}
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