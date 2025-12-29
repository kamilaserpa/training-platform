// Componente principal da aplicação com rotas + Material UI
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import theme from './theme'
import Navbar from './components/Navbar'
import Login from './components/Login'
import DevModeAlert from './components/DevModeAlert'
import Semanas from './pages/Semanas'
import Treinos from './pages/Treinos'
import Historico from './pages/Historico'
import TreinoDetalhes from './pages/TreinoDetalhes'
import TreinoDetalhesForm from './pages/TreinoDetalhesForm'
import TreinoPublico from './pages/TreinoPublico'
import Exercicios from './pages/Exercicios'
import TiposTreino from './pages/TiposTreino'
import Usuarios from './pages/Usuarios'
import FormSemana from './pages/FormSemana'
import FormTreino from './pages/FormTreino'
import './App.css'

// Componente para proteger rotas que requerem autenticação (Owner ou Viewer)
const AuthenticatedRoute = ({ children }) => {
 const { isAuthenticated, loading } = useAuth()

 if (loading) {
   return <div className="loading">Carregando...</div>
 }

 if (!isAuthenticated) {
   return <Navigate to="/login" replace />
 }

 return children
}

// Componente para proteger rotas que requerem permissão de edição (apenas Owner)
const OwnerRoute = ({ children }) => {
 const { canEdit, loading } = useAuth()

 if (loading) {
   return <div className="loading">Carregando...</div>
 }

 if (!canEdit) {
   return <Navigate to="/" replace />
 }

 return children
}

function AppRoutes() {
 return (
   <Routes>
     <Route path="/login" element={<Login />} />
     <Route path="/treino-publico/:token" element={<TreinoPublico />} />

     {/* Rotas acessíveis para Owner e Viewer */}
     <Route
       path="/"
       element={
         <AuthenticatedRoute>
           <Semanas />
         </AuthenticatedRoute>
       }
     />
     <Route
       path="/treinos"
       element={
         <AuthenticatedRoute>
           <Treinos />
         </AuthenticatedRoute>
       }
     />
    <Route
      path="/treinos/:id"
      element={
        <AuthenticatedRoute>
          <TreinoDetalhes />
        </AuthenticatedRoute>
      }
    />
    <Route
      path="/treinos/form-demo"
      element={
        <AuthenticatedRoute>
          <TreinoDetalhesForm />
        </AuthenticatedRoute>
      }
    />
    <Route
      path="/historico"
      element={
        <AuthenticatedRoute>
          <Historico />
        </AuthenticatedRoute>
      }
    />

     {/* Rotas protegidas - apenas Owner (edição) */}
     <Route
       path="/exercicios"
       element={
         <OwnerRoute>
           <Exercicios />
         </OwnerRoute>
       }
     />
     <Route
       path="/tipos-treino"
       element={
         <OwnerRoute>
           <TiposTreino />
         </OwnerRoute>
       }
     />
     <Route
       path="/usuarios"
       element={
         <OwnerRoute>
           <Usuarios />
         </OwnerRoute>
       }
     />
     <Route
       path="/semanas/nova"
       element={
         <OwnerRoute>
           <FormSemana />
         </OwnerRoute>
       }
     />
     <Route
       path="/semanas/:id/editar"
       element={
         <OwnerRoute>
           <FormSemana />
         </OwnerRoute>
       }
     />
     <Route
       path="/treinos/novo"
       element={
         <OwnerRoute>
           <FormTreino />
         </OwnerRoute>
       }
     />
     <Route
       path="/treinos/:id/editar"
       element={
         <OwnerRoute>
           <FormTreino />
         </OwnerRoute>
       }
     />
   </Routes>
 )
}

function AppContent() {
  const location = useLocation()
  const isPublicRoute = location.pathname.includes('/treino-publico/')
  return (
    <div className="app">
      <DevModeAlert />
      {!isPublicRoute && <Navbar />}
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  )
}

function App() {
 return (
   <ThemeProvider theme={theme}>
     <CssBaseline />
     <AuthProvider>
       <BrowserRouter basename={import.meta.env.BASE_URL}>
         <AppContent />
       </BrowserRouter>
     </AuthProvider>
   </ThemeProvider>
 )
}

export default App
