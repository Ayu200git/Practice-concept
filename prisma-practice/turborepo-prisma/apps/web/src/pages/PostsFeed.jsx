import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Send, FileText, User, Calendar, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostsFeed = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPosts();
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
            toast.success('Post created!');
            setTitle('');
            setContent('');
            fetchPosts();
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
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm shadow-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <Quote size={24} className="mr-2 text-sky-600" />
                    Share Your Thoughts
                </h2>
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <input
                        type="text"
                        required
                        placeholder="Post Title..."
                        className="w-full text-lg font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        required
                        placeholder="What's on your mind?"
                        rows="4"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center px-8 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all disabled:opacity-50"
                        >
                            <Send size={18} className="mr-2" /> {submitting ? 'Posting...' : 'Post Content'}
                        </button>
                    </div>
                </form>
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
