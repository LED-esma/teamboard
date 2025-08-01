import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, Hash, Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseComments, FirebaseComment } from '../services/firebase';

interface Comment extends FirebaseComment {
  // Extend FirebaseComment to include any additional local properties
  replies?: Comment[];
}

const CommentSystem: React.FC = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newCommentTitle, setNewCommentTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Comment['category'] | 'all'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'general', label: 'General Discussion', icon: MessageSquare },
    { id: 'documents', label: 'Document Discussion', icon: Hash },
    { id: 'planning', label: 'Planning & Tasks', icon: Hash },
    { id: 'ideas', label: 'Ideas & Suggestions', icon: Hash },
    { id: 'questions', label: 'Questions & Help', icon: Hash },
  ];

  // Load comments from Firebase
  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true);
        const commentsData = await firebaseComments.getAll();
        setComments(commentsData as Comment[]);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const commentData = {
        content: newComment.trim(),
        author: user.username,
        authorId: user.id,
        category: selectedCategory === 'all' ? 'general' : selectedCategory,
        title: newCommentTitle.trim() || undefined,
        tags: []
      };

      const commentId = await firebaseComments.add(commentData);
      
      if (commentId) {
        setNewComment('');
        setNewCommentTitle('');
        setShowNewPostForm(false);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      const replyData = {
        content: replyContent.trim(),
        author: user.username,
        authorId: user.id,
        category: 'general' as const,
        parentId,
        tags: []
      };

      const replyId = await firebaseComments.add(replyData);
      
      if (replyId) {
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await firebaseComments.delete(commentId);
      // Comment will be removed by the real-time listener
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || comment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8' : ''} bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white">{comment.author}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400 text-sm">{formatTimestamp(comment.timestamp)}</span>
            </div>
            {comment.title && (
              <h4 className="text-sm font-medium text-gray-300 mt-1">{comment.title}</h4>
            )}
          </div>
        </div>
        {!isReply && (
          <button
            onClick={() => handleDeleteComment(comment.id)}
            className="text-gray-400 hover:text-red-400"
          >
            ×
          </button>
        )}
      </div>
      <div className="mt-3 text-gray-300">{comment.content}</div>
      {!isReply && (
        <div className="mt-3 flex items-center space-x-4">
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-sm text-gray-400 hover:text-primary-400"
          >
            Reply
          </button>
        </div>
      )}
      {replyingTo === comment.id && (
        <div className="mt-3 p-3 bg-gray-700 rounded-lg">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            rows={2}
          />
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => handleAddReply(comment.id)}
              className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
            >
              Reply
            </button>
            <button
              onClick={() => setReplyingTo(null)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Forum</h2>
        <button
          onClick={() => setShowNewPostForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all' as any)}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            selectedCategory === 'all' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as Comment['category'])}
            className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
              selectedCategory === category.id 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Post</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={newCommentTitle}
                onChange={(e) => setNewCommentTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Post title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Comment['category'])}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                placeholder="Write your post..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Post
              </button>
              <button
                onClick={() => setShowNewPostForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No posts found.</p>
            <p className="text-sm">Create a new post to get started.</p>
          </div>
        ) : (
          filteredComments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentSystem; 