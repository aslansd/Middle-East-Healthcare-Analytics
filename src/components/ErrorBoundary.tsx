import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Shown instead of the default panel, when supplied. */
  fallback?: React.ReactNode;
  /** Changing this value clears the error, e.g. when the user switches tabs. */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors from charts and analysis panels. Without this a
 * single bad Recharts render takes the entire page down to a blank screen.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Panel failed to render:", error, info.componentStack);
  }

  private handleRetry = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return <>{this.props.fallback}</>;

    return (
      <div
        role="alert"
        className="h-full min-h-[180px] flex flex-col items-center justify-center gap-3 p-6 text-center bg-raised border border-line rounded-2xl"
      >
        <AlertTriangle className="w-6 h-6 text-amber-500" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-ink">This panel could not be displayed</p>
          <p className="text-xs text-muted max-w-sm">
            The rest of the dashboard still works. Try again, or change the
            selected indicator.
          </p>
        </div>
        <button
          type="button"
          onClick={this.handleRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }
}
