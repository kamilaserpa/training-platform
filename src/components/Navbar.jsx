// Barra de navegação responsiva
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, signOut, isOwner, isViewer, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          💪 Treinos Online
        </Link>
        
        <div className="navbar-menu">
          {(isOwner || isViewer) && (
            <>
              <Link to="/" className="nav-link">Semanas</Link>
              <Link to="/treinos" className="nav-link">Treinos</Link>
              <Link to="/historico" className="nav-link">Histórico</Link>
            </>
          )}
          
          {isOwner && (
            <>
              <Link to="/exercicios" className="nav-link">Exercícios</Link>
              <Link to="/tipos-treino" className="nav-link">Tipos</Link>
              <Link to="/usuarios" className="nav-link">Usuários</Link>
            </>
          )}
          
          {isAuthenticated ? (
            <div className="navbar-user">
              {isViewer && (
                <span className="viewer-badge" title="Modo Visualização">
                  👁️ Visualização
                </span>
              )}
              <button onClick={handleLogout} className="nav-button">
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
