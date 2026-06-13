import axios from 'axios'

const BASE = 'http://localhost:3001/api'

export const getSummary = () => axios.get(`${BASE}/summary`)
export const getTrends = () => axios.get(`${BASE}/trends`)
export const getProducts = () => axios.get(`${BASE}/products`)
export const postChat = (question) => axios.post(`${BASE}/chat`, { question })