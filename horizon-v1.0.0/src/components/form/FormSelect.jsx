// FormSelect - Select reutilizável com React Hook Form
import { useFormContext, Controller } from 'react-hook-form'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material'

export default function FormSelect({ name, label, options, required, ...props }) {
  const { control, formState: { errors } } = useFormContext()
  const isError = !!errors[name]
  const errorMessage = errors[name]?.message || ''

  return (
    <FormControl fullWidth error={isError}>
      <InputLabel id={`${name}-label`}>
        {label} {required && '*'}
      </InputLabel>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Select
            {...field}
            labelId={`${name}-label`}
            label={label}
            {...props}
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {options.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      {isError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  )
}

