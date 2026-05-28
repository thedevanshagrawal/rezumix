"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, 
    User, 
    Trash2, 
    Loader2, 
    Mail, 
    Calendar, 
    ShieldCheck, 
    Users,
    BadgeCheck,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import SpotlightCard from "@/components/ui/SpotlightCard";
import GridBackground from "@/components/ui/GridBackground";

const AllUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserEmail, setSelectedUserEmail] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await apiClient.allUsers();
                setUsers(data.user || []);
            } catch (err) {
                setError('Failed to fetch users');
                console.error(err);
            } finally {
                setLoading(false);
                setTimeout(() => setIsVisible(true), 100);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (email) => {
        const originalUsers = [...users];
        try {
            await apiClient.deleteUsers(email);
            setUsers(prev => prev.filter(u => u.email !== email));
            toast.success('User deleted successfully');
        } catch (err) {
            setUsers(originalUsers);
            toast.error('Failed to delete user');
            console.error(err);
        } finally {
            setShowConfirm(false);
            setSelectedUserEmail(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mr-2" />
                <span>Loading users...</span>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            <GridBackground topColor="bg-emerald-600/5" bottomColor="bg-teal-600/5" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                
                {/* Header */}
                <div className={`text-center mb-16 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
                        <Users className="w-3 h-3" />
                        <span>User Management</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Registered <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Accounts</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        View and manage all registered users on the platform.
                    </p>
                </div>

                {/* Content Area */}
                <div className={`transition-all duration-700 delay-200 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    
                    {error ? (
                        <div className="flex flex-col items-center justify-center p-8 border border-red-500/20 bg-red-900/10 rounded-2xl max-w-md mx-auto text-center">
                            <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
                            <h3 className="text-white font-bold mb-2">Error Loading Data</h3>
                            <p className="text-red-300/80 text-sm">{error}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-3xl bg-white/[0.02] text-center">
                            <Users className="w-12 h-12 text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
                            <p className="text-slate-500">Registered users will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map((user, index) => (
                                <SpotlightCard 
                                    key={user._id || index}
                                    glowColor="rgba(16, 185, 129, 0.15)"
                                    className="rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300"
                                >
                                    {/* User Info Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-lg font-bold text-white truncate max-w-[150px]">
                                                    {user.fullName || 'No Name'}
                                                </h2>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(user.createdAt).toLocaleDateString('en-GB')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-4 mb-6 flex-grow">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                <Mail className="w-3 h-3" /> Email
                                            </div>
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                <p className="text-sm text-slate-300 truncate" title={user.email}>
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                <ShieldCheck className="w-3 h-3" /> Status
                                            </div>
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${
                                                user.isVerified 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {user.isVerified ? (
                                                    <><BadgeCheck className="w-4 h-4" /> Verified</>
                                                ) : (
                                                    <><XCircle className="w-4 h-4" /> Unverified</>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => {
                                            setSelectedUserEmail(user.email);
                                            setShowConfirm(true);
                                        }}
                                        className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-medium flex items-center justify-center gap-2 group mt-auto"
                                    >
                                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Delete User
                                    </button>
                                </SpotlightCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Confirmation Modal */}
                <AnimatePresence>
                    {showConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                            >
                                {/* Modal Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Delete User?</h2>
                                            <p className="text-slate-400 text-sm">This action cannot be undone.</p>
                                        </div>
                                    </div>

                                    <p className="text-slate-300 mb-8 leading-relaxed">
                                        Are you sure you want to permanently delete the account for <span className="text-white font-semibold">{selectedUserEmail}</span>? All associated data will be removed.
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowConfirm(false)}
                                            className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedUserEmail)}
                                            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-900/20"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AllUser;