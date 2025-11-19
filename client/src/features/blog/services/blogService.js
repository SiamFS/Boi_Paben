import apiClient from '@/lib/api-client';
import cache from '@/lib/cache';

export const blogService = {
  async getAllPosts() {
    try {
      const response = await apiClient.get('/api/blog/posts');
      return response.data;
    } catch (error) {
      // Try to get from cache as fallback
      const cachedPosts = cache.get('/api/blog/posts');
      if (cachedPosts) {
        return cachedPosts;
      }
      throw new Error('Failed to fetch blog posts');
    }
  },

  async getPostById(id) {
    try {
      const response = await apiClient.get(`/api/blog/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch blog post');
    }
  },

  async createPost(postData) {
    try {
      const response = await apiClient.post('/api/blog/posts', postData);
      // Clear cache when creating new post
      cache.delete('/api/blog/posts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to create blog post');
    }
  },

  async updatePost(id, postData) {
    try {
      const response = await apiClient.put(`/api/blog/posts/${id}`, postData);
      // Clear cache when updating post
      cache.delete('/api/blog/posts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to update blog post');
    }
  },

  async deletePost(id) {
    try {
      const response = await apiClient.delete(`/api/blog/posts/${id}`);
      // Clear cache when deleting post
      cache.delete('/api/blog/posts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete blog post');
    }
  },

  async addComment(postId, content) {
    try {
      const response = await apiClient.post(
        `/api/blog/posts/${postId}/comments`,
        {
          content,
        }
      );
      // Clear cache when adding comment
      cache.delete('/api/blog/posts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to add comment');
    }
  },

  async updateComment(postId, commentId, content) {
    try {
      const response = await apiClient.put(
        `/api/blog/posts/${postId}/comments/${commentId}`,
        { content }
      );
      // Clear cache when updating comment
      cache.delete('/api/blog/posts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to update comment');
    }
  },

  async deleteComment(postId, commentId) {
    try {
      const response = await apiClient.delete(
        `/api/blog/posts/${postId}/comments/${commentId}`
      );
      // Clear cache when deleting comment
      cache.delete('/api/blog/posts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete comment');
    }
  },

  async reactToPost(postId, reactionType) {
    try {
      const response = await apiClient.post(`/api/blog/posts/${postId}/react`, {
        reactionType,
      });
      // Clear cache when reacting to post
      cache.delete('/api/blog/posts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to react to post');
    }
  },

  async getUserReactions(userId) {
    try {
      const response = await apiClient.get(`/api/blog/reactions/${userId}`);
      return response.data;
    } catch (error) {
      // Try to get from cache as fallback
      const cachedReactions = cache.get(`/api/blog/reactions/${userId}`);
      if (cachedReactions) {
        return cachedReactions;
      }
      throw new Error('Failed to fetch user reactions');
    }
  },
};