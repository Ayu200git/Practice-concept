import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Users, FileText, UserPlus, ShieldAlert, CheckCircle2, XCircle, Lock, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const SubAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0 });
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canUpdatePost: false,
        canDeletePost: false
    });
    const [editingUser, setEditingUser] = useState(null);
    const [editingPost, setEditingPost] = useState(null);

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

            const regularUsers = usersRes.data.filter(u => u.role === 'USER');
            setUsers(regularUsers);
            setPosts(postsRes.data);

            const me = usersRes.data.find(u => Number(u.id) === Number(user?.userId || user?.id));
            console.log("Current Sub-Admin details:", me);
            const userPermissions = me?.permissions || [];

            const perms = {
                canCreate: userPermissions.some(p => p.name === 'CREATE_USER'),
                canUpdate: userPermissions.some(p => p.name === 'UPDATE_USER'),
                canDelete: userPermissions.some(p => p.name === 'DELETE_USER'),
                canUpdatePost: userPermissions.some(p => p.name === 'UPDATE_POST'),
                canDeletePost: userPermissions.some(p => p.name === 'DELETE_POST')
            };
            console.log("Resolved permissions for UI:", perms);
            setPermissions(perms);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const startEditUser = (user) => {
        if (!permissions.canUpdate) {
            toast.error('You do not have UPDATE_USER permission');
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

    const deleteUser = async (userId, userName) => {
        if (!permissions.canDelete) {
            toast.error('You do not have DELETE_USER permission');
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

    const startEditPost = (post) => {
        const isOwner = Number(post.userId) === Number(user.userId);
        if (!permissions.canUpdatePost && !isOwner) {
            toast.error('You do not have permission to update this post');
            return;
        }
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

    const deletePost = async (postId, postTitle, authorId) => {
        const isOwner = Number(authorId) === Number(user.userId);
        if (!permissions.canDeletePost && !isOwner) {
            toast.error('You do not have permission to delete this post');
            return;
        }

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

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="sky" />
                <StatCard icon={FileText} label="Total Posts" value={stats.totalPosts} color="indigo" />
                <StatCard icon={ShieldAlert} label="Your Role" value="Sub-Admin" color="amber" />
                <StatCard
                    icon={permissions.canCreate ? CheckCircle2 : XCircle}
                    label="Create Permission"
                    value={permissions.canCreate ? "Enabled" : "Disabled"}
                    color={permissions.canCreate ? "emerald" : "rose"}
                />
            </div>

            {/* Main Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Users Only
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
                        disabled={!permissions.canCreate}
                        className={`flex items-center px-4 py-2 font-bold rounded-xl transition-all shadow-lg ${permissions.canCreate
                            ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-200 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-slate-100'
                            }`}
                        title={!permissions.canCreate ? "You don't have CREATE_USER permission" : "Create a new user"}
                    >
                        {permissions.canCreate ? <UserPlus size={18} className="mr-2" /> : <Lock size={18} className="mr-2" />}
                        Create User
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'users' && (
                        <UserTable
                            users={users}
                            permissions={permissions}
                            onEditUser={startEditUser}
                            onDeleteUser={deleteUser}
                            editingUser={editingUser}
                            setEditingUser={setEditingUser}
                            onSaveEdit={saveEditUser}
                        />
                    )}
                    {activeTab === 'posts' && (
                        <PostsTable
                            posts={posts}
                            permissions={permissions}
                            currentUserId={user.userId}
                            onEditPost={startEditPost}
                            onDeletePost={deletePost}
                            editingPost={editingPost}
                            setEditingPost={setEditingPost}
                            onSaveEdit={saveEditPost}
                        />
                    )}
                    {activeTab === 'createuser' && (
                        permissions.canCreate ? (
                            <CreateUserForm onSuccess={fetchData} />
                        ) : (
                            <PermissionDenied />
                        )
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
        rose: 'bg-rose-50 text-rose-600',
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

const UserTable = ({ users, permissions, onEditUser, onDeleteUser, editingUser, setEditingUser, onSaveEdit }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">User Management</h3>
            <div className="flex gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full font-bold ${permissions.canUpdate ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {permissions.canUpdate ? '✓' : '✗'} Update
                </span>
                <span className={`px-2 py-1 rounded-full font-bold ${permissions.canDelete ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {permissions.canDelete ? '✓' : '✗'} Delete
                </span>
            </div>
        </div>
        {users.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <Users size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No regular users found</p>
                <p className="text-slate-400 text-sm mt-1">Only USER role accounts are displayed here</p>
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
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-600">
                                            USER
                                        </span>
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
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-600">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => onEditUser(u)}
                                                disabled={!permissions.canUpdate}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${permissions.canUpdate
                                                    ? 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                title={!permissions.canUpdate ? 'You need UPDATE_USER permission' : 'Update user'}
                                            >
                                                <Edit size={14} />
                                                Update
                                            </button>
                                            <button
                                                onClick={() => onDeleteUser(u.id, u.name)}
                                                disabled={!permissions.canDelete}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${permissions.canDelete
                                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                title={!permissions.canDelete ? 'You need DELETE_USER permission' : 'Delete user'}
                                            >
                                                <Trash2 size={14} />
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

const PostsTable = ({ posts, permissions, currentUserId, onEditPost, onDeletePost, editingPost, setEditingPost, onSaveEdit }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">All Posts</h3>
            <div className="flex gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full font-bold ${permissions.canUpdatePost ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {permissions.canUpdatePost ? '✓' : '✗'} Update Post
                </span>
                <span className={`px-2 py-1 rounded-full font-bold ${permissions.canDeletePost ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {permissions.canDeletePost ? '✓' : '✗'} Delete Post
                </span>
            </div>
        </div>
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
                            <th className="px-4 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {posts.map((post) => (
                            editingPost?.id === post.id ? (
                                <tr key={post.id} className="bg-indigo-50">
                                    <td className="px-4 py-4" colSpan="2">
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={editingPost.title}
                                                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm font-medium"
                                                placeholder="Post Title"
                                            />
                                            <textarea
                                                value={editingPost.content}
                                                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm h-24"
                                                placeholder="Post Content"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center" colSpan="2">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={onSaveEdit}
                                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
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
                                    <td className="px-4 py-4 font-medium text-slate-900">
                                        <div>
                                            {post.title}
                                            <p className="text-[10px] text-slate-400 font-normal mt-0.5 max-w-xs truncate">
                                                {post.content.substring(0, 60)}...
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 font-medium">
                                        {post.user?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-4 text-slate-500 text-xs">
                                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-2 justify-center">
                                            {(() => {
                                                const isOwner = Number(post.userId) === Number(currentUserId);
                                                const canUpdate = permissions.canUpdatePost || isOwner;
                                                const canDelete = permissions.canDeletePost || isOwner;

                                                return (
                                                    <>
                                                        <button
                                                            onClick={() => onEditPost(post)}
                                                            disabled={!canUpdate}
                                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${canUpdate
                                                                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                }`}
                                                            title={!canUpdate ? 'Permission required' : 'Update post'}
                                                        >
                                                            <Edit size={14} />
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={() => onDeletePost(post.id, post.title, post.userId)}
                                                            disabled={!canDelete}
                                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${canDelete
                                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                }`}
                                                            title={!canDelete ? 'Permission required' : 'Delete post'}
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </>
                                                );
                                            })()}
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
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-8 border border-sky-100">
                <div className="flex items-center mb-6">
                    <div className="h-12 w-12 bg-sky-600 text-white rounded-2xl flex items-center justify-center mr-4">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Create New User</h3>
                        <p className="text-sm text-slate-600">Add a new user to the system</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter secure password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Creating User...' : 'Create User'}
                    </button>
                </form>

                <div className="mt-6 bg-white/50 rounded-xl p-4 border border-sky-200">
                    <p className="text-xs text-slate-600 flex items-start">
                        <CheckCircle2 size={16} className="mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>You have <strong>CREATE_USER</strong> permission. Users created will have the USER role by default.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const PermissionDenied = () => (
    <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-12 text-center border border-rose-100">
            <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Permission Required</h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
                You don't have the <strong>CREATE_USER</strong> permission. Please contact your administrator to request access.
            </p>
            <div className="bg-white/50 rounded-xl p-4 border border-rose-200 max-w-sm mx-auto">
                <p className="text-xs text-slate-600 flex items-center justify-center">
                    <XCircle size={16} className="mr-2 text-rose-600" />
                    <span>CREATE_USER permission is <strong>disabled</strong></span>
                </p>
            </div>
        </div>
    </div>
);

export default SubAdminDashboard;
