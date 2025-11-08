import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // 绿色化学评估
  calculateSolventScore: (data: any) =>
    axiosInstance.post('/green-chemistry/solvent-score', data),

  calculateEcoScale: (data: any) =>
    axiosInstance.post('/green-chemistry/eco-scale', data),

  // 色谱分析
  analyzeChromatogram: (data: any) =>
    axiosInstance.post('/analysis/chromatogram', data),

  // HPLC分析
  createHPLCAnalysis: (data: any) =>
    axiosInstance.post('/analysis/hplc', data),

  listHPLCAnalyses: (skip = 0, limit = 100) =>
    axiosInstance.get(`/analysis/hplc?skip=${skip}&limit=${limit}`),

  // 溶剂数据库
  listSolvents: () =>
    axiosInstance.get('/solvents/list'),
}

export default api
