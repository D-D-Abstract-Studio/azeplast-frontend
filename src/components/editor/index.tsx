import { useState } from 'react'
import { Editor as PrimeReactEditor } from 'primereact/editor'

import { Box } from '@mui/material'
import { Toolbar } from './toolbar'

import { Iconify } from '../iconify'

import { Theme, SxProps, alpha } from '@mui/material/styles'
import { processFiles } from './shared'

import { StyledEditor, StyledEditorToolbar } from './styles'

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
  const [mount, setMount] = useState(0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files) {
      await processFiles({ value, filesDrop: Array.from(files) as UploadFile, onChange })
    }

    setMount((prevState) => prevState + 1)
  }

  const uploadToolbar = (
    <Toolbar>
      <Box component="label" htmlFor="file-upload" sx={{ '&:hover': { color: 'primary.main' } }}>
        <Iconify icon="heroicons:paper-clip" />
      </Box>

      <input
        type="file"
        id="file-upload"
        color="primary"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </Toolbar>
  )

  return (
    <StyledEditor
      sx={{
        color: 'text.primary',
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
          key={mount}
          value={value}
          children={null}
          style={slotProps?.sx}
          headerTemplate={uploadToolbar}
          onTextChange={(event) => onChange?.(event.htmlValue)}
          {...slotProps?.Editor}
        />
      </StyledEditorToolbar>

      {helperText && helperText}
    </StyledEditor>
  )
}
