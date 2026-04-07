import API from './axios';

export async function getProjects() {
  const { data } = await API.get('/projects');
  return data;
}

export async function createProject(payload) {
  const { data } = await API.post('/projects', payload);
  return data;
}

export async function completeProject(projectId) {
  const { data } = await API.put(`/projects/${projectId}/complete`);
  return data;
}

