// Componente Accordion mobile-first
import { useState } from 'react'
import './Accordion.css'

const Accordion = ({ 
  title, 
  children, 
  defaultOpen = false,
  disabled = false,
  badge = null,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Se disabled, sempre aberto
  if (disabled) {
    return (
      <div className={`accordion accordion-open ${className}`}>
        <div className="accordion-header">
          <h3 className="accordion-title">
            {title}
            {badge && <span className="accordion-badge">{badge}</span>}
          </h3>
        </div>
        <div className="accordion-content">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`accordion ${isOpen ? 'accordion-open' : ''} ${className}`}>
      <button 
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <h3 className="accordion-title">
          {title}
          {badge && <span className="accordion-badge">{badge}</span>}
        </h3>
        <span className="accordion-icon">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      
      {isOpen && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  )
}

export default Accordion

