import api from './api'; 

const subscribeToPost = async (postId, email) => {

  console.log(`Subscribing ${email} to post ${postId}`);

  return api.put(`/posts/${postId}/subscribe`, { email })
    .then(response => response.data)
    .catch(error => console.error('Subscription error:', error));
};

export default subscribeToPost;