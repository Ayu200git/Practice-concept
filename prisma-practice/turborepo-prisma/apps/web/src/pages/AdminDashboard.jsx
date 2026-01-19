import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Users, FileText, UserPlus, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (userId, permissionName, currentEnabled) => {
        try {
            await api.patch('/admin/allow-subadmin-user-creation', {
                subAdminId: userId,
                permissionName,
                isEnabled: !currentEnabled
            });
            toast.success('Permission updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update permission');
        }
    };

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="sky" />
                <StatCard icon={FileText} label="Total Posts" value={stats.totalPosts} color="indigo" />
                <StatCard icon={ShieldAlert} label="Sub-Admins" value={users.filter(u => u.role === 'SUB_ADMIN').length} color="amber" />
                <StatCard icon={CheckCircle2} label="Status" value="Healthy" color="emerald" />
            </div>

            {/* Main Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Manage Users
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Add Sub-Admin
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'users' ? (
                        <UserTable users={users} onTogglePermission={togglePermission} />
                    ) : (
                        <CreateSubAdminForm onSuccess={fetchData} />
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        sky: 'bg-primary-50 text-primary-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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

const UserTable = ({ users, onTogglePermission }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="text-slate-500 text-sm uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Permissions</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-medium text-slate-900">{u.name}</td>
                        <td className="px-4 py-4 text-slate-600">{u.email}</td>
                        <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' :
                                u.role === 'SUB_ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {u.role}
                            </span>
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                                {u.permissions.map(p => (
                                    <span key={p.id} className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            {u.role === 'SUB_ADMIN' && (
                                <button
                                    onClick={() => onTogglePermission(u.id, 'CREATE_USER', u.permissions.some(p => p.name === 'CREATE_USER'))}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${u.permissions.some(p => p.name === 'CREATE_USER')
                                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        }`}
                                >
                                    {u.permissions.some(p => p.name === 'CREATE_USER') ? 'Revoke Create User' : 'Grant Create User'}
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CreateSubAdminForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/create-sub-admin', formData);
            toast.success('Sub-Admin created successfully');
            setFormData({ name: '', email: '', password: '' });
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create Sub-Admin');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Create New Sub-Admin</h3>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                    type="text"
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                    type="email"
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                    type="password"
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </div>
            <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all"
            >
                {submitting ? 'Creating...' : 'Create Sub-Admin'}
            </button>
        </form>
    );
};

export default AdminDashboard;
