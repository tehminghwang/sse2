import React, { useEffect, useState } from "react";
import api from "./api"; 
import subscribeToPost from "./SubscribeUser"; 

function Posts() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [sortPreference, setSortPreference] = useState('latest');
  const [showCommentsForPost, setShowCommentsForPost] = useState({});

  useEffect(() => {
    api.get("/posts")
      .then(response => {
        setPosts(response.data);
        const allTags = new Set(response.data.flatMap(post => post.tags));
        setTags([...allTags]);
        const initialShowCommentsState = {};
        response.data.forEach(post => {
          initialShowCommentsState[post.id] = false;
        });
        setShowCommentsForPost(initialShowCommentsState);
      });

    api.get("/comments")
      .then(response => {
        setComments(response.data);
      });
  }, []);

  const subscribe = (postId) => {
    const randomEmail = `user${Math.floor(Math.random() * 1000)}@example.com`; // Generate a random email
    subscribeToPost(postId, randomEmail) // Call the subscribe function
      .then(() => {
        // Ideally, fetch the updated post data here to reflect the new subscription count
        console.log(`Subscribed ${randomEmail} to post ${postId}`);
        // For demonstration, just trigger a re-fetch of posts data
        api.get("/posts").then(response => {
          setPosts(response.data);
        });
      })
      .catch(err => console.error(err));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleCommentsVisibility = (postId) => {
    setShowCommentsForPost(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const getFilteredAndSortedPosts = () => {
    let filteredPosts = posts.filter(post =>
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (selectedTags.length === 0 || post.tags.some(tag => selectedTags.includes(tag)))
    );
  
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
      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ margin: '10px 0', padding: '5px' }}
      />
      <div>
        <strong>Sort by:</strong>
        <button onClick={() => setSortPreference('latest')} style={{ margin: '5px', backgroundColor: sortPreference === 'latest' ? '#ADD8E6' : '' }}>Latest</button>
        <button onClick={() => setSortPreference('popular')} style={{ margin: '5px', backgroundColor: sortPreference === 'popular' ? '#ADD8E6' : '' }}>Most Popular</button>
      </div>
      <div>
        <strong>Filter by Tags:</strong>
        {tags.map((tag, index) => (
          <button key={index} onClick={() => handleTagClick(tag)} style={{ margin: '5px', backgroundColor: selectedTags.includes(tag) ? '#ADD8E6' : '' }}>
            {tag}
          </button>
        ))}
      </div>
      {getFilteredAndSortedPosts().map((post) => (
        <div key={post.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>{post.title}</h2>
          <p>{post.description}</p>
          <p>Tags: {post.tags.join(', ')}</p>
          <p>Posted by: {post.username} on {new Date(post.dateCreated).toLocaleDateString()}</p>
          <p>Likes: {post.likes}</p>
          <p>Subscribers: {post.subscribers.length}</p> 
          <button onClick={() => subscribe(post.id)}>Subscribe</button> 
          <button onClick={() => toggleCommentsVisibility(post.id)} style={{ display: 'block', margin: '10px 0' }}>
            {showCommentsForPost[post.id] ? 'Hide Comments' : 'Show Comments'}
          </button>
          {showCommentsForPost[post.id] && (
            <div>
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
