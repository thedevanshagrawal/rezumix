export default function GridBackground({
    topColor = "bg-blue-600/5",
    bottomColor = "bg-purple-600/5"
}) {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className={`absolute top-0 left-0 w-full h-[60vh] ${topColor} blur-[120px] rounded-full mix-blend-screen`} />
            <div className={`absolute bottom-0 right-0 w-full h-[60vh] ${bottomColor} blur-[120px] rounded-full mix-blend-screen`} />
        </div>
    );
}