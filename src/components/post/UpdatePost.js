import React, { useState } from 'react';
import Modal from '../Modal';  // Import the Modal component
import './PostForm.css';

const UpdatePost = ({ post, onPostUpdated, isOpen, onClose }) => {
  const [title, setTitle] = useState(post.get('title'));
  const [content, setContent] = useState(post.get('content'));

  const handleSubmit = async (e) => {
    e.preventDefault();

    post.set('title', title);
    post.set('content', content);

    try {
      await post.save();
      onPostUpdated();
      onClose();
    } catch (error) {
      console.error('Error while updating Post: ', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="modal-content">
            <button className="close-button" onClick={onClose}>&times;</button>
            <h2>Update Post</h2>

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
        <button type="submit">Update Post</button>
      </form>
      </div>
    </Modal>
  );
};

export default UpdatePost;
