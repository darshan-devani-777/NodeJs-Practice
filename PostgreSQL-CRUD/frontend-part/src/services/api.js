import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

const API = axios.create({
  baseURL: `${API_URL}/users`,
});

export const fetchUsers = () => API.get('/');
export const createUser = (formData) => API.post('/', formData);
export const updateUser = (id, data) => {
  return axios.put(`${API_URL}/users/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const deleteUser = (id) => API.delete(`/${id}`);
