import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EmbeddedComment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: string;
  parentId?: string;
  replies?: EmbeddedComment[];
}

interface EmbeddedCommentsProps {
  contextId: string; // documentId or taskId
  contextType: 'document' | 'task';
  onCommentAdded?: () => void;
}

const EmbeddedComments: React.FC<EmbeddedCommentsProps> = ({ 
  contextId, 
  contextType, 
  onCommentAdded 
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<EmbeddedComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load comments from localStorage
  useEffect(() => {
    const savedComments = localStorage.getItem(`teamboard_embedded_comments_${contextId}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, [contextId]);

  // Save comments to localStorage
  useEffect(() => {
    localStorage.setItem(`teamboard_embedded_comments_${contextId}`, JSON.stringify(comments));
  }, [comments, contextId]);

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;

    const comment: EmbeddedComment = {
      id: `comment_${Date.now()}`,
      content: newComment.trim(),
      author: user.username,
      authorId: user.id,
      timestamp: new Date().toISOString(),
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setShowAddForm(false);
    onCommentAdded?.();
  };

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    const reply: EmbeddedComment = {
      id: `reply_${Date.now()}`,
      content: replyContent.trim(),
      author: user.username,
      authorId: user.id,
      timestamp: new Date().toISOString(),
      parentId
    };

    const updatedComments = comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    });

    setComments(updatedComments);
    setReplyContent('');
    setReplyingTo(null);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: EmbeddedComment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-6 mt-2' : 'mb-3'}`}>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-primary-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-xs font-medium text-gray-900">{comment.author}</p>
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{formatTimestamp(comment.timestamp)}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-700 mt-1">{comment.content}</p>
            
            <div className="flex items-center space-x-3 mt-2">
              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reply
                </button>
              )}
              
              {(user?.id === comment.authorId || user?.role === 'admin') && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={2}
                />
                <div className="flex space-x-2 mt-1">
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    className="px-2 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2 space-y-1">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-900">
            Comments ({comments.length})
          </h4>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-1 px-2 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
        >
          <Plus className="h-3 w-3" />
          <span>Add Comment</span>
        </button>
      </div>

      {/* Add Comment Form */}
      {showAddForm && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Add a comment about this ${contextType}...`}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            rows={3}
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-3 py-1 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Comment
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewComment('');
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">No comments yet</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default EmbeddedComments; 