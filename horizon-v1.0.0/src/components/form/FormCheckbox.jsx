// FormCheckbox - Checkbox reutilizável com React Hook Form
import { useFormContext, Controller } from 'react-hook-form'
import { FormControlLabel, Checkbox } from '@mui/material'

export default function FormCheckbox({ name, label, ...props }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={false}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              {...field}
              checked={field.value}
              {...props}
            />
          }
          label={label}
        />
      )}
    />
  )
}

