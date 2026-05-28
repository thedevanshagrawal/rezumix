import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ResultSkeleton({ className }) {
    return (
        <div
            className={cn(
                "p-8 bg-[#0A0A0A]/80 border border-white/10 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden",
                className
            )}
        >
            {/* Ambient background glow */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-sky-500/5 blur-2xl rounded-full" />
            
            {/* Header row */}
            <div className="flex items-center gap-4 pb-6 border-b border-white/5 relative z-10">
                <Skeleton className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40 bg-white/10" />
                    <Skeleton className="h-3.5 w-24 bg-white/10" />
                </div>
            </div>

            {/* Paragraph lines */}
            <div className="space-y-3 relative z-10">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-[95%] bg-white/5" />
                <Skeleton className="h-4 w-[85%] bg-white/5" />
            </div>

            {/* Section heading */}
            <Skeleton className="h-5.5 w-48 bg-white/10 relative z-10" />

            {/* Bullet lines */}
            <div className="space-y-3 pl-4 relative z-10">
                <Skeleton className="h-4 w-[88%] bg-white/5" />
                <Skeleton className="h-4 w-[78%] bg-white/5" />
                <Skeleton className="h-4 w-[82%] bg-white/5" />
                <Skeleton className="h-4 w-[65%] bg-white/5" />
            </div>

            {/* Section heading */}
            <Skeleton className="h-5.5 w-36 bg-white/10 relative z-10" />

            {/* More bullet lines */}
            <div className="space-y-3 pl-4 relative z-10">
                <Skeleton className="h-4 w-[90%] bg-white/5" />
                <Skeleton className="h-4 w-[60%] bg-white/5" />
            </div>
        </div>
    );
}
