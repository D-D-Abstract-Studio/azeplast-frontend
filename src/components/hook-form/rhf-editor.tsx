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
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        return (
          <Editor
            error={!!error}
            value={value}
            onChange={onChange}
            helperText={
              (!!error || helperText) && (
                <FormHelperText error={!!error} sx={{ px: 2 }}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        )
      }}
    />
  )
}
