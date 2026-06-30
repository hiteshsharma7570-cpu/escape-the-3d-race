import React from "react";
import { toast } from "sonner";
import { logMaintenanceError } from "@/lib/maintenanceLog";

interface Props {
  children: React.ReactNode;
  /** Optional callback for the host to restore last-known-good state. */
  onRecover?: () => void;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Catches render-time crashes inside the game view. Shows a friendly recovery
 * screen instead of a blank page, logs the crash to the maintenance log, and
 * offers a one-click recovery that asks the host to restore the last known-good
 * GameState from local/session storage.
 */
export class GameErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    void logMaintenanceError({
      errorType: "render_crash",
      error,
      context: { componentStack: info.componentStack ?? "" },
    });
    try {
      toast.error("Recovered from a hiccup — your progress is safe");
    } catch {
      /* toast container may itself be unmounted; ignore */
    }
  }

  handleRecover = () => {
    this.setState({ hasError: false, message: undefined });
    this.props.onRecover?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full rounded-xl border border-amber-500/40 bg-slate-900/70 p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-amber-300">
            Something went sideways
          </h2>
          <p className="text-sm text-slate-300">
            We're recovering your game. Your last saved progress is safe.
          </p>
          {this.state.message && (
            <p className="text-[11px] text-slate-500 font-mono break-words">
              {this.state.message}
            </p>
          )}
          <button
            onClick={this.handleRecover}
            className="px-4 py-2 rounded-md bg-amber-500/90 hover:bg-amber-400 text-slate-950 text-sm font-medium"
          >
            Restore last saved game
          </button>
        </div>
      </div>
    );
  }
}