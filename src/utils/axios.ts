import axios, { AxiosRequestConfig } from 'axios'

import { HOST_API } from '@/constants/config'

const axiosInstance = axios.create({ baseURL: HOST_API })

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
)

export default axiosInstance

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args]

  const user = localStorage.getItem('userName') || 'anonymous'

  const params = { ...(config?.params || {}), user }

  const res = await axiosInstance.get(url, { ...config, params })

  return res.data
}

type Id = string | number

export const endpoints = {
  kanban: {
    getAllTasks: '/tasks',
    createTask: '/tasks',
    archiveTask: (id: Id) => `/tasks/${id}/archive`,
    getTask: (id: Id) => `/tasks/${id}`,
    updateTask: (id: Id) => `/tasks/${id}`,
    deleteTask: (id: Id) => `/tasks/${id}`,
  },
}
