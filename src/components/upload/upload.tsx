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

  console.log(files)

  /* const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = values.files && values.files?.filter((file) => file !== inputFile)
      setValue('files', filtered)
    },
    [setValue, values.files]
  )

  const handleRemoveAllFiles = useCallback(() => {
    setValue('files', [])
  }, [setValue]) */

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    onDrop,
    ...other,
  })

  const hasError = isDragReject || !!error

  const onRemove = async (data: File) => {
    await axios.delete(endpoints.uploads.deleteUploads(data.name)).then(({ data }) => {
      const newFiles = files.filter((item) => item !== data)

      onChange(newFiles)
    })
  }

  const onRemoveAll = async () => {
    files.forEach(async (file) => {
      await axios.delete(endpoints.uploads.deleteUploads(file.name))
    })

    onChange([])
  }

  const onUpload = () => {
    console.log('Upload files', files)
  }

  const renderPlaceholder = (
    <Stack spacing={3} alignItems="center" justifyContent="center" flexWrap="wrap">
      <UploadIllustration sx={{ width: 1, maxWidth: 200 }} />
      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Typography variant="h6">Drop or Select file</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Drop files here or click
          <Box
            component="span"
            sx={{
              mx: 0.5,
              color: 'primary.main',
              textDecoration: 'underline',
            }}
          >
            browse
          </Box>
          thorough your machine
        </Typography>
      </Stack>
    </Stack>
  )

  const renderMultiPreview = (
    <>
      <Box sx={{ my: 3 }}>
        <MultiFilePreview files={files} thumbnail={thumbnail} onRemove={onRemove} />
      </Box>

      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        <Button color="inherit" variant="outlined" size="small" onClick={onRemoveAll}>
          Remove All
        </Button>

        <Button
          size="small"
          variant="contained"
          onClick={onUpload}
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
        >
          Upload
        </Button>
      </Stack>
    </>
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
