import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, Edit, Trash2, Send } from 'lucide-react';
import PropTypes from 'prop-types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { blogService } from '../services/blogService';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function PostCard({ post, onEdit, onDelete }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const isAuthor = user?.uid === post.authorId;

  const reactMutation = useMutation({
    mutationFn: ({ postId, reactionType }) => blogService.reactToPost(postId, reactionType),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }) => blogService.addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      setCommentText('');
      toast.success('Comment added');
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ postId, commentId, content }) => 
      blogService.updateComment(postId, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      setEditingComment(null);
      toast.success('Comment updated');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ postId, commentId }) => blogService.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Comment deleted');
    },
  });

  const handleReaction = (reactionType) => {
    if (!user) {
      toast.error('Please login to react');
      return;
    }
    reactMutation.mutate({ postId: post._id, reactionType });
  };

  const handleAddComment = () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ postId: post._id, content: commentText });
  };

  const handleUpdateComment = () => {
    if (!editCommentText.trim()) return;
    updateCommentMutation.mutate({
      postId: post._id,
      commentId: editingComment._id,
      content: editCommentText,
    });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Delete this comment?')) {
      deleteCommentMutation.mutate({ postId: post._id, commentId });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={post.authorPhoto || 'https://i.ibb.co/yWjpDXh/image.png'}
              alt={post.author}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">{post.author}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(post.createdAt)}
                {post.edited && ' (edited)'}
              </p>
            </div>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(post)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(post._id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full rounded-lg mb-4"
          />
        )}

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
              post.userReaction === 'like'
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likes || 0}</span>
          </button>
          <button
            onClick={() => handleReaction('dislike')}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
              post.userReaction === 'dislike'
                ? 'bg-destructive/10 text-destructive'
                : 'hover:bg-muted'
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{post.dislikes || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        {showComments && (
          <div className="border-t pt-4 space-y-4">
            {user && (
              <div className="flex gap-2">                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="input flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={comment.authorPhoto || 'https://i.ibb.co/yWjpDXh/image.png'}
                        alt={comment.author}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <span className="font-medium text-sm">{comment.author}</span>
                      {comment.edited && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                    </div>
                    {user?.uid === comment.authorId && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingComment(comment);
                            setEditCommentText(comment.content);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingComment?._id === comment._id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="input flex-1"
                      />
                      <Button size="sm" onClick={handleUpdateComment}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingComment(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm">{comment.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    authorId: PropTypes.string.isRequired,
    authorPhoto: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    comments: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      authorPhoto: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
    })),
    userReaction: PropTypes.string,
    edited: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};