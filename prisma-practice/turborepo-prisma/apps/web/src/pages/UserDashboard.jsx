import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FileText, Clock, TrendingUp, Send, Edit, Trash2, PlusCircle, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ myPosts: 0 });
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUserData();

        // Initialize Socket.io
        const socket = io();

        const handleRealTimeUpdate = () => {
            fetchUserData(); // Simple way to keep stats and list in sync
        };

        socket.on('postCreated', handleRealTimeUpdate);
        socket.on('postUpdated', handleRealTimeUpdate);
        socket.on('postDeleted', handleRealTimeUpdate);

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchUserData = async () => {
        try {
            const { data } = await api.get('/posts');
            setMyPosts(data);
            setStats({ myPosts: data.length });
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/posts/create-post', formData);
            toast.success('Post created successfully!');
            setFormData({ title: '', content: '' });
            setActiveTab('posts');
        } catch (error) {
            toast.error('Failed to create post');
        } finally {
            setSubmitting(false);
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
                    error: 'Failed to update post'
                }
            );
            setEditingPost(null);
        } catch (error) { }
    };

    const deletePost = async (postId, postTitle) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold">Delete Post?</p>
                <p className="text-sm">Are you sure you want to delete "{postTitle}"?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            toast.promise(
                                api.delete(`/posts/${postId}`),
                                {
                                    loading: 'Deleting...',
                                    success: () => {
                                        return 'Post deleted';
                                    },
                                    error: 'Failed to delete'
                                }
                            );
                        }}
                        className="bg-rose-600 text-white px-3 py-1 rounded-lg text-sm font-bold"
                    >
                        Delete
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 px-3 py-1 rounded-lg text-sm">Cancel</button>
                </div>
            </div>
        ));
    };

    if (loading) return <div className="flex justify-center py-20">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">User Dashboard</h1>
                    <p className="text-slate-500 mt-1">Ready to share something new today?</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveTab('create')}
                        className="flex items-center px-6 py-3 bg-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all hover:-translate-y-0.5"
                    >
                        <PlusCircle size={20} className="mr-2" /> Create Post
                    </button>
                    <button
                        onClick={() => navigate('/posts')}
                        className="flex items-center px-6 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                        <TrendingUp size={20} className="mr-2" /> View Feed
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={FileText} label="My Posts" value={stats.myPosts} color="sky" />
                <StatCard icon={TrendingUp} label="Engagement" value="Normal" color="emerald" />
                <StatCard icon={Clock} label="Account Type" value="Standard" color="indigo" />
            </div>

            {/* Main Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100 px-6 py-4 space-x-4">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Layout} label="Overview" />
                    <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={FileText} label="Manage My Posts" />
                    <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} icon={PlusCircle} label="New Post" />
                </div>

                <div className="p-8">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
                                {myPosts.length > 0 ? (
                                    <div className="space-y-4">
                                        {myPosts.slice(0, 3).map(post => (
                                            <div key={post.id} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-sky-600 shadow-sm">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{post.title}</p>
                                                        <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setActiveTab('posts')} className="text-sky-600 font-bold text-sm">Manage</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 font-medium">No posts yet. Start sharing!</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-indigo-600 to-sky-600 rounded-3xl p-8 text-white">
                                <h3 className="text-xl font-bold mb-4">My Profile</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                                        <span className="text-indigo-100 text-sm">Name</span>
                                        <span className="font-bold">{user?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                                        <span className="text-indigo-100 text-sm">Role</span>
                                        <span className="font-bold capitalize">{user?.role}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'posts' && (
                        <PostsTable
                            posts={myPosts}
                            onEdit={startEditPost}
                            onDelete={deletePost}
                            editingPost={editingPost}
                            setEditingPost={setEditingPost}
                            onSave={saveEditPost}
                        />
                    )}

                    {activeTab === 'create' && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <Send size={24} className="mr-3 text-sky-600" />
                                Create New Post
                            </h2>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter post title..."
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 font-bold text-lg"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <textarea
                                    required
                                    placeholder="Write your content here..."
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 h-48 resize-none"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all flex items-center justify-center"
                                >
                                    {submitting ? 'Creating...' : <><Send size={20} className="mr-2" /> Share Post</>}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${active ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
    >
        <Icon size={18} className="mr-2" /> {label}
    </button>
);

const PostsTable = ({ posts, onEdit, onDelete, editingPost, setEditingPost, onSave }) => (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold font-mono">
                <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {posts.map(post => (
                    editingPost?.id === post.id ? (
                        <tr key={post.id} className="bg-sky-50/50">
                            <td className="px-6 py-4" colSpan="2">
                                <div className="space-y-3">
                                    <input
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold"
                                        value={editingPost.title}
                                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                    />
                                    <textarea
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl h-32"
                                        value={editingPost.content}
                                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={onSave} className="bg-sky-600 text-white px-4 py-2 rounded-xl font-bold text-xs">Save Changes</button>
                                        <button onClick={() => setEditingPost(null)} className="bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-xs">Cancel</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-slate-900">{post.title}</p>
                                    <p className="text-xs text-slate-400 mt-1 truncate max-w-md">{post.content}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => onEdit(post)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                    <button onClick={() => onDelete(post.id, post.title)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    )
                ))}
            </tbody>
        </table>
    </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        sky: 'bg-primary-50 text-primary-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };
    return (
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center space-x-4 transition-all hover:shadow-lg hover:shadow-slate-100">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${colors[color]}`}><Icon size={24} /></div>
            <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
            </div>
        </motion.div>
    );
};

export default UserDashboard;
