'use client'

import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import { endpoints, userCurrency } from '@/constants/config'

import { alpha, MenuItem, Paper } from '@mui/material'
import { useForm } from 'react-hook-form'

import { RHFSelect, RHFTextField } from '@/components/hook-form'
import FormProvider from '@/components/hook-form/form-provider'
import { ConfirmDialog } from '@/components/custom-dialog'
import { Iconify } from '@/components/iconify'

import { axios } from '@/utils/axios'

import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import { enqueueSnackbar } from 'notistack'
import { IKanbanBoard } from '@/types/kanban'
import { mutate } from 'swr'

type Props = {
  board: IKanbanBoard
  dialogEdit: any
}

export const UpdateBoard = ({ board, dialogEdit }: Props) => {
  const theme = useTheme()

  console.log({ board })

  const UpdateUserSchema = Yup.object().shape({
    id: Yup.string().required(),
    name: Yup.string().required(),
    columnIds: Yup.array().required(),
  })

  const methods = useForm<IKanbanBoard>({
    defaultValues: board,
    resolver: yupResolver(UpdateUserSchema),
  })

  const {
    handleSubmit,
    formState: { isDirty, errors },
  } = methods

  console.log(errors)

  const handleUpdate = async (boardId: string, updatedData: IKanbanBoard) =>
    await axios.put(endpoints.boards.updateBoard(boardId), updatedData).then(() => {
      enqueueSnackbar('Quadro atualizado com sucesso')

      mutate(endpoints.user.getAllUsers)
    })

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit((data) => handleUpdate(board.id, data))}>
      <ConfirmDialog
        open={dialogEdit.value}
        onClose={dialogEdit.onFalse}
        title="Editar"
        content={
          <Stack direction="row" spacing={1} py={1}>
            <RHFTextField name="name" label="Nome" />
          </Stack>
        }
        action={
          <Button type="submit" variant="contained" color="inherit" disabled={!isDirty}>
            Salvar
          </Button>
        }
      />
    </FormProvider>
  )
}
