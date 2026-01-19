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
    UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-slate-900 text-white flex-shrink-0 transition-all duration-300 ease-in-out hidden md:flex flex-col"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                            RBAC Panel
                        </span>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
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
                                    RBAC Panel
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
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 hover:bg-slate-100 rounded-lg mr-3"
                        >
                            <Menu size={24} className="text-slate-700" />
                        </button>
                        <h2 className="text-base md:text-lg font-semibold text-slate-800 truncate">
                            {navItems.find(n => n.path === location.pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{user?.name || 'User'}</span>
                            <span className="text-xs text-slate-500 font-semibold uppercase">{user?.role}</span>
                        </div>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                            <UserCircle size={20} className="md:hidden" />
                            <UserCircle size={24} className="hidden md:block" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
