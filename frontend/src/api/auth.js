import API from './axios';

export async function register(payload) {
  const { data } = await API.post('/auth/register', payload);
  return data;
}

export async function login(payload) {
  const { data } = await API.post('/auth/login', payload);
  return data;
}

