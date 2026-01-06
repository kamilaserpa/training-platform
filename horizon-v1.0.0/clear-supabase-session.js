
// Execute este código no console do navegador (F12)
console.log("🧹 Iniciando limpeza de sessão Supabase...");

// Função para limpar dados do Supabase
function clearSupabaseSession() {
    let cleared = 0;
    
    // Limpar localStorage
    const lsKeys = Object.keys(localStorage);
    const supabaseLsKeys = lsKeys.filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') ||
        key.includes('auth')
    );
    
    supabaseLsKeys.forEach(key => {
        localStorage.removeItem(key);
        cleared++;
        console.log(`✅ Removido localStorage: ${key}`);
    });
    
    // Limpar sessionStorage
    const ssKeys = Object.keys(sessionStorage);
    const supabaseSsKeys = ssKeys.filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') ||
        key.includes('auth')
    );
    
    supabaseSsKeys.forEach(key => {
        sessionStorage.removeItem(key);
        cleared++;
        console.log(`✅ Removido sessionStorage: ${key}`);
    });
    
    console.log(`🎉 Limpeza concluída! ${cleared} itens removidos.`);
    console.log("🔄 Recarregue a página para aplicar as mudanças.");
    
    return cleared;
}

// Executar limpeza
clearSupabaseSession();
