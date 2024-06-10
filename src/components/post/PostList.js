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
    let subscription;
    if (user) {
      fetchPosts();

      const Post = Parse.Object.extend('Post');
      const query = new Parse.Query(Post);
      query.include('userId');

      query.subscribe().then(sub => {
        subscription = sub;

        subscription.on('create', post => {
          setPosts(prevPosts => {
            if (!prevPosts.some(p => p.id === post.id)) {
              return [...prevPosts, post];
            }
            return prevPosts;
          });
        });

        subscription.on('update', post => {
          setPosts(prevPosts => prevPosts.map(prevPost => (prevPost.id === post.id ? post : prevPost)));
        });

        subscription.on('delete', post => {
          setPosts(prevPosts => prevPosts.filter(prevPost => prevPost.id !== post.id));
        });
      }).catch(error => {
        console.error('Error subscribing to live query:', error);
      });
    } else {
      navigate('/login');
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe().catch(error => {
          console.error('Error unsubscribing from live query:', error);
        });
      }
    };
  }, [user, filter]); // Add filter to the dependency array

  const fetchPosts = async () => {
    const Post = Parse.Object.extend('Post');
    const query = new Parse.Query(Post);
    query.include('userId');

    try {
      const results = await query.find();
      const postsWithUsernames = await Promise.all(results.map(async post => {
        const userId = post.get('userId');
        if (userId) {
          try {
            const userQuery = new Parse.Query(Parse.User);
            const user = await userQuery.get(userId.id);
            post.set('username', user.get('username'));
          } catch (userError) {
            console.warn('User not found for post:', post.id, userError);
            post.set('username', 'Unknown');
          }
        } else {
          post.set('username', 'Unknown');
        }
        return post;
      }));
      setPosts(postsWithUsernames);
    } catch (error) {
      console.error('Error while fetching Posts:', error);
      alert('Error while fetching Posts. Please try again later.');
    }
  };

  const deletePost = async postId => {
    const Post = Parse.Object.extend('Post');
    const query = new Parse.Query(Post);

    try {
      const post = await query.get(postId);
      await post.destroy();
      fetchPosts(); // Fetch posts after deletion to ensure state is updated
    } catch (error) {
      console.error('Error while deleting Post:', error);
      alert('Error while deleting Post. Please try again later.');
    }
  };

  const filteredPosts = posts.filter(post => {
    const postUserId = post.get('userId');
    if (filter === 'my') {
      return user && postUserId && postUserId.id === user.id;
    }
    if (filter === 'others') {
      return user && postUserId && postUserId.id !== user.id;
    }
    return true;
  });

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
        {filteredPosts.map(post => (
          <div key={post.id} className="post">
            <h3>{post.get('title')}</h3>
            <p>{post.get('content')}</p>
            <div className="post-meta">
              <p className="meta-item">Created by: {post.get('username')}</p>
              <p className="meta-item">Created at: {new Date(post.createdAt).toLocaleString()}</p>
            </div>
            {user && user.id === post.get('userId').id && (
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
