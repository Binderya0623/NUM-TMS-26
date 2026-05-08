import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

/**
 * Catches render-phase errors in the subtree and shows a recoverable fallback
 * instead of letting React unmount the whole app to a blank page. Resetting
 * is a manual reload — fine for the prototype's blast radius.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to the JS console so the dev/QA can see the stack. Production
    // logging would forward to a server endpoint — out of scope here.
    console.error("[UI ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-border rounded-md bg-surface p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--color-dot-negative)]">
            <AlertTriangle className="w-5 h-5" strokeWidth={1.6} />
            <h2 className="text-base font-semibold text-ink-900 tracking-tight">Алдаа гарлаа</h2>
          </div>
          <p className="text-sm text-ink-700 leading-relaxed">
            Энэ хэсэгт санаандгүй алдаа гарсан тул хуудсыг сэргээнэ үү. Алдаа давтагдвал админд хандана уу.
          </p>
          <pre className="text-[11px] text-ink-500 bg-surface-muted border border-border rounded-md p-2 overflow-auto max-h-32 whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.reset}
            className="px-3 py-2 rounded-md bg-ink-900 text-white text-sm hover:bg-black transition-colors"
          >
            Хуудсыг сэргээх
          </button>
        </div>
      </div>
    );
  }
}
