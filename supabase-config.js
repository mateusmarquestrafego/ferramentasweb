/**
 * FerramentasWeb • Configuração do Supabase
 * Cole abaixo a URL e a Anon Key do seu projeto Supabase (supabase.com)
 */

const SUPABASE_CONFIG = {
  // Exemplo: 'https://seuprojeto.supabase.co'
  url: 'https://SEU_PROJETO.supabase.co',
  
  // A chave pública anon do seu painel Supabase (Project Settings > API)
  anonKey: 'SUA_ANON_KEY_AQUI'
};

// Inicializador Seguro
let supabaseClient = null;
try {
  if (window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.url.startsWith('https://') && !SUPABASE_CONFIG.url.includes('SEU_PROJETO')) {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('[Supabase] Conectado com sucesso!');
  }
} catch (e) {
  console.warn('[Supabase] Aguardando preenchimento das credenciais no supabase-config.js');
}
