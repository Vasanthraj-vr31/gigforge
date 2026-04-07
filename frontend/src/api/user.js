import API from './axios';

export async function getMe() {
  const { data } = await API.get('/user/me');
  return data;
}

export async function getContacts() {
  const { data } = await API.get('/user/contacts');
  return data;
}

export async function updateMe(payload) {
  const { data } = await API.put('/user/me', payload);
  return data;
}

export async function getFreelancers() {
  const { data } = await API.get('/user/freelancers');
  return data;
}

