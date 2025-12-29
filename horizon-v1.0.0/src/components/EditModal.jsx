// Modal mobile-friendly para edição
import { useEffect } from 'react'
import TouchButton from './TouchButton'
import './EditModal.css'

const EditModal = ({ isOpen, onClose, title, children, onSave }) => {
  // Prevenir scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>{title}</h3>
          <button className="edit-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="edit-modal-body">
          {children}
        </div>
        
        <div className="edit-modal-footer">
          <TouchButton variant="ghost" onClick={onClose} fullWidth>
            Cancelar
          </TouchButton>
          <TouchButton variant="success" onClick={onSave} fullWidth>
            💾 Salvar
          </TouchButton>
        </div>
      </div>
    </div>
  )
}

export default EditModal

