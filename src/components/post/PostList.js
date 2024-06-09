import React, { useState, useEffect } from 'react';
import Parse from '../../ParseConfig';
import CreatePost from './CreatePost';
import UpdatePost from './UpdatePost';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import './PostList.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // Initialize filter state
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    } else {
      navigate('/login');
    }
  }, [user, filter]); // Add filter to the dependency array

  const fetchPosts = async () => {
    const Post = Parse.Object.extend('Post');
    const query = new Parse.Query(Post);
    query.include('userId');

    try {
      const results = await query.find();
      const postsWithUsernames = await Promise.all(results.map(async (post) => {
        const userId = post.get('userId');
        const userQuery = new Parse.Query(Parse.User);
        const user = await userQuery.get(userId);
        post.set('username', user.get('username'));
        return post;
      }));

      // Filter posts based on filter value
      let filteredPosts = [];
      if (filter === 'my') {
        filteredPosts = postsWithUsernames.filter((post) => post.get('userId') === user.objectId);
      } else if (filter === 'others') {
        filteredPosts = postsWithUsernames.filter((post) => post.get('userId') !== user.objectId);
      } else {
        filteredPosts = postsWithUsernames;
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error while fetching Posts: ', error);
    }
  };

  const deletePost = async (postId) => {
    const Post = Parse.Object.extend('Post');
    const query = new Parse.Query(Post);

    try {
      const post = await query.get(postId);
      await post.destroy();
      fetchPosts();
    } catch (error) {
      console.error('Error while deleting Post: ', error);
    }
  };

  return (
    <div className="post-list-container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <button className="create-post-button" onClick={() => setCreateModalOpen(true)}>Create Post</button>

      <CreatePost
        onPostCreated={fetchPosts}
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {editingPost && (
        <UpdatePost
          post={editingPost}
          onPostUpdated={() => {
            setEditingPost(null);
            fetchPosts();
          }}
          isOpen={isUpdateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
        />
      )}

      {/* Filter options */}
      <div className="filter-options">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Posts</button>
        <button className={filter === 'my' ? 'active' : ''} onClick={() => setFilter('my')}>My Posts</button>
        <button className={filter === 'others' ? 'active' : ''} onClick={() => setFilter('others')}>Other Users' Posts</button>
      </div>

      <div className="posts">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <h3>{post.get('title')}</h3>
            <p>{post.get('content')}</p>
            <div className="post-meta">
              <p className="meta-item">Created by: {post.get('username')}</p>
              <p className="meta-item">Created at: {new Date(post.createdAt).toLocaleString()}</p>
            </div>
            {user && user.objectId === post.get('userId') && (
              <>
                <button className="edit-button" onClick={() => { setEditingPost(post); setUpdateModalOpen(true); }}>Edit</button>
                <button className="delete-button" onClick={() => deletePost(post.id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;
