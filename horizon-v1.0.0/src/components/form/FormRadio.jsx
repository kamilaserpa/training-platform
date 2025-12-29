// FormRadio - RadioGroup reutilizável com React Hook Form
import { useFormContext, Controller } from 'react-hook-form'
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material'

export default function FormRadio({ name, label, options, ...props }) {
  const { control } = useFormContext()

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <RadioGroup {...field} row {...props}>
            {options.map((item) => (
              <FormControlLabel
                key={item.value}
                value={item.value}
                control={<Radio />}
                label={item.label}
              />
            ))}
          </RadioGroup>
        )}
      />
    </FormControl>
  )
}

