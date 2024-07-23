type Id = string | number

export const userCurrencyStorage = localStorage.getItem('userName') || 'anonymous'

export const categoriesStorage: Array<string> = JSON.parse(
  localStorage.getItem('categories') || '[]'
)

export const userNamesStorage: Array<string> = JSON.parse(localStorage.getItem('userNames') || '[]')

const urlEndpointsParams = new URLSearchParams({ user: userCurrencyStorage }).toString()

export const endpoints = {
  uploads: {
    createUploads: '/uploads',
    deleteUploads: (id: Id) => `/uploads/${id}`,
  },
  user: {
    getAllUsers: '/users',
    createUser: '/users',
    getUser: `/users/${userCurrencyStorage}`,
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
    updateTask: (id: Id) => `/tasks/${id}?${urlEndpointsParams}`,
    deleteTask: (id: Id) => `/tasks/${id}`,
  },
}

export const HOST_API =
  process.env.NODE_ENV === 'production' ? 'http://192.168.2.15' : 'http://localhost:8000'

export const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const
