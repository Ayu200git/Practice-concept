import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    FileText,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    UserCircle,
    Settings,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const DashboardLayout = ({ children }) => {
    const { user, logout, updateUserData } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [updateForm, setUpdateForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.put('/users/me', updateForm);
            toast.success('Profile updated successfully!');
            updateUserData({ name: updateForm.name, email: updateForm.email });
            setShowUpdateModal(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsSubmitting(true);
        try {
            await api.delete('/users/me');
            toast.success('Account deleted successfully');
            logout();
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        {
            name: 'Dashboard',
            path: user?.role === 'ADMIN' ? '/admin' : user?.role === 'SUB_ADMIN' ? '/sub-admin' : '/dashboard',
            icon: LayoutDashboard,
            roles: ['ADMIN', 'SUB_ADMIN', 'USER']
        },
        {
            name: 'Community Feed',
            path: '/posts',
            icon: FileText,
            roles: ['ADMIN', 'SUB_ADMIN', 'USER']
        },
        {
            name: 'Admin Settings',
            path: '/admin/settings',
            icon: ShieldCheck,
            roles: ['ADMIN']
        },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="h-screen bg-slate-50 flex overflow-hidden">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-slate-900 text-white flex-shrink-0 transition-all duration-300 ease-in-out hidden md:flex flex-col h-full"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                            Permipulse Panel
                        </span>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center p-3 rounded-xl transition-colors ${location.pathname === item.path
                                ? 'bg-sky-600 text-white'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            <item.icon size={22} className="flex-shrink-0" />
                            {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <LogOut size={22} />
                        {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 text-white z-50 md:hidden flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-slate-800">
                                <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                                    Permipulse Panel
                                </span>
                                <button
                                    onClick={closeMobileMenu}
                                    className="p-1.5 hover:bg-slate-800 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                                {filteredNavItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={closeMobileMenu}
                                        className={`flex items-center p-3 rounded-xl transition-colors ${location.pathname === item.path
                                            ? 'bg-sky-600 text-white'
                                            : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <item.icon size={22} className="flex-shrink-0" />
                                        <span className="ml-3 font-medium">{item.name}</span>
                                    </Link>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-slate-800">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <LogOut size={22} />
                                    <span className="ml-3 font-medium">Logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <header className="bg-white border-b border-slate-200 h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 hover:bg-slate-100 rounded-lg mr-3"
                        >
                            <Menu size={24} className="text-slate-700" />
                        </button>
                        <div className="flex items-center gap-2">
                            <img src="/permi1.svg" alt="Permipulse Logo" className="h-8 w-8" />
                            <h2 className="text-lg md:text-2xl font-black bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                                Permipulse
                            </h2>
                            <span className="h-6 w-[2px] bg-slate-200 mx-2 hidden sm:block"></span>
                            <h2 className="text-base md:text-lg font-semibold text-slate-800 truncate">
                                {navItems.find(n => n.path === location.pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4 relative">
                        <div className="hidden sm:flex flex-col items-end leading-tight">
                            <span className="text-sm font-black text-slate-900 truncate max-w-[150px]">{user?.name}</span>
                            <span className="text-[9px] text-sky-600 font-black uppercase tracking-widest bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100 mt-0.5">
                                {user?.role}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer relative ${user?.role === 'ADMIN' ? 'bg-indigo-600 shadow-indigo-100' : user?.role === 'SUB_ADMIN' ? 'bg-sky-600 shadow-sky-100' : 'bg-emerald-600 shadow-emerald-100'
                                }`}
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </button>

                        {/* Profile Dropdown */}
                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20"
                                    >
                                        <button
                                            onClick={() => { setIsProfileOpen(false); setShowUpdateModal(true); }}
                                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                                        >
                                            <Settings size={18} className="mr-3 text-slate-400" />
                                            Update Profile
                                        </button>
                                        <button
                                            onClick={() => { setIsProfileOpen(false); setShowDeleteModal(true); }}
                                            className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 flex items-center transition-colors font-medium"
                                        >
                                            <Trash2 size={18} className="mr-3 text-rose-400" />
                                            Delete Account
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    {children}
                </main>

                {/* Footer Status Bar */}
                <footer className="h-8 bg-white border-t border-slate-200 flex-shrink-0 flex items-center justify-between px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 grayscale opacity-70">
                            <img src="/permi1.svg" alt="Permipulse" className="h-3 w-3" />
                            <span>Permipulse</span>
                        </div>
                        <span className="h-3 w-[1px] bg-slate-100"></span>
                        <span>System Stable</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>v1.0.4 - Production</span>
                        <span className="h-3 w-[1px] bg-slate-100"></span>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span>Live Sync Active</span>
                        </div>
                    </div>
                </footer>
            </div >

            {/* Modals */}
            < AnimatePresence >
                {/* Update Modal */}
                {
                    showUpdateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowUpdateModal(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            ></motion.div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl"
                            >
                                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
                                    <Settings className="mr-3 text-sky-600" size={28} />
                                    Profile Settings
                                </h2>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 font-medium transition-all"
                                            value={updateForm.name}
                                            onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            readOnly
                                            disabled
                                            className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-medium cursor-not-allowed text-slate-500"
                                            value={updateForm.email}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-bold italic uppercase tracking-wider">Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">New Password (optional)</label>
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 font-medium transition-all"
                                            value={updateForm.password}
                                            onChange={(e) => setUpdateForm({ ...updateForm, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUpdateModal(false)}
                                            className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 py-4 bg-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Updating...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )
                }

                {/* Delete Modal */}
                {
                    showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            ></motion.div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl border-t-8 border-rose-500"
                            >
                                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center">
                                    <Trash2 className="mr-3 text-rose-600" size={28} />
                                    Delete Account?
                                </h2>
                                <p className="text-slate-600 mb-8 leading-relaxed">
                                    Are you absolutely sure? This action is <span className="font-bold text-slate-800">permanent</span> and will remove all your data, posts, and access to this platform.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        No, Keep it
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isSubmitting}
                                        className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    );
};

export default DashboardLayout;
