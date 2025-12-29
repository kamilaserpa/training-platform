// Botão touch-friendly
import './TouchButton.css'

const TouchButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  icon = null,
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  className = ''
}) => {
  const classes = [
    'touch-button',
    `touch-button-${variant}`,
    `touch-button-${size}`,
    fullWidth && 'touch-button-full',
    icon && !children && 'touch-button-icon-only',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="touch-button-icon">{icon}</span>}
      {children && <span className="touch-button-text">{children}</span>}
    </button>
  )
}

export default TouchButton

