import API from './axios';

export async function submitReview(payload) {
  const { data } = await API.post('/reviews', payload);
  return data;
}

export async function getUserReviews(userId) {
  const { data } = await API.get(`/reviews/${userId}`);
  return data;
}

export async function getMyReviews() {
  const { data } = await API.get('/reviews/me');
  return data;
}

