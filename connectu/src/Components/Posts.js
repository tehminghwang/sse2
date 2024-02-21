import React, { useEffect, useState } from "react";
import api from "./api";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortPreference, setSortPreference] = useState('latest');
  const [showCommentsForPost, setShowCommentsForPost] = useState({}); 

  useEffect(() => {
    api.get("/api/enhanced-xposts", {
      params: {
        num: 10,
        sortField: 'last_update_timestamp',
        sortOrder: 'asc'
      }
    })
    .then(response => {
      setPosts(response.data.posts);
      const allInterests = new Set(response.data.posts.flatMap(post => post.interest));
      setInterests([...allInterests]);
    })
    .catch(error => console.error("Error fetching posts:", error));
  }, []);

  const handleInterestClick = (interest) => { 
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSearchChange = (e) => { 
    setSearchTerm(e.target.value);
  };

  const fetchCommentsForPost = (postId) => {
    api.get(`/api/comments`, { params: { postid: postId } })
      .then(response => {
        console.log(`Comments for post ${postId}:`, response.data.comments);
        setComments(prevComments => ({
          ...prevComments,
          [postId]: response.data.comments
        }));
      })
      .catch(error => console.error(`Error fetching comments for post ${postId}:`, error));
  };
  

  const getFilteredAndSortedPosts = () => {
    let filteredPosts = posts.filter(post =>
      (post.header?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       post.interest?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedInterests.length === 0 || selectedInterests.includes(post.interest))
    );
  
    if (sortPreference === 'popular') {
      filteredPosts.sort((a, b) => b.number_of_likes - a.number_of_likes);
    } else {
      filteredPosts.sort((a, b) => new Date(b.last_update_timestamp) - new Date(a.last_update_timestamp));
    }
  
    return filteredPosts;
  };
  

  const subscribe = (postId) => { // Define subscribe function
    console.log(`Subscribing to post ${postId}`);
    // Implement subscription logic here
  };

  const toggleCommentsVisibility = (postId) => {
    setShowCommentsForPost(prevState => {
      const isVisible = prevState[postId];
      const newState = { ...prevState, [postId]: !isVisible };
  
      console.log(`Toggling visibility for post ${postId}. Will show: ${!isVisible}`);
  
      if (!isVisible && !comments[postId]) {
        console.log(`Fetching comments for post ${postId}`);
        fetchCommentsForPost(postId);
      }
  
      return newState;
    });
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
        <button onClick={() => setSortPreference('popular')} style={{ margin: '5px', backgroundColor: sortPreference === 'popular' ? '#ADD8E6' : '' }}>Most Liked Posts</button>
      </div>
      <div>
        <strong>Filter by Interests:</strong> 
        {interests.map((interest, index) => (
          <button key={index} onClick={() => handleInterestClick(interest)} style={{ margin: '5px', backgroundColor: selectedInterests.includes(interest) ? '#ADD8E6' : '' }}> {/* 4. Use selectedInterests */}
            {interest}
          </button>
        ))}
      </div>
      {getFilteredAndSortedPosts().map((post) => (
        <div key={post.postid} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>{post.header} (#{post.postid})</h2>
          <p>{post.description}</p>
          <p>Interest: {post.interest}</p> 
          <p>Posted by: {post.firstname} {post.lastname} ({post.userid}) at {post.university} on {new Date(post.create_timestamp).toLocaleDateString()}</p>
          <p>Likes: {post.number_of_likes}</p>
          <button onClick={() => subscribe(post.postid)}>Click to Like</button> 
          <button onClick={() => toggleCommentsVisibility(post.postid)}>
            {showCommentsForPost[post.postid] ? 'Hide Comments' : 'Show Comments'}
          </button>
          {showCommentsForPost[post.postid] && comments[post.postid] && (
            <div>
              <strong>Comments:</strong>
              {comments[post.postid].map((comment) => (
                <div key={comment.commentid} style={{ marginTop: '5px', paddingLeft: '10px' }}>
                  <p>{comment.comment}</p>
                  <p>Comment by: User {comment.comment_userid} on {new Date(comment.comment_timestamp).toLocaleDateString()}</p>
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
