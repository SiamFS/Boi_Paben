import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/hooks/useAuth';
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

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: blogService.getAllPosts,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load blog posts');
    },
  });

  const createPostMutation = useMutation({
    mutationFn: blogService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShowPostForm(false);
      toast.success('Post created successfully');
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => blogService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setEditingPost(null);
      toast.success('Post updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: blogService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
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

  // Handle error state
  if (error) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              Failed to load blog posts. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {Array.from({ length: 3 }, (_, index) => (
              <motion.div
                key={`skeleton-post-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 animate-pulse"
              >
                <div className="h-6 w-3/4 mb-4 bg-muted rounded" />
                <div className="h-4 w-full mb-2 bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-16 bg-muted rounded" />
                  <div className="h-8 w-16 bg-muted rounded" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((post) => {
              // Ensure post has required properties with fallbacks
              const postWithDefaults = {
                _id: post._id,
                title: post.title || 'Untitled',
                content: post.content || '',
                author: post.author || 'Anonymous',
                authorId: post.authorId || '',
                authorPhoto: post.authorPhoto || null,
                createdAt: post.createdAt || new Date().toISOString(),
                imageUrl: post.imageUrl || null,
                likes: post.likes || 0,
                dislikes: post.dislikes || 0,
                comments: post.comments || [],
                userReaction: post.userReaction || null,
                edited: post.edited || false,
                ...post
              };

              return (
                <PostCard
                  key={post._id}
                  post={postWithDefaults}
                  onEdit={setEditingPost}
                  onDelete={handleDeletePost}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}