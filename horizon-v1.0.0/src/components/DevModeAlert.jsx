// Alerta visual quando em modo mock
import { USE_MOCK } from '../config/env'

export default function DevModeAlert() {
  // Só mostra em desenvolvimento local E quando USE_MOCK está ativo
  const isDev = import.meta.env.DEV
  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  
  if (!isDev || !isLocal || !USE_MOCK) return null

  return (
    <div style={{ 
      background: '#ff9800',
      color: '#fff',
      padding: '12px',
      textAlign: 'center',
      fontWeight: 600,
      zIndex: 9999,
      borderBottom: '3px solid #f57c00'
    }}>
      🔧 MODO MOCK ATIVO — Dados simulados — Login: qualquer email/senha
    </div>
  )
}

