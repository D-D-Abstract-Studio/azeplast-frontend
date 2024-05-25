'use client'

import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionActions from '@mui/material/AccordionActions'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Button from '@mui/material/Button'
import Drawer, { drawerClasses } from '@mui/material/Drawer'

import { paper } from '@/theme/css'

import { Iconify } from '@/components/iconify'
import Scrollbar from '@/components/scrollbar'

import { useRequest } from '@/hooks/use-request'

import { SettingsContextProps } from '.'
import { endpoints } from '../../constants/config'

import { User } from '@/types/user'
import { Paper } from '@mui/material'

export const DrawerUser = ({ drawer }: { drawer: SettingsContextProps }) => {
  const theme = useTheme()

  const { data } = useRequest<Array<User>>({
    url: endpoints.user.getAllUsers,
  })

  return (
    <Drawer
      anchor="right"
      open={drawer.open}
      onClose={drawer.onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({ theme, bgcolor: theme.palette.background.default }),
          width: 280,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ py: 2, pr: 1, pl: 2.5 }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Settings
        </Typography>

        <IconButton onClick={drawer.onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar>
        <Accordion>
          <AccordionSummary
            expandIcon={<Iconify icon="mdi:chevron-down" />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            kapa 1
          </AccordionSummary>
          <AccordionDetails>kapa 2</AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<Iconify icon="mdi:chevron-down" />}
            aria-controls="panel3-content"
            id="panel3-header"
          >
            Usuários
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="column" spacing={1}>
              {data?.map((user, index) => (
                <Paper key={index} sx={{ p: 1 }} elevation={2}>
                  <Stack direction="column" spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography variant="body1">{user.name}</Typography>
                      <Typography variant="body2">{user.permissions}</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </AccordionDetails>
          <AccordionActions>
            <Button>Cancel</Button>
            <Button>Agree</Button>
          </AccordionActions>
        </Accordion>
      </Scrollbar>
    </Drawer>
  )
}
