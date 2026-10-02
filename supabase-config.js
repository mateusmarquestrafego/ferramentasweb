/**
 * FerramentasWeb • Configuração do Supabase
 * Cole abaixo a URL e a Anon Key do seu projeto Supabase (supabase.com)
 */

const SUPABASE_CONFIG = {
  // Projeto Supabase oficial FerramentasWeb
  url: 'https://acpatnmzqfmxfctozsbx.supabase.co',
  
  // Publishable Anon Key
  anonKey: 'sb_publishable_FXVh6a33Vh8tfG90im9eWg_3GkkvwRG'
};

// Inicializador Seguro
let supabaseClient = null;
try {
  if (window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.url.startsWith('https://') && !SUPABASE_CONFIG.url.includes('SEU_PROJETO')) {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    window.supabaseClient = supabaseClient;
    console.log('[Supabase] Conectado com sucesso!');
  }
} catch (e) {
  console.warn('[Supabase] Erro ao conectar:', e);
}
