import API from './axios';

export async function createBid(payload) {
  const { data } = await API.post('/bids', payload);
  return data;
}

export async function getProjectBids(projectId) {
  const { data } = await API.get(`/bids/project/${projectId}`);
  return data;
}

export async function acceptBid(bidId) {
  const { data } = await API.put(`/bids/${bidId}/accept`);
  return data;
}

export async function rejectBid(bidId) {
  const { data } = await API.put(`/bids/${bidId}/reject`);
  return data;
}

export async function getMyBids() {
  const { data } = await API.get('/bids/me');
  return data;
}

