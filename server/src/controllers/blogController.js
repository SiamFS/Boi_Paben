import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';

export const blogController = {
  async getAllPosts(req, res) {
    const blogCollection = getCollection('blogs');
    
    const posts = await blogCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // If user is logged in, add their reaction to each post
    if (req.user) {
      const postsWithUserReaction = posts.map(post => ({
        ...post,
        userReaction: post.reactions?.[req.user.uid] || null
      }));
      return res.json(postsWithUserReaction);
    }

    res.json(posts);
  },

  async getPostById(req, res) {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const blogCollection = getCollection('blogs');
    const post = await blogCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  },

  async createPost(req, res) {
    const { title, content, imageUrl } = req.body;
    const blogCollection = getCollection('blogs');

    const newPost = {
      title,
      content,
      imageUrl: imageUrl || null,
      author: req.user.displayName || `${req.user.firstName} ${req.user.lastName}`,
      authorId: req.user.uid,
      authorEmail: req.user.email,
      authorPhoto: req.user.photoURL || null,
      likes: 0,
      dislikes: 0,
      reactions: {}, // Embedded reactions object
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await blogCollection.insertOne(newPost);
    const insertedPost = await blogCollection.findOne({ _id: result.insertedId });

    res.status(201).json(insertedPost);
  },

  async updatePost(req, res) {
    const { id } = req.params;
    const { title, content, imageUrl } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const blogCollection = getCollection('blogs');
    const post = await blogCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to update this post' });
    }

    const updateData = {
      title,
      content,
      ...(imageUrl !== undefined && { imageUrl }),
      updatedAt: new Date(),
      edited: true
    };

    const result = await blogCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'No changes made' });
    }

    const updatedPost = await blogCollection.findOne({ _id: new ObjectId(id) });
    res.json(updatedPost);
  },

  async deletePost(req, res) {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const blogCollection = getCollection('blogs');
    
    const post = await blogCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    // No need to delete from reactions collection anymore - reactions are embedded
    const result = await blogCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(400).json({ error: 'Failed to delete post' });
    }

    res.json({ message: 'Post deleted successfully' });
  },

  async addComment(req, res) {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const blogCollection = getCollection('blogs');
    
    const newComment = {
      _id: new ObjectId(),
      author: req.user.displayName || `${req.user.firstName} ${req.user.lastName}`,
      authorId: req.user.uid,
      authorPhoto: req.user.photoURL || null,
      content,
      createdAt: new Date(),
      edited: false
    };

    const result = await blogCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: newComment } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedPost = await blogCollection.findOne({ _id: new ObjectId(id) });
    res.status(201).json(updatedPost);
  },

  async updateComment(req, res) {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    
    if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const blogCollection = getCollection('blogs');
    const post = await blogCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c._id.toString() === commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to update this comment' });
    }

    const result = await blogCollection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          "comments.$[elem].content": content,
          "comments.$[elem].edited": true,
          "comments.$[elem].updatedAt": new Date()
        }
      },
      {
        arrayFilters: [{ "elem._id": new ObjectId(commentId) }]
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Failed to update comment' });
    }

    const updatedPost = await blogCollection.findOne({ _id: new ObjectId(postId) });
    res.json(updatedPost);
  },

  async deleteComment(req, res) {
    const { postId, commentId } = req.params;
    
    if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const blogCollection = getCollection('blogs');
    const post = await blogCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c._id.toString() === commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    const result = await blogCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $pull: { comments: { _id: new ObjectId(commentId) } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Failed to delete comment' });
    }

    const updatedPost = await blogCollection.findOne({ _id: new ObjectId(postId) });
    res.json(updatedPost);
  },

  async reactToPost(req, res) {
    const { id } = req.params;
    const { reactionType } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (!['like', 'dislike'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const blogCollection = getCollection('blogs');
    const post = await blogCollection.findOne({ _id: new ObjectId(id) });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user.uid;
    const reactions = post.reactions || {};
    const currentReaction = reactions[userId];

    // Toggle or switch reaction
    if (currentReaction === reactionType) {
      // Remove reaction (toggle off)
      delete reactions[userId];
      const updateField = `${reactionType}s`;
      await blogCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { reactions },
          $inc: { [updateField]: -1 }
        }
      );
    } else if (currentReaction) {
      // Switch reaction
      reactions[userId] = reactionType;
      const oldField = `${currentReaction}s`;
      const newField = `${reactionType}s`;
      await blogCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { reactions },
          $inc: { 
            [oldField]: -1,
            [newField]: 1
          }
        }
      );
    } else {
      // New reaction
      reactions[userId] = reactionType;
      const updateField = `${reactionType}s`;
      await blogCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { reactions },
          $inc: { [updateField]: 1 }
        }
      );
    }

    const updatedPost = await blogCollection.findOne({ _id: new ObjectId(id) });

    res.json({
      post: updatedPost,
      userReaction: updatedPost.reactions?.[userId] || null
    });
  },

  async getUserReactions(req, res) {
    const { userId } = req.params;
    const blogCollection = getCollection('blogs');
    
    // Find all posts where user has reacted
    const posts = await blogCollection
      .find({ [`reactions.${userId}`]: { $exists: true } })
      .project({ _id: 1, title: 1, reactions: 1 })
      .toArray();
    
    const userReactions = posts.map(post => ({
      postId: post._id,
      postTitle: post.title,
      type: post.reactions[userId]
    }));
    
    res.json(userReactions);
  }
};