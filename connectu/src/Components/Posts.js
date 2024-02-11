import React, { useEffect, useState } from "react";
import axios from "axios";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortPreference, setSortPreference] = useState('latest');
  const [showCommentsForPost, setShowCommentsForPost] = useState({}); // New state to track comment visibility per post

  useEffect(() => {
    axios.get("https://my-json-server.typicode.com/tehminghwang/database/posts")
      .then(response => {
        setPosts(response.data);
        const allTags = new Set(response.data.flatMap(post => post.tags));
        setTags([...allTags]);
        // Initialize showCommentsForPost state for each post
        const initialShowCommentsState = {};
        response.data.forEach(post => {
          initialShowCommentsState[post.id] = false;
        });
        setShowCommentsForPost(initialShowCommentsState);
      });

    axios.get("https://my-json-server.typicode.com/tehminghwang/database/comments")
      .then(response => {
        setComments(response.data);
      });
  }, []);

  // Define handleTagClick function
  const handleTagClick = (tag) => {
    setSelectedTags((prevSelectedTags) => {
      if (prevSelectedTags.includes(tag)) {
        // If tag is already selected, remove it from the array
        return prevSelectedTags.filter((t) => t !== tag);
      } else {
        // Otherwise, add the tag to the array
        return [...prevSelectedTags, tag];
      }
    });
  };
  
  const toggleCommentsVisibility = (postId) => {
    setShowCommentsForPost(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const getFilteredAndSortedPosts = () => {
    let filteredPosts = selectedTags.length > 0
      ? posts.filter(post => post.tags.some(tag => selectedTags.includes(tag)))
      : posts;

    if (sortPreference === 'popular') {
      filteredPosts.sort((a, b) => b.likes - a.likes);
    } else {
      filteredPosts.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    }

    return filteredPosts;
  };

  return (
    <div>
      <h1>ConnectU Newsfeed</h1>
      <h3>Connect, Collaborate, Create With Friends</h3>
      <div>
        <strong>Sort by:</strong>
        <button onClick={() => setSortPreference('latest')} style={{ margin: '5px', backgroundColor: sortPreference === 'latest' ? '#ADD8E6' : '' }}>Latest</button>
        <button onClick={() => setSortPreference('popular')} style={{ margin: '5px', backgroundColor: sortPreference === 'popular' ? '#ADD8E6' : '' }}>Most Popular</button>
      </div>
      <div>
        <strong>Filter by Tags:</strong>
        {tags.map((tag, index) => (
          <button key={index} onClick={() => handleTagClick(tag)} style={{ margin: '5px', backgroundColor: selectedTags.includes(tag) ? '#ADD8E6' : '' }}>{tag}</button>
        ))}
      </div>
      {getFilteredAndSortedPosts().map((post) => (
        <div key={post.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>{post.title}</h2>
          <p>{post.description}</p>
          <p>Posted by: {post.username} on {new Date(post.dateCreated).toLocaleDateString()}</p>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ marginRight: '15px' }}>Likes: {post.likes}</p>
            <button onClick={() => toggleCommentsVisibility(post.id)}>{showCommentsForPost[post.id] ? 'Hide Comments' : 'Show Comments'}</button>
          </div>
          {showCommentsForPost[post.id] && (
            <div style={{ marginTop: '10px' }}>
              <strong>Comments:</strong>
              {comments.filter(comment => comment.postId === post.id).map((comment) => (
                <div key={comment.id} style={{ marginTop: '5px', paddingLeft: '10px' }}>
                  <p>{comment.body}</p>
                  <p>Comment by: {comment.username} on {new Date(comment.dateCreated).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Posts;
