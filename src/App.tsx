import 'react-lazy-load-image-component/src/effects/blur.css'

import ThemeProvider from './theme'

import ProgressBar from './components/progress-bar'
import { MotionLazy } from './components/animate/motion-lazy'
import SnackbarProvider from './components/snackbar/snackbar-provider'

import { KanbanView } from './sections/kanban/kanban-view'
import { SettingsContext } from './components/settings/context/settings-context'

export const App = () => {
  return (
    <SettingsContext.Provider
      value={{
        themeMode: 'dark',
        themeDirection: 'ltr',
        themeContrast: 'default',
        themeLayout: 'vertical',
        themeColorPresets: 'default',
        themeStretch: false,
      }}
    >
      <ThemeProvider>
        <MotionLazy>
          <SnackbarProvider>
            <ProgressBar />
            <KanbanView />
          </SnackbarProvider>
        </MotionLazy>
      </ThemeProvider>
    </SettingsContext.Provider>
  )
}
