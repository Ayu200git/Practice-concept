import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Users, FileText, UserPlus, ShieldAlert, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0 });
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [managingPermissionsId, setManagingPermissionsId] = useState(null); // ID of sub-admin being managed

    const ALL_PERMISSIONS = [
        { name: 'CREATE_USER', label: 'Create Users', description: 'Allow sub-admin to register new users' },
        { name: 'UPDATE_USER', label: 'Update Users', description: 'Allow sub-admin to edit user details' },
        { name: 'DELETE_USER', label: 'Delete Users', description: 'Allow sub-admin to remove users' },
        { name: 'UPDATE_POST', label: 'Update Posts', description: 'Allow sub-admin to edit any post' },
        { name: 'DELETE_POST', label: 'Delete Posts', description: 'Allow sub-admin to remove any post' },
    ];

    useEffect(() => {
        fetchData();

        // Initialize Socket.io
        const socket = io();

        const handleRealTimeUpdate = () => {
            fetchData();
        };

        socket.on('postCreated', handleRealTimeUpdate);
        socket.on('postUpdated', handleRealTimeUpdate);
        socket.on('postDeleted', handleRealTimeUpdate);

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, postsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/posts/all')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setPosts(postsRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (userId, permissionName, currentEnabled) => {
        const previousUsers = [...users];
        setUsers(currentUsers => currentUsers.map(user => {
            if (user.id === userId) {
                const updatedPermissions = currentEnabled
                    ? user.permissions.filter(p => p.name !== permissionName)
                    : [...user.permissions, { id: Date.now(), name: permissionName }];
                return { ...user, permissions: updatedPermissions };
            }
            return user;
        }));

        try {
            await api.patch('/admin/allow-subadmin-user-creation', {
                subAdminId: userId,
                permissionName,
                isEnabled: !currentEnabled
            });
            toast.success('Permission updated');
            fetchData();
        } catch (error) {
            setUsers(previousUsers);
            toast.error('Failed to update permission');
        }
    };

    const removeSubAdmin = async (subAdminId, subAdminName) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <div>
                    <p className="font-bold text-slate-900">Remove Sub-Admin</p>
                    <p className="text-sm text-slate-600 mt-1">
                        Are you sure you want to remove <span className="font-semibold">{subAdminName}</span> from sub-admin role?
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            toast.promise(
                                api.delete('/admin/remove-sub-admin', { data: { subAdminId } }),
                                {
                                    loading: 'Removing sub-admin...',
                                    success: (response) => {
                                        fetchData();
                                        return response.data.message;
                                    },
                                    error: (err) => err.response?.data?.error || 'Failed to remove sub-admin'
                                }
                            );
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition-all"
                    >
                        Remove
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            style: { maxWidth: '500px' }
        });
    };

    const deletePost = async (postId, postTitle) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <div>
                    <p className="font-bold text-slate-900">Delete Post</p>
                    <p className="text-sm text-slate-600 mt-1">
                        Are you sure you want to delete "<span className="font-semibold">{postTitle}</span>"?
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            toast.promise(
                                api.delete(`/posts/${postId}`),
                                {
                                    loading: 'Deleting post...',
                                    success: () => {
                                        fetchData();
                                        return 'Post deleted successfully';
                                    },
                                    error: (err) => err.response?.data?.error || 'Failed to delete post'
                                }
                            );
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition-all"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            style: { maxWidth: '500px' }
        });
    };

    const deleteUser = async (userId, userName, userRole) => {
        if (userRole === 'ADMIN') {
            toast.error('Cannot delete ADMIN users');
            return;
        }

        toast((t) => (
            <div className="flex flex-col gap-3">
                <div>
                    <p className="font-bold text-slate-900">Delete User</p>
                    <p className="text-sm text-slate-600 mt-1">
                        Are you sure you want to delete <span className="font-semibold">{userName}</span>?
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            toast.promise(
                                api.delete(`/admin/users/${userId}`),
                                {
                                    loading: 'Deleting user...',
                                    success: () => {
                                        fetchData();
                                        return 'User deleted successfully';
                                    },
                                    error: (err) => err.response?.data?.error || 'Failed to delete user'
                                }
                            );
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition-all"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            style: { maxWidth: '500px' }
        });
    };

    const [editingPost, setEditingPost] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    const startEditUser = (user) => {
        if (user.role === 'ADMIN') {
            toast.error('Cannot edit ADMIN users');
            return;
        }
        setEditingUser({ id: user.id, name: user.name, email: user.email, role: user.role });
    };

    const saveEditUser = async () => {
        if (!editingUser) return;

        try {
            await toast.promise(
                api.put(`/admin/users/${editingUser.id}`, {
                    name: editingUser.name,
                    email: editingUser.email,
                    role: editingUser.role
                }),
                {
                    loading: 'Updating user...',
                    success: 'User updated successfully',
                    error: (err) => err.response?.data?.error || 'Failed to update user'
                }
            );
            setEditingUser(null);
            fetchData();
        } catch (error) {

        }
    };

    const startEditPost = (post) => {
        setEditingPost({ id: post.id, title: post.title, content: post.content });
    };

    const saveEditPost = async () => {
        if (!editingPost) return;

        try {
            await toast.promise(
                api.put(`/posts/${editingPost.id}`, {
                    title: editingPost.title,
                    content: editingPost.content
                }),
                {
                    loading: 'Updating post...',
                    success: 'Post updated successfully',
                    error: (err) => err.response?.data?.error || 'Failed to update post'
                }
            );
            setEditingPost(null);
            fetchData();
        } catch (error) {
        }
    };

    const activeSubAdmin = users.find(u => u.id === managingPermissionsId);

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
                            All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('subadmins')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'subadmins' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sub-Admins
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'posts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All Posts
                        </button>
                    </div>
                    <button
                        onClick={() => setActiveTab('createuser')}
                        className="flex items-center px-4 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-200"
                    >
                        <UserPlus size={18} className="mr-2" />
                        Create User
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'users' && (
                        <UserTable
                            users={users}
                            onTogglePermission={togglePermission}
                            onEditUser={startEditUser}
                            onDeleteUser={deleteUser}
                            editingUser={editingUser}
                            setEditingUser={setEditingUser}
                            onSaveEdit={saveEditUser}
                        />
                    )}
                    {activeTab === 'subadmins' && (
                        <SubAdminTable
                            subAdmins={users.filter(u => u.role === 'SUB_ADMIN')}
                            onManagePermissions={(admin) => setManagingPermissionsId(admin.id)}
                            onRemoveSubAdmin={removeSubAdmin}
                            onCreateClick={() => setActiveTab('create')}
                        />
                    )}
                    {activeTab === 'posts' && (
                        <PostsTable
                            posts={posts}
                            onDeletePost={deletePost}
                            onEditPost={startEditPost}
                            editingPost={editingPost}
                            setEditingPost={setEditingPost}
                            onSaveEdit={saveEditPost}
                        />
                    )}
                    {activeTab === 'create' && (
                        <CreateSubAdminForm onSuccess={fetchData} />
                    )}
                    {activeTab === 'createuser' && (
                        <CreateUserForm onSuccess={fetchData} />
                    )}
                </div>
            </div>

            {/* Permissions Modal */}
            {activeSubAdmin && (
                <PermissionModal
                    admin={activeSubAdmin}
                    allPermissions={ALL_PERMISSIONS}
                    onToggle={togglePermission}
                    onClose={() => setManagingPermissionsId(null)}
                />
            )}
        </div>
    );
};

const PermissionModal = ({ admin, allPermissions, onToggle, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
        >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Manage Permissions</h3>
                    <p className="text-sm text-slate-500">Configuring access for <span className="text-sky-600 font-semibold">{admin.name}</span></p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                    <XCircle size={24} />
                </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {allPermissions.map((perm) => {
                    const isEnabled = admin.permissions.some(p => p.name === perm.name);
                    return (
                        <div key={perm.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-sky-100 hover:bg-sky-50 transition-all group">
                            <div className="flex items-center space-x-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${isEnabled ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <CheckCircle2 size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{perm.label}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tight font-semibold">{perm.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onToggle(admin.id, perm.name, isEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${isEnabled ? 'bg-sky-600' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                    Done
                </button>
            </div>
        </motion.div>
    </div>
);

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

const UserTable = ({ users, onTogglePermission, onEditUser, onDeleteUser, editingUser, setEditingUser, onSaveEdit }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">User Management</h3>
        {users.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <Users size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No users found</p>
            </div>
        ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 uppercase text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                            <th className="px-4 py-3 font-semibold">Role</th>
                            <th className="px-4 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                            editingUser?.id === u.id ? (
                                <tr key={u.id} className="bg-sky-50">
                                    <td className="px-4 py-4">
                                        <input
                                            type="text"
                                            value={editingUser.name}
                                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm font-medium"
                                            placeholder="Name"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Email"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm font-medium"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="SUB_ADMIN">SUB_ADMIN</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={onSaveEdit}
                                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(null)}
                                                className="px-3 py-1.5 bg-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
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
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => onEditUser(u)}
                                                disabled={u.role === 'ADMIN'}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${u.role === 'ADMIN'
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                                                    }`}
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => onDeleteUser(u.id, u.name, u.role)}
                                                disabled={u.role === 'ADMIN'}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${u.role === 'ADMIN'
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                    }`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const PostsTable = ({ posts, onDeletePost, onEditPost, editingPost, setEditingPost, onSaveEdit }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">All Posts</h3>
        {posts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No posts found</p>
            </div>
        ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 uppercase text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Title</th>
                            <th className="px-4 py-3 font-semibold">Author</th>
                            <th className="px-4 py-3 font-semibold">Created At</th>
                            <th className="px-4 py-3 font-semibold">Content Preview</th>
                            <th className="px-4 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {posts.map((post) => (
                            editingPost?.id === post.id ? (
                                <tr key={post.id} className="bg-sky-50">
                                    <td className="px-4 py-4" colSpan="4">
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={editingPost.title}
                                                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm font-medium"
                                                placeholder="Title"
                                            />
                                            <textarea
                                                value={editingPost.content}
                                                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                                rows="3"
                                                placeholder="Content"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={onSaveEdit}
                                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingPost(null)}
                                                className="px-3 py-1.5 bg-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-slate-900">{post.title}</td>
                                    <td className="px-4 py-4 text-slate-600">{post.user?.name || 'Unknown'}</td>
                                    <td className="px-4 py-4 text-slate-500 text-xs">
                                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 text-xs">
                                        {post.content.substring(0, 80)}{post.content.length > 80 ? '...' : ''}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => onEditPost(post)}
                                                className="px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-bold rounded-lg transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDeletePost(post.id, post.title)}
                                                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-lg transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const SubAdminTable = ({ subAdmins, onManagePermissions, onRemoveSubAdmin, onCreateClick }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Sub-Admin Management</h3>
            <button
                onClick={onCreateClick}
                className="flex items-center px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
            >
                <UserPlus size={18} className="mr-2" />
                Create Sub-Admin
            </button>
        </div>

        {subAdmins.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <ShieldAlert size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No sub-admins found</p>
                <button
                    onClick={onCreateClick}
                    className="mt-4 text-amber-600 font-bold text-sm hover:underline"
                >
                    Create your first sub-admin
                </button>
            </div>
        ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 uppercase text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Sub-Admin Details</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-center">Permissions</th>
                            <th className="px-4 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {subAdmins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                            {admin.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{admin.name}</p>
                                            <p className="text-xs text-slate-500">{admin.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                        Active
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex flex-wrap gap-1 justify-center mb-2 max-w-[200px]">
                                            {admin.permissions.map(p => (
                                                <span key={p.id} className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-100">
                                                    {p.name.replace('_', ' ')}
                                                </span>
                                            ))}
                                            {admin.permissions.length === 0 && (
                                                <span className="text-slate-400 text-[10px] font-medium italic">No access granted</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => onManagePermissions(admin)}
                                            className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 flex items-center bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 transition-all"
                                        >
                                            <ShieldAlert size={12} className="mr-1" />
                                            Manage Access
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={() => onRemoveSubAdmin(admin.id, admin.name)}
                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Remove Sub-Admin"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
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

const CreateUserForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/create-user', formData);
            toast.success('User created successfully');
            setFormData({ name: '', email: '', password: '' });
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Create New User</h3>
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
                className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all disabled:opacity-50"
            >
                {submitting ? 'Creating...' : 'Create User'}
            </button>
        </form>
    );
};

export default AdminDashboard;
