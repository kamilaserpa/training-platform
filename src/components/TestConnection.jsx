// Componente de teste de conexão com Supabase
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TestConnection = () => {
 const [results, setResults] = useState([])
 const [testing, setTesting] = useState(false)

 const addResult = (message, type = 'info') => {
   setResults(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }])
   console.log(`[${type.toUpperCase()}] ${message}`)
 }

 const runTests = async () => {
   setTesting(true)
   setResults([])
  
   addResult('🧪 Iniciando testes de diagnóstico...', 'info')
  
   // Teste 1: Verificar variáveis de ambiente
   addResult('1️⃣ Verificando variáveis de ambiente...', 'info')
   const url = import.meta.env.VITE_SUPABASE_URL
   const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
   if (!url || url.includes('YOUR_')) {
     addResult('❌ VITE_SUPABASE_URL não configurado', 'error')
     setTesting(false)
     return
   }
   if (!key || key.includes('YOUR_')) {
     addResult('❌ VITE_SUPABASE_ANON_KEY não configurado', 'error')
     setTesting(false)
     return
   }
  
   addResult(`✅ URL`, 'success')
   addResult(`✅ KEY`, 'success')
  
   // Teste 2: Fetch básico
   addResult('2️⃣ Testando fetch básico...', 'info')
   try {
     const start = Date.now()
     const response = await fetch(url)
     const time = Date.now() - start
     addResult(`✅ Fetch básico OK (${time}ms)`, 'success')
   } catch (error) {
     addResult(`❌ Fetch básico falhou: ${error.message}`, 'error')
   }
  
   // Teste 3: REST API
   addResult('3️⃣ Testando REST API...', 'info')
   try {
     const start = Date.now()
     const response = await fetch(url + '/rest/v1/', {
       headers: {
         'apikey': key,
         'Authorization': 'Bearer ' + key
       }
     })
     const time = Date.now() - start
     addResult(`✅ REST API OK - Status ${response.status} (${time}ms)`, 'success')
   } catch (error) {
     addResult(`❌ REST API falhou: ${error.message}`, 'error')
   }
  
   // Teste 4: Auth Health
   addResult('4️⃣ Testando Auth API...', 'info')
   try {
     const start = Date.now()
     const response = await fetch(url + '/auth/v1/health', {
       headers: { 'apikey': key }
     })
     const time = Date.now() - start
     const health = await response.json()
     addResult(`✅ Auth API OK (${time}ms): ${JSON.stringify(health)}`, 'success')
   } catch (error) {
     addResult(`❌ Auth API falhou: ${error.message}`, 'error')
   }
  
   // Teste 5: getSession do Supabase
   addResult('5️⃣ Testando supabase.auth.getSession()...', 'info')
   try {
     const start = Date.now()
     const { data, error } = await supabase.auth.getSession()
     const time = Date.now() - start
     if (error) {
       addResult(`❌ getSession erro (${time}ms): ${error.message}`, 'error')
     } else {
       addResult(`✅ getSession OK (${time}ms) - ${data.session ? 'Com sessão' : 'Sem sessão'}`, 'success')
     }
   } catch (error) {
     addResult(`❌ getSession exception: ${error.message}`, 'error')
   }
  
   // Teste 6: Login de teste
   addResult('6️⃣ Testando login (você precisa substituir as credenciais)...', 'info')
   addResult('⚠️ Edite TestConnection.jsx e adicione email/senha real para testar login', 'warning')
  
   setTesting(false)
   addResult('🏁 Testes concluídos!', 'info')
 }

 useEffect(() => {
   // Roda automaticamente ao montar
   runTests()
 }, [])

 return (
   <div style={{
     position: 'fixed',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     background: 'rgba(0,0,0,0.95)',
     color: '#fff',
     zIndex: 9999,
     overflow: 'auto',
     padding: '20px',
     fontFamily: 'monospace',
     fontSize: '12px'
   }}>
     <h1 style={{ color: '#4ec9b0' }}>🧪 Teste de Conexão com Supabase</h1>
    
     <button
       onClick={runTests}
       disabled={testing}
       style={{
         padding: '10px 20px',
         background: testing ? '#666' : '#007acc',
         color: '#fff',
         border: 'none',
         borderRadius: '4px',
         cursor: testing ? 'not-allowed' : 'pointer',
         marginBottom: '20px'
       }}
     >
       {testing ? '⏳ Testando...' : '🔄 Executar Testes Novamente'}
     </button>

     <div style={{ background: '#1e1e1e', padding: '15px', borderRadius: '5px' }}>
       {results.map((result, index) => (
         <div
           key={index}
           style={{
             padding: '5px 0',
             borderLeft: `4px solid ${
               result.type === 'error' ? '#f48771' :
               result.type === 'success' ? '#4ec9b0' :
               result.type === 'warning' ? '#dcdcaa' :
               '#007acc'
             }`,
             paddingLeft: '10px',
             marginBottom: '5px'
           }}
         >
           <small style={{ color: '#666' }}>[{result.time}]</small> {result.message}
         </div>
       ))}
     </div>

     <div style={{ marginTop: '20px', padding: '15px', background: '#252526', borderRadius: '5px' }}>
       <h3 style={{ color: '#dcdcaa' }}>📋 Instruções:</h3>
       <ol style={{ lineHeight: '1.8' }}>
         <li>Execute os testes acima</li>
         <li>Se algum teste falhar em VERMELHO, há problema de conexão</li>
         <li>Verifique a aba Network (F12) enquanto testa</li>
         <li>No Supabase: Authentication → URL Configuration → Adicione http://localhost:5173</li>
         <li>No Supabase: Authentication → Providers → Email deve estar ENABLED</li>
       </ol>
     </div>

     <button
       onClick={() => window.location.reload()}
       style={{
         marginTop: '20px',
         padding: '10px 20px',
         background: '#666',
         color: '#fff',
         border: 'none',
         borderRadius: '4px',
         cursor: 'pointer'
       }}
     >
       ↻ Fechar e Recarregar
     </button>
   </div>
 )
}

export default TestConnection


