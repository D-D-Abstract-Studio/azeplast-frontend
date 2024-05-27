'use client'

import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import { endpoints, userCurrency } from '@/constants/config'

import { User } from '@/types/user'
import { alpha, Box, MenuItem, Paper } from '@mui/material'
import { useForm } from 'react-hook-form'

import { RHFSelect, RHFTextField } from '@/components/hook-form'
import FormProvider from '@/components/hook-form/form-provider'
import { ConfirmDialog } from '@/components/custom-dialog'
import { Iconify } from '@/components/iconify'

import { axios } from '@/utils/axios'

import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import { useBoolean } from '@/hooks/use-boolean'

import { enqueueSnackbar } from 'notistack'
import { IKanbanBoard } from '@/types/kanban'

type Props = {
  user: IKanbanBoard
  dialogEdit: ReturnType
}

export const UpdateBoard = ({ user, mutate }: { user: IKanbanBoard; mutate: () => void }) => {
  const theme = useTheme()

  const UpdateUserSchema = Yup.object().shape({
    _id: Yup.string().required(),
    createdAt: Yup.string().required(),
    updatedAt: Yup.string().required(),
    name: Yup.string().required('Name is required'),
    permissions: Yup.mixed<'user' | 'admin'>()
      .oneOf(['user', 'admin'], "Permissions must be 'user' or 'admin'")
      .required(),
  })

  const methods = useForm<User>({
    defaultValues: user,
    resolver: yupResolver(UpdateUserSchema),
  })

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods

  const handleDelete = async (userId: string) => {
    enqueueSnackbar('Usuário deletado com sucesso!', {
      variant: 'error',
      preventDuplicate: true,
    })

    await axios.delete(endpoints.user.deleteUser(userId)).then(() => mutate())
  }

  const handleUpdate = async (userId: string, updatedData: User) => {
    enqueueSnackbar('Usuário atualizado com sucesso!', {
      variant: 'success',
      preventDuplicate: true,
    })

    await axios.put(endpoints.user.updateUser(userId), updatedData).then(() => mutate())
  }

  return (
    <Paper
      elevation={2}
      sx={{ p: 1, py: 2, backgroundColor: alpha(theme.palette.background.paper, 0.3) }}
    >
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit((data) => handleUpdate(user._id, data))}
      >
        <Stack direction="column" spacing={1}>
          <Stack direction="row" spacing={1}>
            <RHFTextField name="name" label="Nome" />

            <RHFSelect name="permissions" label="Permissões" sx={{ width: 180 }}>
              {[
                {
                  label: 'Usuário',
                  value: 'user',
                },
                {
                  label: 'Admin',
                  value: 'admin',
                },
              ].map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Stack direction="row" spacing={1}>
              {user.name === userCurrency && '(atual)'}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="mdi:delete" />}
                onClick={() => dialogEdit.onTrue()}
              >
                Deletar
              </Button>

              <Button type="submit" variant="contained" color="inherit" disabled={!isDirty}>
                Salvar
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </FormProvider>

      <ConfirmDialog
        open={dialogEdit.value}
        onClose={dialogEdit.onFalse}
        title="Editar"
        content={<>Are you sure want to delete column?</>}
        action={
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              dialogEdit.onFalse()
            }}
          >
            Salvar
          </Button>
        }
      />
    </Paper>
  )
}
