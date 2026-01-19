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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        {
            name: 'Dashboard',
            path: user?.role === 'ADMIN' ? '/admin' : user?.role === 'SUB_ADMIN' ? '/sub-admin' : '/user',
            icon: LayoutDashboard,
            roles: ['ADMIN', 'SUB_ADMIN', 'USER']
        },
        {
            name: 'Admin Panel',
            path: '/admin',
            icon: ShieldCheck,
            roles: ['ADMIN', 'SUB_ADMIN']
        },
        {
            name: 'Posts Feed',
            path: '/posts',
            icon: FileText,
            roles: ['ADMIN', 'SUB_ADMIN', 'USER']
        },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {navItems.find(n => n.path === location.pathname)?.name || 'Dashboard'}
                    </h2>
                    <div className="flex items-center space-y-2">
                        <div className="flex flex-col items-end mr-3">
                            <span className="text-sm font-medium text-slate-900">{user?.name || 'User'}</span>
                            <span className="text-xs text-slate-500 font-semibold uppercase">{user?.role}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                            <UserCircle size={24} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
