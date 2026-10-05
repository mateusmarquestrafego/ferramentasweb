/**
 * FerramentasWeb • Sistema Unificado de Analytics & Rastreamento de UTMs
 * Rastreia: Google Analytics 4 (GA4), UTMs de campanhas (Reels, Shorts, TikTok, Facebook),
 * cliques de conversão, checkout Mercado Pago e origem no WhatsApp.
 */

(function () {
  'use strict';

  // Configuração padrão (substitua pelo seu ID do Google Analytics 4 se já tiver)
  // Exemplo: 'G-XXXXXXXXXX'
  const DEFAULT_GA_ID = window.GA_MEASUREMENT_ID || 'G-Z1G9R09G89'; // ID padrão / placeholder editável

  // 1. CAPTURADOR E PERSISTÊNCIA DE UTMS
  const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'fbclid', 'gclid', 'ttclid'];

  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const captured = {};
    let hasUtm = false;

    UTM_PARAMS.forEach(key => {
      const val = params.get(key);
      if (val) {
        captured[key] = val.trim();
        hasUtm = true;
      }
    });

    if (hasUtm) {
      // Salva no sessionStorage (sessão atual) e localStorage (retenção pós-navegação)
      try {
        sessionStorage.setItem('fw_utms', JSON.stringify(captured));
        localStorage.setItem('fw_utms_last', JSON.stringify(captured));
      } catch (e) {
        // Storage inacessível em modo restrito
      }
    }
  }

  function getStoredUtms() {
    try {
      const session = sessionStorage.getItem('fw_utms');
      if (session) return JSON.parse(session);
      const local = localStorage.getItem('fw_utms_last');
      if (local) return JSON.parse(local);
    } catch (e) {
      // ignore
    }
    return {};
  }

  // Executa captura imediata ao carregar o script
  parseUrlParams();
  const currentUtms = getStoredUtms();

  // 2. INICIALIZAÇÃO DO GOOGLE ANALYTICS 4 (gtag.js)
  function initGA4() {
    const gaId = window.GA_MEASUREMENT_ID || DEFAULT_GA_ID;

    // Se já foi carregado, não recarrega
    if (window._ga4_initialized) return;

    // Cria dataLayer e função gtag global
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());

    // Configuração com UTMs capturados
    const gaConfig = {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    };

    if (currentUtms.utm_source) gaConfig.campaign_source = currentUtms.utm_source;
    if (currentUtms.utm_medium) gaConfig.campaign_medium = currentUtms.utm_medium;
    if (currentUtms.utm_campaign) gaConfig.campaign_name = currentUtms.utm_campaign;
    if (currentUtms.utm_content) gaConfig.campaign_content = currentUtms.utm_content;
    if (currentUtms.utm_term) gaConfig.campaign_term = currentUtms.utm_term;

    gtag('config', gaId, gaConfig);

    // Injeta script oficial do Google se for um ID válido
    if (gaId && gaId.startsWith('G-')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);
    }

    window._ga4_initialized = true;
  }

  // Disparo seguro de eventos para GA4 e console
  function trackEvent(eventName, eventParams = {}) {
    // Mescla com os UTMs ativos
    const fullParams = Object.assign({}, currentUtms, eventParams, {
      page_location: window.location.href,
      page_path: window.location.pathname
    });

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, fullParams);
    }

    // Armazena evento localmente para debug se necessário
    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
      console.log(`📊 [Analytics Event] ${eventName}:`, fullParams);
    }
  }

  // 3. ENRIQUECEDOR DE LINKS COM UTMS (OUTBOUND LINKS & CHECKOUT)
  function appendUtmsToUrl(urlStr, extraParams = {}) {
    try {
      const url = new URL(urlStr, window.location.origin);
      const combined = Object.assign({}, currentUtms, extraParams);

      Object.keys(combined).forEach(k => {
        if (combined[k] && !url.searchParams.has(k)) {
          url.searchParams.set(k, combined[k]);
        }
      });

      return url.toString();
    } catch (e) {
      return urlStr;
    }
  }

  // Enriquece mensagens de WhatsApp com tag de origem
  function enrichWhatsAppUrl(originalUrl, defaultContext = 'Site') {
    try {
      const url = new URL(originalUrl);
      const currentText = url.searchParams.get('text') || '';

      const sourceTag = currentUtms.utm_source
        ? `[Origem: ${currentUtms.utm_source} • ${currentUtms.utm_medium || 'social'} | Campanha: ${currentUtms.utm_campaign || 'geral'}]`
        : `[Origem: ${defaultContext}]`;

      // Evita duplicar a tag se já foi adicionada
      if (!currentText.includes('[Origem:')) {
        const separator = currentText ? '\n\n' : '';
        const newText = `${currentText}${separator}${sourceTag}`;
        url.searchParams.set('text', newText);
      }

      return url.toString();
    } catch (e) {
      return originalUrl;
    }
  }

  // 4. ATUALIZAR TODOS OS LINKS DA PÁGINA (DOM LISTENER)
  function decorateActionLinks() {
    // A. Links do Mercado Pago (Checkout)
    document.querySelectorAll('a[href*="mpago.li"]').forEach(link => {
      const originalHref = link.getAttribute('href');
      link.href = appendUtmsToUrl(originalHref, { utm_medium: 'checkout_link' });

      link.addEventListener('click', () => {
        trackEvent('begin_checkout', {
          item_name: link.dataset.plan || 'MeliSpy Pro',
          currency: 'BRL',
          outbound_url: link.href
        });
      });
    });

    // B. Links de WhatsApp
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      const originalHref = link.getAttribute('href');
      const pageContext = window.location.pathname.includes('bio') ? 'Bio Instagram' : 'Landing Page';
      link.href = enrichWhatsAppUrl(originalHref, pageContext);

      link.addEventListener('click', () => {
        trackEvent('contact', {
          method: 'WhatsApp',
          link_id: link.id || 'whatsapp_cta',
          whatsapp_text: link.href
        });
      });
    });

    // C. Links da Página Bio para o Site Oficial
    document.querySelectorAll('a[href*="ferramentasweb"]').forEach(link => {
      if (link.hostname !== window.location.hostname || link.pathname !== window.location.pathname) {
        link.href = appendUtmsToUrl(link.getAttribute('href'), {
          utm_source: currentUtms.utm_source || 'bio',
          utm_medium: currentUtms.utm_medium || 'bio_hub'
        });
      }
    });

    // D. Rastrear cliques gerais com data-track
    document.querySelectorAll('[data-track]').forEach(el => {
      el.addEventListener('click', () => {
        trackEvent('cta_click', {
          action: el.getAttribute('data-track'),
          text: (el.textContent || '').trim().slice(0, 50)
        });
      });
    });
  }

  // Inicialização quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initGA4();
      decorateActionLinks();
    });
  } else {
    initGA4();
    decorateActionLinks();
  }

  // Exporta utilitários para uso global em scripts (ex: script.js)
  window.FW_TRACKING = {
    getUtms: getStoredUtms,
    appendUtms: appendUtmsToUrl,
    enrichWhatsApp: enrichWhatsAppUrl,
    trackEvent: trackEvent
  };

})();
