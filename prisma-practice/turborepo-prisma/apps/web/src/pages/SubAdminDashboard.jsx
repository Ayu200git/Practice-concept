import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { UserPlus, ShieldPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubAdminDashboard = () => {
    const { user } = useAuth();
    const [canCreate, setCanCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        try {
            // We fetch all users but check if the current user has the permission in the backend check
            // However, frontend should also know. Let's assume we can fetch own profile with permissions.
            // Since there is no profile API, we'll try to create a user and handle the 403.
            // Or we can list users (which sub-admins can) and check their own entry.
            const { data } = await api.get('/admin/users');
            const me = data.find(u => u.id === user.userId);
            setCanCreate(me?.permissions.some(p => p.name === 'CREATE_USER'));
        } catch (error) {
            console.error('Permission check failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sub-admin/create-user', formData);
            toast.success('User created successfully');
            setFormData({ name: '', email: '', password: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create user');
        }
    };

    if (loading) return <div className="flex justify-center py-20">Checking Permissions...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <ShieldPlus size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Sub-Admin Workspace</h2>
                        <p className="text-slate-500 text-sm">Manage users and system activities</p>
                    </div>
                </div>

                {canCreate ? (
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                <UserPlus size={20} className="mr-2 text-sky-600" />
                                Register New User
                            </h3>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
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
                                    className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all"
                                >
                                    Create User
                                </button>
                            </form>
                        </div>

                        <div className="bg-sky-50/50 rounded-2xl p-6 border border-sky-100">
                            <h4 className="font-bold text-sky-900 mb-2">Permissions Status</h4>
                            <p className="text-sm text-sky-700 mb-4">
                                You currently have [CREATE_USER] permission granted by the administrator.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-emerald-600 font-semibold">
                                    <CheckCircle size={16} className="mr-2" /> Can create users
                                </div>
                                <div className="flex items-center text-sm text-slate-400 font-medium">
                                    <AlertCircle size={16} className="mr-2" /> Cannot delete users (Global Rule)
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center">
                        <ShieldPlus size={48} className="mx-auto text-rose-400 mb-4" />
                        <h3 className="text-xl font-bold text-rose-900 mb-2">Access Restricted</h3>
                        <p className="text-rose-700 max-w-sm mx-auto">
                            You do not have permission to create users. Please contact the Admin to request the "CREATE_USER" permission.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CheckCircle = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default SubAdminDashboard;
