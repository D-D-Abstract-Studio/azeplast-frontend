import 'simplebar-react/dist/simplebar.min.css'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

import 'mapbox-gl/dist/mapbox-gl.css'

import 'react-quill/dist/quill.snow.css'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import 'react-lazy-load-image-component/src/effects/blur.css'

import ThemeProvider from './theme'

import ProgressBar from './components/progress-bar'
import { MotionLazy } from './components/animate/motion-lazy'
import SnackbarProvider from './components/snackbar/snackbar-provider'

import { KanbanView } from './sections/kanban/view/kanban-view'
import { SettingsContext } from './components/settings/context/settings-context'
import { AuthProvider } from './auth/context/jwt/auth-provider'

export const App = () => {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}
