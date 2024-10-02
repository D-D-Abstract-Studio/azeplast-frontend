import { EditorTextChangeEvent, Editor as PrimeReactEditor } from 'primereact/editor'

import { axios } from '@/utils/axios'

import { Button, TextField } from '@mui/material'
import { Toolbar } from './toolbar'

import { Iconify } from '../iconify'

import { Theme, SxProps, alpha } from '@mui/material/styles'
import { StyledEditor, StyledEditorToolbar } from './styles'

import { endpoints, HOST_API } from '@/constants/config'
import { replaceBase64WithUrl } from './shared'
import { fileData, fileFormat, fileThumb } from '@/components/file-thumbnail/utils'

type UploadFile = Array<File & { preview?: string }>

export interface EditorProps {
  value: string
  onChange?: (...event: any[]) => void
  error?: boolean
  helperText?: React.ReactNode
  sx?: SxProps<Theme>
  slotProps?: {
    Editor?: React.ComponentProps<typeof PrimeReactEditor>
    sx?: React.CSSProperties | undefined
  }
}

export const Editor = ({ value, error, helperText, slotProps, sx, onChange }: EditorProps) => {
  const handleEditorChange = async (event: EditorTextChangeEvent) => {
    const newContent = event.htmlValue || ''
    const updatedContent = await replaceBase64WithUrl(newContent)

    onChange?.(updatedContent)
  }

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const processFiles = async (filesDrop: UploadFile) => {
    const formData = new FormData()

    await Promise.all(
      filesDrop.map(async (file) => {
        const binaryData = await readFileAsArrayBuffer(file)
        const blob = new Blob([binaryData], { type: file.type })
        formData.append('files', blob, file.name)

        file.preview = URL.createObjectURL(file)
      })
    )

    const { data } = await axios.post<UploadFile>(endpoints.uploads.createUploads, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    onChange?.(
      `${value} ${data
        .map((file) => {
          const { path = '', preview = '', name } = fileData(file)
          const format = fileFormat(path || preview)

          const thumbnailURL = `${window.location.origin}${fileThumb(format)}`

          return `<a href="${HOST_API}${path}" target="_blank" rel="noopener noreferrer"><img src="${thumbnailURL}" alt="${name}" /></a>`
        })
        .join('\n')}`
    )
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files) {
      await processFiles(Array.from(files) as UploadFile)
    }
  }

  return (
    <>
      <StyledEditor
        sx={{
          ...(error && {
            border: (theme) => `solid 1px ${theme.palette.error.main}`,
            '& .ql-editor': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }),
          ...sx,
        }}
      >
        <StyledEditorToolbar>
          <PrimeReactEditor
            value={value}
            onTextChange={handleEditorChange}
            style={slotProps?.sx}
            headerTemplate={
              <Toolbar>
                <style>
                  {`
                    .KfQe9 {
                      border-radius: 4px;
                      padding: 4px;
                      margin-right: 8px;
                      display: flex;
                      align-items: center;
                      cursor: pointer;
                      "&:hover": {
                        color: #e0e0e0;
                      }
                    }
                  `}
                </style>
                <label htmlFor="file-upload" className="KfQe9">
                  <Iconify icon="mdi:upload" />
                </label>

                <input
                  type="file"
                  id="file-upload"
                  color="primary"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </Toolbar>
            }
            {...slotProps?.Editor}
          />
        </StyledEditorToolbar>
      </StyledEditor>

      {helperText && helperText}
    </>
  )
}
