import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function FetchErrorBanner({ message, onRetry, className }) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border border-red-500/20 bg-red-900/10 text-center",
                className
            )}
        >
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-white mb-1">Something went wrong</p>
                <p className="text-xs text-red-300/80">{message || "An unexpected error occurred. Please try again."}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-sm font-medium transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Again
                </button>
            )}
        </div>
    );
}
