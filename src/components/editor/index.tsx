import { useState } from 'react'

import { Editor as PrimeReactEditor } from 'primereact/editor'

import { Theme, SxProps, alpha } from '@mui/material/styles'
import { StyledEditor, StyledEditorToolbar } from './styles'

export interface EditorProps {
  error?: boolean
  simple?: boolean
  helperText?: React.ReactNode
  sx?: SxProps<Theme>
}

export const Editor = ({ error, helperText, sx }: EditorProps) => {
  const [text, setText] = useState('')

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
            value={text}
            onTextChange={(e) => setText(e.htmlValue || '')}
            style={{ height: '320px' }}
          />
        </StyledEditorToolbar>
      </StyledEditor>

      {helperText && helperText}
    </>
  )
}
