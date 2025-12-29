// FormDatePicker - DatePicker reutilizável com React Hook Form
import { useFormContext, Controller } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/pt-br'

export default function FormDatePicker({ name, label, required, ...props }) {
  const { control, formState: { errors } } = useFormContext()
  const isError = !!errors[name]
  const errorMessage = errors[name]?.message || ''

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field }) => (
          <DatePicker
            fullWidth
            {...field}
            label={label}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                required: required,
                error: isError,
                helperText: errorMessage,
              },
            }}
            {...props}
          />
        )}
      />
    </LocalizationProvider>
  )
}

