type Id = string | number

export const userCurrency = localStorage.getItem('userName') || 'anonymous'

export const userNames: Array<string> = JSON.parse(localStorage.getItem('userNames') || '[]')

const urlEndpointsParams = new URLSearchParams({ user: userCurrency }).toString()

export const endpoints = {
  user: {
    getAllUsers: '/users',
    createUser: '/users',
    getUser: `/users/${userCurrency}`,
    updateUser: (id: Id) => `/users/${id}`,
    deleteUser: (id: Id) => `/users/${id}`,
  },
  boards: {
    getAllBoards: `/boards?${urlEndpointsParams}`,
    createBoard: '/boards',
    updateBoard: (id: Id) => `/boards/${id}`,
    deleteBoard: (id: Id) => `/boards/${id}`,
  },
  columns: {
    getAllColumns: '/columns',
    createColumn: '/columns',
    updateColumn: (id: Id) => `/columns/${id}`,
    deleteColumn: (id: Id) => `/columns/${id}`,
  },
  tasks: {
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
