import { Box, Typography } from '@mui/material'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  )
}

export default PageHeader
