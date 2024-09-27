import { useFormContext, Controller } from 'react-hook-form'

import FormHelperText from '@mui/material/FormHelperText'

import { Editor, EditorProps } from '../editor'

type Props = Partial<EditorProps> & {
  name: string
}

export default function RHFEditor({ name, helperText, ...other }: Props) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Editor
          error={!!error}
          helperText={
            (!!error || helperText) && (
              <FormHelperText error={!!error} sx={{ px: 2 }}>
                {error ? error?.message : helperText}
              </FormHelperText>
            )
          }
          {...field}
          {...other}
        />
      )}
    />
  )
}
