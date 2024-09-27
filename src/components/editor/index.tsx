import { EditorTextChangeEvent, Editor as PrimeReactEditor } from 'primereact/editor'

import { Theme, SxProps, alpha } from '@mui/material/styles'
import { StyledEditor, StyledEditorToolbar } from './styles'

import { replaceBase64WithUrl } from './shared'
import { CSSProperties } from 'react'

export interface EditorProps {
  value: string
  onChange?: (...event: any[]) => void
  error?: boolean
  helperText?: React.ReactNode
  sx?: SxProps<Theme>
  slotProps?: {
    Editor?: React.ComponentProps<typeof PrimeReactEditor>
    sx?: CSSProperties | undefined
  }
}

export const Editor = ({ value, error, helperText, slotProps, sx, onChange }: EditorProps) => {
  const handleEditorChange = async (event: EditorTextChangeEvent) => {
    const editorContent = event.htmlValue

    const updatedContent = await replaceBase64WithUrl(editorContent)

    onChange?.(updatedContent)
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
            {...slotProps?.Editor}
          />
        </StyledEditorToolbar>
      </StyledEditor>

      {helperText && helperText}
    </>
  )
}
