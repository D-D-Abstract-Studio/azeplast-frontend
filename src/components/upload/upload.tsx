import { useDropzone } from 'react-dropzone'

import { alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import Typography from '@mui/material/Typography'

import { UploadIllustration } from '@/assets/illustrations'

import { Iconify } from '@/components'

import { UploadProps } from './types'
import RejectionFiles from './errors-rejection-files'
import MultiFilePreview from './preview-multi-file'

import { useCallback } from 'react'
import { axios } from '@/utils/axios'
import { endpoints } from '@/constants/config'

type UploudFile = Array<File & { preview?: string }>

export default function Upload({
  disabled,
  multiple = false,
  error,
  helperText,
  files = [],
  thumbnail,
  sx,
  onChange,
  ...other
}: UploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: UploudFile) => {
      const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as ArrayBuffer)
          reader.onerror = reject
          reader.readAsArrayBuffer(file)
        })
      }

      const processFiles = async (files: UploudFile) => {
        const formData = new FormData()

        await Promise.all(
          files.map(async (file) => {
            const binaryData = await readFileAsArrayBuffer(file)
            const blob = new Blob([binaryData], { type: file.type })
            formData.append('files', blob, file.name)

            file.preview = URL.createObjectURL(file)
          })
        )

        axios
          .post(endpoints.uploads.createUploads, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(({ data }) => onChange(data))
      }

      processFiles(acceptedFiles)
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    onDrop,
    ...other,
  })

  const hasError = isDragReject || !!error

  const onRemove = async ({ name }: File) => {
    await axios.delete(endpoints.uploads.deleteUploads(name)).then(() => {
      const newFiles = files.filter((item) => item.name !== name)

      onChange(newFiles)
    })
  }

  const onRemoveAll = async () => {
    files.forEach(async (file) => {
      await axios.delete(endpoints.uploads.deleteUploads(file.name))
    })

    onChange([])
  }

  const renderPlaceholder = (
    <Stack spacing={3} alignItems="center" justifyContent="center" flexWrap="wrap">
      <UploadIllustration sx={{ width: 1, maxWidth: 200 }} />
      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Typography variant="h6">Arraste ou selecione arquivos</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Solte os arquivos aqui ou clique para
          <Box
            component="span"
            sx={{
              mx: 0.5,
              color: 'primary.main',
              textDecoration: 'underline',
            }}
          >
            {' '}
            Navegar{' '}
          </Box>
          no seu dispositivo
        </Typography>
      </Stack>
    </Stack>
  )

  const renderMultiPreview = (
    <Stack spacing={1} direction="column" sx={{ my: 3 }}>
      <Box sx={{ width: 1, position: 'relative', ...sx }}>
        <MultiFilePreview files={files} thumbnail={thumbnail} onRemove={onRemove} />
      </Box>

      {Boolean(files.length) && (
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="bi:trash" />}
            onClick={onRemoveAll}
          >
            Remover todos os arquivos
          </Button>
        </Stack>
      )}
    </Stack>
  )

  return (
    <Box sx={{ width: 1, position: 'relative', ...sx }}>
      <Box
        {...getRootProps()}
        sx={{
          p: 5,
          outline: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          transition: (theme) => theme.transitions.create(['opacity', 'padding']),
          '&:hover': {
            opacity: 0.72,
          },
          ...(isDragActive && {
            opacity: 0.72,
          }),
          ...(disabled && {
            opacity: 0.48,
            pointerEvents: 'none',
          }),
          ...(hasError && {
            color: 'error.main',
            borderColor: 'error.main',
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
          }),
        }}
      >
        <input {...getInputProps()} />

        {renderPlaceholder}
      </Box>

      {helperText && helperText}

      <RejectionFiles fileRejections={fileRejections} />

      {renderMultiPreview}
    </Box>
  )
}
