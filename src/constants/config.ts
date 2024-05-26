type Id = string | number

export const userCurrency = localStorage.getItem('userName') || 'anonymous'

export const userNames: Array<string> = JSON.parse(localStorage.getItem('userNames') || '[]')

console.log(userNames)

const urlEndpointsParams = new URLSearchParams({ user: userCurrency }).toString()

export const endpoints = {
  user: {
    getAllUsers: '/users',
    createUser: '/users',
    getUser: (id: Id) => `/user/${id}`,
    updateUser: (id: Id) => `/user/${id}`,
    deleteUser: (id: Id) => `/user/${id}`,
  },
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
