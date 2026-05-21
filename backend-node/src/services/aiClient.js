import axios from 'axios';
import { config } from '../config/index.js';

const client = axios.create({
  baseURL: config.aiServiceUrl,
  timeout: 30000,
  headers: { 'X-Internal-Key': config.aiInternalKey },
});

export const aiClient = {
  async computeAnalytics(payload) {
    const { data } = await client.post('/api/v1/analytics/compute', payload);
    return data;
  },

  async liveAssistant(payload) {
    const { data } = await client.post('/api/v1/analytics/live', payload);
    return data;
  },

  async detectSuspicion(payload) {
    const { data } = await client.post('/api/v1/analytics/suspicion', payload);
    return data;
  },

  async predict(payload) {
    const { data } = await client.post('/api/v1/analytics/predict', payload);
    return data;
  },

  async generateInsights(payload) {
    const { data } = await client.post('/api/v1/ai/insights', payload);
    return data;
  },

  async generateQuiz(payload) {
    const { data } = await client.post('/api/v1/ai/generate-quiz', payload);
    return data;
  },

  async chat(payload) {
    const { data } = await client.post('/api/v1/ai/chat', payload);
    return data;
  },

  async revisionPlan(payload) {
    const { data } = await client.post('/api/v1/ai/revision-plan', payload);
    return data;
  },

  async explainAnswer(payload) {
    const { data } = await client.post('/api/v1/ai/explain-answer', payload);
    return data;
  },

  async generateReport(payload) {
    const { data } = await client.post('/api/v1/reports/generate', payload);
    return data;
  },
};
