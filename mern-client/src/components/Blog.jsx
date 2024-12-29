import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";

const Icon = ({ name }) => {
  switch (name) {
    case "send":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      );
      case "like":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
        );
      case "dislike":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
          </svg>
        );
    default:
      return null;
  }
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "", image: null });
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [editingPost, setEditingPost] = useState(null);
  const { user } = useContext(AuthContext);
  const [editingComment, setEditingComment] = useState(null);
  const [userReactions, setUserReactions] = useState({});

  const IMGBB_API_KEY = "47bd3a08478085812d1960523ecd71ba";

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserReactions();
    }
    window.scrollTo(0, 0);
  }, [user]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again later.");
      setIsLoading(false);
    }
  };

  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    try {
      let imageUrl = null;
      if (newPost.image) {
        imageUrl = await uploadImage(newPost.image);
      }

      const postData = {
        ...newPost,
        author: user.firstName + " " + user.lastName,
        authorPhoto: user.photoURL,
        likes: 0,
        dislikes: 0,
        comments: [],
        imageUrl,
      };

      const response = await fetch("http://localhost:5000/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      const data = await response.json();
      setPosts([data, ...posts]);
      setNewPost({ title: "", content: "", image: null });
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
    }
  };

  const fetchUserReactions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/posts/reactions/${user.uid}`);
      if (!response.ok) throw new Error('Failed to fetch reactions');
      const reactions = await response.json();
      
      const reactionMap = {};
      reactions.forEach(reaction => {
        reactionMap[reaction.postId] = reaction.type;
      });
      setUserReactions(reactionMap);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    if (!user) {
      setError("Please log in to react to posts.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          reactionType
        }),
      });

      if (!response.ok) throw new Error('Failed to update reaction');
      
      const { post, userReaction } = await response.json();
      
      setPosts(posts.map(p => p._id === post._id ? post : p));
      
      setUserReactions(prev => ({
        ...prev,
        [postId]: userReaction
      }));
    } catch (error) {
      console.error('Error updating reaction:', error);
      setError('Failed to update reaction. Please try again.');
    }
  };

  const handleEditPost = async (event) => {
    event.preventDefault();
    try {
      let imageUrl = editingPost.imageUrl;
      if (editingPost.newImage) {
        imageUrl = await uploadImage(editingPost.newImage);
      }

      const response = await fetch(`http://localhost:5000/posts/${editingPost._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingPost.title,
          content: editingPost.content,
          imageUrl,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update post");
      }
      const updatedPost = await response.json();
      setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
      setEditingPost(null);
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Failed to update post. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`http://localhost:5000/posts/${postId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete post");
        }
        setPosts(posts.filter(post => post._id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
        setError("Failed to delete post. Please try again.");
      }
    }
  };

  const handleEditComment = async (postId, commentId, newContent) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newContent,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to edit comment");
      }
      const updatedPost = await response.json();
      setPosts(posts.map((post) =>
        post._id === postId ? updatedPost : post
      ));
      setEditingComment(null);
    } catch (error) {
      console.error("Error editing comment:", error);
      setError("Failed to edit comment. Please try again.");
    }
  };
  
  const handleDeleteComment = async (postId, commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const response = await fetch(`http://localhost:5000/posts/${postId}/comments/${commentId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete comment");
        }
        const updatedPost = await response.json();
        setPosts(posts.map((post) =>
          post._id === postId ? updatedPost : post
        ));
      } catch (error) {
        console.error("Error deleting comment:", error);
        setError("Failed to delete comment. Please try again.");
      }
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!user) {
      setError("Please log in to comment.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: user.firstName + " " + user.lastName,
          authorPhoto: user.photoURL,
          content: newComment,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      const updatedPost = await response.json();
      setPosts(posts.map((post) =>
        post._id === postId ? updatedPost : post
      ));
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    }
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 flex-grow mt-[120px] md:mt-[100px]">
      <h1 className="text-3xl font-bold text-center text-orange-400">Book Community Blogs</h1>
      
      {/* New Post Form */}
      {user ? (
        <form onSubmit={handlePostSubmit} className="mb-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <textarea
            placeholder="What's on your mind about books?"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="w-full p-2 mb-4 border rounded h-24"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewPost({ ...newPost, image: e.target.files[0] })}
            className="text-sm text-gray-900 border border-gray-400 rounded-lg cursor-pointer bg-gray-50 focus:outline-none mr-2"
          />
          <button type="submit" className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500 transition duration-300">
            Post
          </button>
        </form>
      ) : (
        <p className="text-center mb-8">Please log in to create a post.</p>
      )}
  
      {/* Posts List */}
      {currentPosts.map((post) => (
        <div key={post._id} className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <img src={post.authorPhoto || "/api/placeholder/40/40"} alt={post.author} className="w-10 h-10 rounded-full mr-4" />
            <div>
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-600">By {post.author}</p>
            </div>
          </div>
          {post.imageUrl && (
            <img src={post.imageUrl} alt="Post" className="w-70 h-80 mb-4 rounded ml-auto mr-auto" />
          )}
          <p className="mb-4">{post.content}</p>
          
          {/* Reactions Section */}
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => handleReaction(post._id, 'like')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                userReactions[post._id] === 'like' 
                  ? 'text-blue-500 bg-blue-50' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              disabled={!user}
            >
              <Icon name="like" />
              <span className="font-medium">{post.likes || 0}</span>
            </button>
            <button
              onClick={() => handleReaction(post._id, 'dislike')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                userReactions[post._id] === 'dislike' 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              disabled={!user}
            >
              <Icon name="dislike" />
              <span className="font-medium">{post.dislikes || 0}</span>
            </button>
          </div>
  
          {user && user.firstName + " " + user.lastName === post.author && (
            <div className="mb-4">
              <button onClick={() => setEditingPost(post)} className="mr-2 text-blue-500 hover:text-blue-600">Edit</button>
              <button onClick={() => handleDeletePost(post._id)} className="text-red-500 hover:text-red-600">Delete</button>
            </div>
          )}
  
          {/* Comments */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Comments</h3>
            {post.comments && post.comments.map((comment) => (
              <div key={comment._id} className="bg-gray-100 p-3 rounded mb-2">
                <div className="flex items-center mb-2">
                  <img src={comment.authorPhoto || "/api/placeholder/30/30"} alt={comment.author} className="w-6 h-6 rounded-full mr-2" />
                  <p className="font-semibold">{comment.author}</p>
                  {comment.edited && <span className="text-xs text-gray-500 ml-2">(edited)</span>}
                </div>
                {editingComment === comment._id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleEditComment(post._id, comment._id, e.target.content.value);
                  }}>
                    <input
                      name="content"
                      defaultValue={comment.content}
                      className="w-full p-2 border rounded mb-2"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Save</button>
                    <button type="button" onClick={() => setEditingComment(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                  </form>
                ) : (
                  <p>{comment.content}</p>
                )}
                {user && user.firstName + " " + user.lastName === comment.author && editingComment !== comment._id && (
                  <div className="mt-2">
                    <button onClick={() => setEditingComment(comment._id)} className="text-blue-500 mr-2">Edit</button>
                    <button onClick={() => handleDeleteComment(post._id, comment._id)} className="text-red-500">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
  
          {/* New Comment Form */}
          {user ? (
            <div className="mt-4 flex">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-grow p-2 border rounded-l"
              />
              <button 
                onClick={() => handleCommentSubmit(post._id)} 
                className="bg-orange-500 text-white px-4 py-2 rounded-r hover:bg-orange-600 transition duration-300"
              >
                <Icon name="send" />
              </button>
            </div>
          ) : (
            <p className="mt-4 text-center">Please log in to comment.</p>
          )}
        </div>
      ))}
  
      {/* Pagination */}
      <div className="flex justify-center mt-8">
        {Array.from({ length: Math.ceil(posts.length / postsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1 ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
  
      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Post</h2>
            <form onSubmit={handleEditPost}>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                className="w-full p-2 mb-4 border rounded"
                required
              />
              <textarea
                value={editingPost.content}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                className="w-full p-2 mb-4 border rounded h-24"
                required
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => setEditingPost(null)} className="mr-2 text-gray-500">Cancel</button>
                <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-300">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Blog;