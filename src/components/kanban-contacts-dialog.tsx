import { useState } from 'react'

import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import { Stack } from '@mui/material'

import { endpoints } from '@/constants/config'

import { Iconify } from '@/components/iconify'
import SearchNotFound from '@/components/search-not-found'
import { User } from '@/types/user'
import { useRequest } from '@/hooks/use-request'

const ITEM_HEIGHT = 64

type Props = {
  open: boolean
  onClose: VoidFunction
  onRemove: (index: number) => void
  onAppend: (value: { userId: string }) => void
  assigneeValues:
    | Array<{
        userId: string
      }>
    | undefined
}

export const KanbanContactsDialog = ({
  open,
  onClose,
  onRemove,
  onAppend,
  assigneeValues,
}: Props) => {
  const [searchContact, setSearchContact] = useState('')

  const { data: users } = useRequest<Array<User>>({
    url: endpoints.user.getAllUsers,
  })

  const userNames = users?.map((user) => user.name) || []

  const handleSearchContacts = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchContact(event.target.value)

  const dataFiltered = applyFilter({
    inputData: userNames,
    query: searchContact,
  })

  const notFound = !dataFiltered.length && !!searchContact

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 1 }}>
        Usuários <Typography component="span">({userNames.length})</Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} direction="column">
          <TextField
            fullWidth
            value={searchContact}
            onChange={handleSearchContacts}
            placeholder="Search..."
          />

          {notFound ? (
            <SearchNotFound query={searchContact} sx={{ mt: 3, mb: 10 }} />
          ) : (
            <Stack
              spacing={1}
              direction="column"
              sx={{
                px: 1,
                overflowY: 'auto',
                height: ITEM_HEIGHT * 6,
              }}
            >
              {dataFiltered.map((contact, index) => {
                const checked = assigneeValues?.map((person) => person.userId).includes(contact)

                return (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{
                      width: '100%',
                      p: 1,
                      height: ITEM_HEIGHT,
                      backgroundColor: 'background.neutral',
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar alt={contact} color="secondary">
                        <Typography variant="button">
                          {contact.slice(0, 3).toUpperCase()}
                        </Typography>
                      </Avatar>
                      {contact}
                    </Stack>

                    {checked ? (
                      <Button
                        color="error"
                        variant="soft"
                        size="small"
                        onClick={() => onRemove(index)}
                        startIcon={<Iconify icon="eva:person-remove-fill" />}
                      >
                        Remover
                      </Button>
                    ) : (
                      <Button
                        color="primary"
                        variant="soft"
                        size="small"
                        onClick={() => onAppend({ userId: contact })}
                        startIcon={<Iconify icon="eva:person-add-fill" />}
                      >
                        Atribuir
                      </Button>
                    )}
                  </Stack>
                )
              })}
            </Stack>
          )}
        </Stack>
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
