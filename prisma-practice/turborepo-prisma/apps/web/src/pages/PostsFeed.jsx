import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Send, FileText, User, Calendar, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const PostsFeed = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchPosts();

        // Initialize Socket.io
        const socket = io();

        socket.on('postCreated', (newPost) => {
            setPosts(prevPosts => [newPost, ...prevPosts]);
        });

        socket.on('postUpdated', (updatedPost) => {
            setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
        });

        socket.on('postDeleted', (deletedId) => {
            setPosts(prevPosts => prevPosts.filter(p => p.id !== Number(deletedId)));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await api.get('/posts/all');
            setPosts(data);
        } catch (error) {
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/posts/create-post', { title, content });
            toast.success('Post created successfully!');
            setTitle('');
            setContent('');
            setShowForm(false);
        } catch (error) {
            toast.error('Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20">Loading Feed...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Create Post Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm shadow-slate-100 overflow-hidden">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center">
                        <Quote size={28} className="mr-3 text-sky-600" />
                        <h2 className="text-2xl font-black text-slate-900">Share Your Thoughts</h2>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${showForm ? 'bg-rose-50 text-rose-500 rotate-45' : 'bg-sky-50 text-sky-600'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                </button>

                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <form onSubmit={handleCreatePost} className="p-8 pt-0 space-y-4 border-t border-slate-100 bg-slate-50/50">
                                <div className="pt-6 space-y-4">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Give your post a title..."
                                        className="w-full text-lg font-bold p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    <textarea
                                        required
                                        placeholder="What's on your mind? Share with the community..."
                                        rows="4"
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 shadow-sm resize-none"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex items-center px-8 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all disabled:opacity-50"
                                        >
                                            <Send size={18} className="mr-2" /> {submitting ? 'Posting...' : 'Post Content'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <FileText size={20} className="mr-2 text-indigo-600" />
                    Community Feed
                </h3>
                <AnimatePresence>
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{post.user?.name || 'Anonymous'}</h4>
                                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                                            {post.user?.role || 'USER'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center">
                                    <Calendar size={14} className="mr-1" /> Just now
                                </div>
                            </div>
                            <h5 className="text-xl font-bold text-slate-800 mb-3">{post.title}</h5>
                            <p className="text-slate-600 leading-relaxed">{post.content}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PostsFeed;
