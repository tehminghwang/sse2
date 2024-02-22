import React, { useEffect, useState, useRef } from "react";
import api from "./api";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const lastPostElementRef = useRef(null);

  const [comments, setComments] = useState({});
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortPreference, setSortPreference] = useState('latest');
  const [showCommentsForPost, setShowCommentsForPost] = useState({}); 
  const [newComment, setNewComment] = useState(''); 
  const [addingCommentToPostId, setAddingCommentToPostId] = useState(null); 

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

  const addComment = (postId) => {
    const commentUserId = comments[postId] ? comments[postId].length + 1 : 1; 
    const commentTimestamp = new Date().toISOString();

    api.post('/api/comments', {
      postid: postId,
      comment_userid: commentUserId,
      comment_timestamp: commentTimestamp,
      comment: newComment,
    })
    .then(response => {
      // Assuming the response includes the newly added comment
      const newComment = response.data;
      setComments(prevComments => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newComment],
      }));
      setNewComment(''); // Clear the new comment input field
      setAddingCommentToPostId(null); // Reset the addingCommentToPostId to hide the input field
    })
    .catch(error => console.error(`Error adding comment to post ${postId}:`, error));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/api/enhanced-xposts", {
          params: {
            num: 10,
            page: currentPage, // Updated to send current page
            sortField: 'last_update_timestamp',
            sortOrder: 'asc',
          },
        });
  
        if (currentPage === 1) {
          setPosts(response.data.posts); // Directly set posts if it's the first page
        } else {
          setPosts(prevPosts => [...new Set([...prevPosts, ...response.data.posts])]); // Combine new posts, avoiding duplicates
        }
  
        setHasMore(response.data.posts.length > 0);
        const fetchedInterests = new Set(response.data.posts.flatMap(post => post.interest));
        setInterests(prevInterests => [...new Set([...prevInterests, ...fetchedInterests])]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
  
    fetchPosts();
  }, [currentPage]); // Rely on currentPage to fetch posts
  
  

  useEffect(() => {
    if (!hasMore) return; // Do not observe if there are no more posts to load

    if (observer.current) observer.current.disconnect(); // Reset the observer on currentPage change

    const callback = function(entries) {
      if (entries[0].isIntersecting) {
        setCurrentPage(prevPage => prevPage + 1); // Increment page to load more posts
      }
    };

    observer.current = new IntersectionObserver(callback);
    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    // Cleanup function to disconnect the observer
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, lastPostElementRef.current]); // Depend on hasMore and lastPostElementRef.current


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
          <button key={index} onClick={() => handleInterestClick(interest)} style={{ margin: '5px', backgroundColor: selectedInterests.includes(interest) ? '#ADD8E6' : '' }}>
            {interest}
          </button>
        ))}
      </div>
      {getFilteredAndSortedPosts().map((post, index) => (
        <div 
          key={post.postid} 
          style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}
          ref={index === getFilteredAndSortedPosts().length - 1 ? lastPostElementRef : null} // Set ref to the last post element for infinite scroll
        >
          <h2>{post.header} (#{post.postid})</h2>
          <p>{post.description}</p>
          <p>Interest: {post.interest}</p> 
          <p>Posted by: {post.firstname} {post.lastname} ({post.userid}) at {post.university} on {new Date(post.create_timestamp).toLocaleDateString()}</p>
          <p>Likes: {post.number_of_likes}</p>
          <button onClick={() => subscribe(post.postid)}>Click to Like</button>
          <button onClick={() => toggleCommentsVisibility(post.postid)}>
            {showCommentsForPost[post.postid] ? 'Hide Comments' : 'Show Comments'}
          </button>
          {showCommentsForPost[post.postid] && (
            <div>
              <strong>Comments:</strong>
              {comments[post.postid]?.map((comment) => (
                <div key={comment.commentid} style={{ marginTop: '5px', paddingLeft: '10px' }}>
                  <p>{comment.comment}</p>
                  <p>Comment by: User {comment.comment_userid} on {new Date(comment.comment_timestamp).toLocaleDateString()}</p>
                </div>
              ))}
              {addingCommentToPostId === post.postid && (
                <>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                  />
                  <button onClick={() => addComment(post.postid, newComment)}>Submit Comment</button>
                </>
              )}
              <button onClick={() => setAddingCommentToPostId(post.postid)}>Add Comment</button>
            </div>
          )}
        </div>
      ))}
      {!hasMore && <p>No more posts to load</p>}
    </div>
  );  
}

export default Posts;


