import { useState } from 'react'

import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

import { Iconify } from '@/components/iconify'
import { StyledArrow } from '@/components/custom-popover/styles'
import { SettingsDrawer } from './drawer'

export const SettingsButton = () => {
  const [openDrawer, setOpenDrawer] = useState(false)

  const settings = {
    open: openDrawer,
    onToggle: () => setOpenDrawer((prev) => !prev),
    onClose: () => setOpenDrawer(false),
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          backgroundColor: 'background.paper',
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '50%',
          right: 10,
          zIndex: 999,
          width: 40,
          height: 40,
        }}
      >
        <StyledArrow arrow="right-top-right" />
        <IconButton component={m.button} onClick={settings.onToggle}>
          <Iconify icon="solar:settings-bold-duotone" size={2.8} />
        </IconButton>
      </Box>

      <SettingsDrawer settings={settings} />
    </>
  )
}
