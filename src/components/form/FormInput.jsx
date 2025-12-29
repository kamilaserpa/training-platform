// FormInput - TextField reutilizável com React Hook Form
import { useFormContext, Controller } from 'react-hook-form'
import { TextField } from '@mui/material'

export default function FormInput({ name, label, required, ...props }) {
  const { control, formState: { errors } } = useFormContext()
  const isError = !!errors[name]
  const errorMessage = errors[name]?.message || ''

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <TextField
          {...field}
          label={label}
          fullWidth
          required={required}
          error={isError}
          helperText={errorMessage}
          {...props}
        />
      )}
    />
  )
}

