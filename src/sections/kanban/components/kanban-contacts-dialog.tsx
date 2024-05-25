import { useState, useCallback } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import ListItem from '@mui/material/ListItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import ListItemText from '@mui/material/ListItemText'
import DialogContent from '@mui/material/DialogContent'
import InputAdornment from '@mui/material/InputAdornment'
import ListItemAvatar from '@mui/material/ListItemAvatar'

import { Iconify } from '@/components/iconify'

import SearchNotFound from '@/components/search-not-found'

import { COLORS, userNames } from '@/constants/config'

import { getRandomNumber } from '@/utils/get-random-number'

import { IKanbanTask } from '@/types/kanban'

const ITEM_HEIGHT = 64

type Props = {
  open: boolean
  onClose: VoidFunction
  assignee?: IKanbanTask['assignee']
}

export default function KanbanContactsDialog({ assignee = [], open, onClose }: Props) {
  const [searchContact, setSearchContact] = useState('')

  const handleSearchContacts = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchContact(event.target.value)
  }, [])

  const dataFiltered = applyFilter({
    inputData: userNames,
    query: searchContact,
  })

  const notFound = !dataFiltered.length && !!searchContact

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        Usuários <Typography component="span">({userNames.length})</Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchContact}
          onChange={handleSearchContacts}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {notFound ? (
          <SearchNotFound query={searchContact} sx={{ mt: 3, mb: 10 }} />
        ) : (
          <Box
            sx={{
              px: 2.5,
              overflowY: 'auto',
              height: ITEM_HEIGHT * 6,
            }}
          >
            {dataFiltered.map((contact, index) => {
              const checked = assignee.map((person) => person.name).includes(contact)

              return (
                <ListItem
                  key={index}
                  disableGutters
                  secondaryAction={
                    <Button
                      variant="outlined"
                      color={checked ? 'primary' : 'inherit'}
                      startIcon={
                        <Iconify
                          width={16}
                          icon={checked ? 'eva:checkmark-fill' : 'mingcute:add-line'}
                          sx={{ mr: -0.5 }}
                        />
                      }
                    >
                      {checked ? 'Atribuído' : 'Atribuir'}
                    </Button>
                  }
                  sx={{ height: ITEM_HEIGHT }}
                >
                  <ListItemAvatar>
                    <Avatar alt={contact} color={COLORS[getRandomNumber(0, COLORS.length - 1)]}>
                      {contact[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primaryTypographyProps={{
                      typography: 'subtitle2',
                      sx: { mb: 0.25 },
                    }}
                    secondaryTypographyProps={{ typography: 'caption' }}
                    primary={contact}
                  />
                </ListItem>
              )
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

function applyFilter({ inputData, query }: { inputData: Array<string>; query: string }) {
  if (query) {
    inputData = inputData.filter(
      (contact) => contact.toLowerCase().indexOf(query.toLowerCase()) !== -1
    )
  }

  return inputData
}
