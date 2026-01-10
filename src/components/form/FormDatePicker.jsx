// FormDatePicker - DatePicker reutilizável com React Hook Form
import { useFormContext, Controller } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { PickersDay } from '@mui/x-date-pickers/PickersDay'
import { styled } from '@mui/material/styles'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

// Estilo customizado para dias destacados
const HighlightedDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'isHighlighted',
})(({ theme, isHighlighted }) => ({
  ...(isHighlighted && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
}))

export default function FormDatePicker({ 
  name, 
  label, 
  required, 
  highlightStartDate, 
  highlightEndDate,
  ...props 
}) {
  const { control, formState: { errors } } = useFormContext()
  const isError = !!errors[name]
  const errorMessage = errors[name]?.message || ''

  // Função para verificar se um dia deve ser destacado
  const isDayHighlighted = (date) => {
    // Se não houver datas de destaque, não destacar nada
    if (!highlightStartDate || !highlightEndDate) return false
    
    // Validar se as datas são válidas
    const start = dayjs(highlightStartDate)
    const end = dayjs(highlightEndDate)
    
    if (!start.isValid() || !end.isValid()) return false
    
    const dayToCheck = dayjs(date)
    if (!dayToCheck.isValid()) return false
    
    return dayToCheck.isBetween(start, end, 'day', '[]')
  }

  // Renderizador customizado de dias
  const CustomDay = (props) => {
    const { day, ...other } = props
    const isHighlighted = isDayHighlighted(day)
    
    return (
      <HighlightedDay
        {...other}
        day={day}
        isHighlighted={isHighlighted}
      />
    )
  }

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
            value={field.value ? (dayjs.isDayjs(field.value) ? field.value : dayjs(field.value)) : null}
            onChange={(newValue) => {
              field.onChange(newValue)
            }}
            label={label}
            format="DD/MM/YYYY"
            slots={{
              day: CustomDay,
            }}
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

