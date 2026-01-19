import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FileText, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ myPosts: 0 });
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data } = await api.get('/posts');
            setRecentPosts(data.slice(0, 5));
            setStats({ myPosts: data.length });
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">User Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {user?.name || 'User'}! Here's your activity overview.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={FileText}
                    label="My Posts"
                    value={stats.myPosts}
                    color="sky"
                />
                <StatCard
                    icon={Clock}
                    label="Active Days"
                    value="12"
                    color="indigo"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Engagement"
                    value="High"
                    color="emerald"
                />
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800 flex items-center">
                            <Clock size={18} className="mr-2 text-slate-400" />
                            Recent Activity
                        </h2>
                    </div>
                    <div className="p-6">
                        {recentPosts.length > 0 ? (
                            <div className="space-y-4">
                                {recentPosts.map((post) => (
                                    <div key={post.id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <FileText size={20} className="text-slate-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 font-medium line-clamp-1">{post.content}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400">No recent activity found.</p>
                                <button
                                    onClick={() => navigate('/posts')}
                                    className="mt-4 text-primary-600 font-bold text-sm hover:underline"
                                >
                                    Create your first post
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-primary-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">{user?.name}</h3>
                        <p className="text-primary-100 text-sm mb-6 capitalize">{user?.role.replace('_', ' ')}</p>

                        <div className="space-y-4">
                            <div className="bg-white/10 rounded-2xl p-4">
                                <p className="text-[10px] uppercase font-bold text-primary-200 tracking-wider">Account Security</p>
                                <p className="text-sm font-semibold mt-1">Two-Factor Enabled</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4">
                                <p className="text-[10px] uppercase font-bold text-primary-200 tracking-wider">Active Since</p>
                                <p className="text-sm font-semibold mt-1">January 2024</p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl"></div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        sky: 'bg-primary-50 text-primary-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center space-x-4 transition-all hover:shadow-lg hover:shadow-slate-100"
        >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
            </div>
        </motion.div>
    );
};

export default UserDashboard;
