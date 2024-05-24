type Id = string | number

export const user = localStorage.getItem('userName') || 'anonymous'

const urlEndpointsParams = new URLSearchParams({ user }).toString()

export const endpoints = {
  kanban: {
    getAllTasks: `/tasks?${urlEndpointsParams}`,
    createTask: '/tasks',
    archiveTask: (id: Id) => `/tasks/${id}/archive`,
    getTask: (id: Id) => `/tasks/${id}`,
    updateTask: (id: Id) => `/tasks/${id}`,
    deleteTask: (id: Id) => `/tasks/${id}`,
  },
}

export const HOST_API = 'http://localhost:8000'

export const ASSETS_API = 'https://api-dev-minimal-v510.vercel.app'

export const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const
