import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { blogService } from '../services/blogService';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Blog() {
  const { user } = useAuth();
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: blogService.getAllPosts,
  });

  const createPostMutation = useMutation({
    mutationFn: blogService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      setShowPostForm(false);
      toast.success('Post created successfully');
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => blogService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      setEditingPost(null);
      toast.success('Post updated successfully');
    },
    onError: () => {
      toast.error('Failed to update post');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: blogService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Post deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const handleCreatePost = (data) => {
    createPostMutation.mutate(data);
  };

  const handleUpdatePost = (data) => {
    updatePostMutation.mutate({ id: editingPost._id, data });
  };

  const handleDeletePost = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(id);
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-gradient-to-r from-primary/10 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4 gradient-text">Book Community Blog</h1>
            <p className="text-muted-foreground">
              Share your thoughts, reviews, and stories about books
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        {user && (
          <div className="mb-8">
            {showPostForm ? (
              <PostForm
                onSubmit={handleCreatePost}
                onCancel={() => setShowPostForm(false)}
                loading={createPostMutation.isPending}
              />
            ) : (
              <Button onClick={() => setShowPostForm(true)} className="w-full sm:w-auto">
                Create New Post
              </Button>
            )}
          </div>
        )}

        {editingPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Post</h2>
              <PostForm
                initialData={editingPost}
                onSubmit={handleUpdatePost}
                onCancel={() => setEditingPost(null)}
                loading={updatePostMutation.isPending}
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-6 w-3/4 mb-4" />
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onEdit={setEditingPost}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}