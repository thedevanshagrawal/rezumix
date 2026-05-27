import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ResultSkeleton({ className }) {
    return (
        <div
            className={cn(
                "p-8 bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl space-y-6",
                className
            )}
        >
            {/* Header row */}
            <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                <Skeleton className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40 bg-white/5" />
                    <Skeleton className="h-3 w-24 bg-white/5" />
                </div>
            </div>

            {/* Paragraph lines */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-[92%] bg-white/5" />
                <Skeleton className="h-4 w-[85%] bg-white/5" />
            </div>

            {/* Section heading */}
            <Skeleton className="h-5 w-48 bg-white/5" />

            {/* Bullet lines */}
            <div className="space-y-2 pl-4">
                <Skeleton className="h-4 w-[88%] bg-white/5" />
                <Skeleton className="h-4 w-[75%] bg-white/5" />
                <Skeleton className="h-4 w-[80%] bg-white/5" />
                <Skeleton className="h-4 w-[65%] bg-white/5" />
            </div>

            {/* Section heading */}
            <Skeleton className="h-5 w-36 bg-white/5" />

            {/* More bullet lines */}
            <div className="space-y-2 pl-4">
                <Skeleton className="h-4 w-[86%] bg-white/5" />
                <Skeleton className="h-4 w-[60%] bg-white/5" />
            </div>
        </div>
    );
}
