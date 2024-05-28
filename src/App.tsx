import 'react-lazy-load-image-component/src/effects/blur.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ThemeProvider from './theme'

import ProgressBar from './components/progress-bar'
import { MotionLazy } from './components/animate/motion-lazy'
import SnackbarProvider from './contexts/snackbar/snackbar-provider'

import { KanbanView } from '@/sections/kanban/kanban-view'

import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import { Stack } from '@mui/material'

import { endpoints } from './constants/config'

import { SettingsButton } from './components/settings'
import { useRequest } from './hooks/use-request'

import { User } from './types/user'

export const App = () => {
  const { data: user } = useRequest<User>({
    url: endpoints.user.getUser,
  })

  const isPermissionAdmin = user?.permissions === 'admin'

  return (
    <ThemeProvider
      settings={{
        themeMode: 'dark',
        themeDirection: 'ltr',
        themeContrast: 'default',
        themeLayout: 'vertical',
        themeColorPresets: 'default',
        themeStretch: false,
      }}
    >
      <MotionLazy>
        <SnackbarProvider>
          <MuiLocalizationProvider dateAdapter={AdapterDateFns}>
            <ProgressBar />
            {isPermissionAdmin && <SettingsButton />}

            <Stack direction="column" spacing={2}>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<KanbanView />} />
                  <Route path="*" element={<h1>Not Found</h1>} />
                </Routes>
              </BrowserRouter>
            </Stack>
          </MuiLocalizationProvider>
        </SnackbarProvider>
      </MotionLazy>
    </ThemeProvider>
  )
}
