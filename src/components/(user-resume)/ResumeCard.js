'use client'
import { useState } from 'react'
import { FileText, Eye, Trash2, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeMode } from "@/hooks/use-theme-mode"

const ResumeCard = ({ resume, onClick, index }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirmPopup, setShowConfirmPopup] = useState(false)
    const { isLight } = useThemeMode()

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await axios.delete(`/api/analyze-resume?id=${resume.id}`)
            toast.success('Resume deleted successfully')
            // Note: Parent component needs to handle state update or refresh
            window.location.reload() 
        } catch (error) {
            console.error('Failed to delete:', error)
            toast.error('Failed to delete resume')
        } finally {
            setIsDeleting(false)
            setShowConfirmPopup(false)
        }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative rounded-2xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${isLight ? "bg-white border border-slate-200 hover:border-slate-300" : "bg-gray-950 border border-white/10 hover:border-white/20"}`}
            >
                {/* Card Content */}
                <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                    </div>

                    <h3 className={`text-lg font-bold mb-2 line-clamp-1 ${isLight ? "text-slate-950" : "text-white"}`}>
                        Resume Analysis {index + 1}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                        Created on {new Date().toLocaleDateString()}
                    </p>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onClick(resume.id)}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors ${isLight ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-white text-black hover:bg-slate-200"}`}
                        >
                            <Eye size={16} /> View
                        </button>
                        <button
                            onClick={() => setShowConfirmPopup(true)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                        <div
                </div>
            </motion.div>

                            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-white/10"}`}
            <AnimatePresence>
                {showConfirmPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mb-4 mx-auto">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            
                            <h3 className={`text-lg font-bold text-center mb-2 ${isLight ? "text-slate-950" : "text-white"}`}>Delete Resume?</h3>
                            <p className={`text-sm text-center mb-6 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                                This action cannot be undone. The analysis data will be permanently removed.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmPopup(false)}
                                    className={`flex-1 py-3 rounded-xl transition-colors font-medium text-sm ${isLight ? "border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50" : "border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors font-bold text-sm disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}

export default ResumeCard