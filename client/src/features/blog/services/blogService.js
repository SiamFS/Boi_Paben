import apiClient from '@/lib/api-client';

export const blogService = {
  async getAllPosts() {
    const response = await apiClient.get('/api/blog/posts');
    return response.data;
  },

  async getPostById(id) {
    const response = await apiClient.get(`/api/blog/posts/${id}`);
    return response.data;
  },

  async createPost(postData) {
    const response = await apiClient.post('/api/blog/posts', postData);
    return response.data;
  },

  async updatePost(id, postData) {
    const response = await apiClient.put(`/api/blog/posts/${id}`, postData);
    return response.data;
  },

  async deletePost(id) {
    const response = await apiClient.delete(`/api/blog/posts/${id}`);
    return response.data;
  },

  async addComment(postId, content) {
    const response = await apiClient.post(`/api/blog/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  },

  async updateComment(postId, commentId, content) {
    const response = await apiClient.put(
      `/api/blog/posts/${postId}/comments/${commentId}`,
      { content }
    );
    return response.data;
  },

  async deleteComment(postId, commentId) {
    const response = await apiClient.delete(
      `/api/blog/posts/${postId}/comments/${commentId}`
    );
    return response.data;
  },

  async reactToPost(postId, reactionType) {
    const response = await apiClient.post(`/api/blog/posts/${postId}/react`, {
      reactionType,
    });
    return response.data;
  },

  async getUserReactions(userId) {
    const response = await apiClient.get(`/api/blog/reactions/${userId}`);
    return response.data;
  },
};