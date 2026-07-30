import { AlertCircle } from "lucide-react";

function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="glass-panel card-glow rounded-2xl p-6 text-center">
      <AlertCircle className="mx-auto mb-4 h-8 w-8 text-red-300" aria-hidden="true" />
      <p className="text-sm text-slate-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-primary/40 hover:bg-primary/10"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export { ErrorState };
