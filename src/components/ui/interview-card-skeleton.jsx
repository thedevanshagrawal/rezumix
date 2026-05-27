import { Skeleton } from "@/components/ui/skeleton";

export function InterviewCardSkeleton() {
    return (
        <div className="relative border border-white/10 bg-[#0A0A0A] rounded-2xl p-6 flex flex-col h-full">
            {/* Header row: icon + title + date */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-white/5" />
                        <Skeleton className="h-3 w-20 bg-white/5" />
                    </div>
                </div>
            </div>

            {/* Description label + lines */}
            <div className="space-y-3 flex-grow mb-6">
                <div className="space-y-1">
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <Skeleton className="h-3.5 w-full bg-white/5" />
                    <Skeleton className="h-3.5 w-[80%] bg-white/5" />
                </div>

                {/* Stack label + badges */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-12 bg-white/5" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-14 rounded-md bg-white/5" />
                        <Skeleton className="h-6 w-20 rounded-md bg-white/5" />
                        <Skeleton className="h-6 w-12 rounded-md bg-white/5" />
                    </div>
                </div>
            </div>

            {/* Button */}
            <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
        </div>
    );
}
