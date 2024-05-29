import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import { Controller, useFormContext } from 'react-hook-form'
import dayjs from 'dayjs'

interface RHFDatePikerProps<T> {
  name: Extract<keyof T, string>
  error?: boolean
  label: string
  helperText?: string
}

export const RHFDatePiker = <T,>({
  name,
  label,
  error,
  helperText,
  ...rest
}: RHFDatePikerProps<T>) => {
  const { control } = useFormContext()

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <DatePicker
            value={value ? dayjs(value) : null}
            onChange={onChange}
            label={label || name}
            slotProps={{
              actionBar: {
                actions: ['today', 'accept'],
              },
              textField: {
                error: error,
                helperText: helperText,
              },
            }}
            {...rest}
          />
        )}
      />
    </LocalizationProvider>
  )
}
