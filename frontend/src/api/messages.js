import API from './axios';

export async function getConversation(userId) {
  const { data } = await API.get(`/messages/${userId}`);
  return data;
}

