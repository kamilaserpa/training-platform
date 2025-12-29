// Componente de Login - apenas para Owner
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const Login = () => {
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [error, setError] = useState('')
 const [loading, setLoading] = useState(false)
 const { signIn } = useAuth()
 const navigate = useNavigate()

 const handleSubmit = async (e) => {
   e.preventDefault()
   setError('')
   setLoading(true)

   console.log('🔐 [Login] Tentando fazer login com:', email)

   try {
     console.log('🔐 [Login] Chamando signIn...')
     const result = await signIn(email, password)
     console.log('✅ [Login] Login bem-sucedido!', result)

     // Redirecionar para a página inicial após login bem-sucedido
     console.log('🔀 [Login] Redirecionando para página inicial...')
     navigate('/')
   } catch (err) {
     console.error('❌ [Login] Erro no login:', err)
     console.error('   Mensagem:', err.message)
     console.error('   Código:', err.code)
     console.error('   Status:', err.status)
     setError(err.message || 'Erro ao fazer login')
   } finally {
     console.log('🔐 [Login] Definindo loading como false')
     setLoading(false)
   }
 }

 return (
   <div className="login-container">
     <div className="login-card">
       <h1>Login - Owner</h1>
       <p className="login-subtitle">Acesso exclusivo para edição de dados</p>

       <form onSubmit={handleSubmit}>
         <div className="form-group">
           <label htmlFor="email">Email</label>
           <input
             type="email"
             id="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             placeholder="seu@email.com"
           />
         </div>

         <div className="form-group">
           <label htmlFor="password">Senha</label>
           <input
             type="password"
             id="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
             placeholder="••••••••"
           />
         </div>

         {error && <div className="error-message">{error}</div>}

         <button type="submit" disabled={loading} className="login-button">
           {loading ? 'Entrando...' : 'Entrar'}
         </button>
       </form>

       <p className="visitor-note">
         Visitante? Você pode visualizar os dados sem fazer login.
       </p>
     </div>
   </div>
 )
}

export default Login
