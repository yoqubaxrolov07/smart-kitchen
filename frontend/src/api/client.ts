import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// API Functions
export const getStats = () => api.get('/stats');
export const predict = (data: Record<string, any>) => api.post('/predict', data);
export const trainModels = () => api.post('/train');
export const compareModels = () => api.get('/compare-models');
export const getFeatureImportance = () => api.get('/feature-importance');
export const getRecipes = (ingredients: string[]) => api.post('/recipes', { ingredients });
export const askGemini = (message: string) => api.post('/gemini', { message });
export const getPipeline = () => api.get('/pipeline');
export const uploadCSV = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
