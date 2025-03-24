// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Automatically add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (email: string, password: string, role: string) => 
  api.post('/auth/register', { email, password, role });

export const login = (email: string, password: string) => 
  api.post('/auth/login', { email, password });

// Competition APIs
export const createCompetition = (data: {
  title: string;
  hostId: number;
  maxAge: number;
  algorithm: string;
  startTime: string;
  endTime: string;
  trainData: string;
  testData: string;
  demoFile: string;
}) => api.post('/competitions', data);

export const getCompetitions = () => api.get('/competitions');

export const joinCompetition = (competitionId: number, userId: number, idProofUrl: string) =>
  api.post(`/competitions/${competitionId}/join`, { userId, idProofUrl });

// Submission APIs
export const submitSolution = (competitionId: number, userId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('competitionId', competitionId.toString());
  formData.append('userId', userId.toString());

  return api.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getLeaderboard = (competitionId: number) => 
  api.get(`/competitions/${competitionId}/leaderboard`);

// Verification API (FastAPI)
export const verifyAge = async (idProofUrl: string) => {
  const response = await axios.post(
    'https://your-fastapi-url/verify-age',
    { image_url: idProofUrl }
  );
  return response.data; // { age: number }
};