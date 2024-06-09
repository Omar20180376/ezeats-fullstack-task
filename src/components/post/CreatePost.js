import React, { useState } from 'react';
import Parse from '../../ParseConfig';
import { useAuth } from '../../AuthContext';
import Modal from '../Modal';  // Import the Modal component

import './PostForm.css';

const CreatePost = ({ onPostCreated, isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { user } = useAuth();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const Post = Parse.Object.extend('Post');
    const post = new Post();
    post.set('title', title);
    post.set('content', content);
    post.set('userId', user.objectId);

    try {
      await post.save();
      onPostCreated();
      setTitle('');
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error while creating Post: ', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>

       <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Create Post</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit">Create Post</button>
        </form>
      </div>
     </Modal>
  );
};

export default CreatePost;
