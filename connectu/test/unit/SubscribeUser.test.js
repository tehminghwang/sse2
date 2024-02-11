// SubscribeUser.test.js
import api from './api';
import subscribeToPost from './SubscribeUser';

jest.mock('./api'); // Mock the API module

describe('subscribeToPost', () => {
  it('subscribes a user to a post', async () => {
    const postId = 1;
    const email = 'test@example.com';
    const mockResponse = { message: 'Subscription successful' };

    api.put.mockResolvedValue({ data: mockResponse });

    const response = await subscribeToPost(postId, email);

    expect(response).toEqual(mockResponse);
    expect(api.put).toHaveBeenCalledWith(`/posts/${postId}/subscribe`, { email });
  });
});
