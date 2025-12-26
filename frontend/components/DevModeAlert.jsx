import { DEV_MODE } from '../config'

export default function DevModeAlert() {
  if (!DEV_MODE) return null
  // Permitido apenas em localhost/127.0.0.1 para evitar produção/gh-pages
  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  
  if (isLocal) return (
    <div style={{ background:'#ff9800',color:'#fff',padding:'12px',textAlign:'center',fontWeight:600,zIndex:9999 }}>
      ⚠️ DEV MODE ATIVO — dados não são reais — Somente para desenvolvimento local.
    </div>
  )

  // Fora de localhost:
  return (
    <div style={{ background:'#f44336',color:'#fff',padding:'14px',textAlign:'center',fontWeight:700,zIndex:9999 }}>
      🚨 DEV MODE ATIVO FORA DE LOCALHOST! NUNCA USE EM PRODUÇÃO!
    </div>
  )
}

