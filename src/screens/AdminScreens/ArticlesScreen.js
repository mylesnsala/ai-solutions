import React, { useState, useEffect } from 'react';
import {
  FaNewspaper,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaTag,
  FaEye,
  FaEllipsisV,
} from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Plus, Tag } from 'lucide-react';

const ArticleCard = ({ article, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="group overflow-hidden rounded-lg bg-gray-800/30 transition-colors hover:bg-gray-800/40"
  >
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="truncate font-medium text-white">{article.title}</h3>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                article.status === 'published'
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-yellow-500/20 text-yellow-500'
              }`}
            >
              {article.status}
            </span>
          </div>

          <p className="mb-4 line-clamp-2 text-sm text-gray-400">{article.content}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <FaCalendarAlt className="text-red-500" />
              {new Date(article.updatedAt.seconds * 1000).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <FaTag className="text-red-500" />
              {article.category}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-700/50 px-2 py-1 text-xs text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(article)}
            className="rounded-lg bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(article.id)}
            className="rounded-lg bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const ArticlesScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    status: 'draft',
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const articlesQuery = query(collection(firestore, 'articles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(articlesQuery);
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setArticles(articlesData);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (selectedArticle) {
        await updateDoc(doc(firestore, 'articles', selectedArticle.id), {
          ...formData,
          updatedAt: new Date(),
        });
        toast.success('Article updated successfully');
      } else {
        await addDoc(collection(firestore, 'articles'), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success('Article created successfully');
      }
      setShowModal(false);
      setSelectedArticle(null);
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: [],
        status: 'draft',
      });
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    }
  };

  const handleEdit = article => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags || [],
      status: article.status,
    });
    setShowModal(true);
  };

  const handleDelete = async articleId => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteDoc(doc(firestore, 'articles', articleId));
        toast.success('Article deleted successfully');
        fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        toast.error('Failed to delete article');
      }
    }
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = tagToRemove => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-medium text-white">Articles</h2>
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Search articles..."
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-700/50 bg-gray-800/30 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-red-500/50 focus:outline-none md:w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="rounded-lg border border-gray-700/50 bg-gray-800/30 px-4 py-2 text-white focus:border-red-500/50 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={() => {
                setSelectedArticle(null);
                setFormData({
                  title: '',
                  content: '',
                  category: '',
                  tags: [],
                  status: 'draft',
                });
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-red-500 transition-colors hover:bg-red-500/30"
            >
              <FaPlus /> New Article
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <FaSpinner className="animate-spin text-3xl text-red-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {articles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-2xl rounded-lg bg-gray-800 p-6"
              >
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    setFormData({
                      title: '',
                      content: '',
                      category: '',
                      tags: [],
                      status: 'draft',
                    });
                    setShowModal(false);
                  }}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>

                <h3 className="mb-6 text-lg font-medium text-white">
                  {selectedArticle ? 'Edit Article' : 'Create New Article'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Article Title"
                      className="w-full rounded-lg border border-gray-600/50 bg-gray-700/50 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500/50 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your article content here..."
                      className="w-full rounded-lg border border-gray-600/50 bg-gray-700/50 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500/50 focus:outline-none"
                      rows="8"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Category"
                        className="w-full rounded-lg border border-gray-600/50 bg-gray-700/50 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500/50 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-lg border border-gray-600/50 bg-gray-700/50 px-4 py-2 text-white focus:border-red-500/50 focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      name="tags"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      className="w-full rounded-lg border border-gray-600/50 bg-gray-700/50 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500/50 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArticle(null);
                        setFormData({
                          title: '',
                          content: '',
                          category: '',
                          tags: [],
                          status: 'draft',
                        });
                        setShowModal(false);
                      }}
                      className="px-4 py-2 text-gray-400 transition-colors hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-red-500/20 px-6 py-2 text-red-500 transition-colors hover:bg-red-500/30"
                    >
                      {selectedArticle ? 'Update Article' : 'Create Article'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ArticlesScreen;
