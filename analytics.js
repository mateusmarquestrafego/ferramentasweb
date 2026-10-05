/**
 * FerramentasWeb • Sistema Oficial de Google Analytics 4 (GA4) & Remarketing
 * Tag Oficial: G-TEGVK3RZTJ
 * Funil de Eventos para Google Ads, Meta Ads e YouTube Ads Remarketing.
 */

(function () {
  'use strict';

  const GA_ID = 'G-TEGVK3RZTJ';

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
      try {
        sessionStorage.setItem('fw_utms', JSON.stringify(captured));
        localStorage.setItem('fw_utms_last', JSON.stringify(captured));
      } catch (e) {}
    }
  }

  function getStoredUtms() {
    try {
      const session = sessionStorage.getItem('fw_utms');
      if (session) return JSON.parse(session);
      const local = localStorage.getItem('fw_utms_last');
      if (local) return JSON.parse(local);
    } catch (e) {}
    return {};
  }

  parseUrlParams();
  const currentUtms = getStoredUtms();

  // 2. INICIALIZAÇÃO DO GOOGLE TAG (gtag.js)
  function initGA4() {
    if (window._ga4_initialized) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());

    const gaConfig = {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    };

    if (currentUtms.utm_source) gaConfig.campaign_source = currentUtms.utm_source;
    if (currentUtms.utm_medium) gaConfig.campaign_medium = currentUtms.utm_medium;
    if (currentUtms.utm_campaign) gaConfig.campaign_name = currentUtms.utm_campaign;
    if (currentUtms.utm_content) gaConfig.campaign_content = currentUtms.utm_content;
    if (currentUtms.utm_term) gaConfig.campaign_term = currentUtms.utm_term;

    gtag('config', GA_ID, gaConfig);

    // Carrega script oficial do Google se ainda não estiver no DOM
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    }

    window._ga4_initialized = true;
  }

  // DISPARO SEGURO DE EVENTOS GA4 PARA REMARKETING
  function trackEvent(eventName, eventParams = {}) {
    const fullParams = Object.assign({}, currentUtms, eventParams, {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title
    });

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, fullParams);
    }

    // Dispara também para Pixel / GTM se disponível
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...fullParams
      });
    }

    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
      console.log(`📊 [GA4 Remarketing Event] ${eventName}:`, fullParams);
    }
  }

  // 3. ENRIQUECEDOR DE LINKS COM UTMS
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

  // Enriquece WhatsApp com tag de origem
  function enrichWhatsAppUrl(originalUrl, defaultContext = 'Site') {
    try {
      const url = new URL(originalUrl);
      const currentText = url.searchParams.get('text') || '';

      const sourceTag = currentUtms.utm_source
        ? `[Origem: ${currentUtms.utm_source} • ${currentUtms.utm_medium || 'social'} | Campanha: ${currentUtms.utm_campaign || 'geral'}]`
        : `[Origem: ${defaultContext}]`;

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

  // 4. SISTEMA DE EVENTOS DE REMARKETING AUTOMÁTICO (ENGAJAMENTO & FUNIL)
  function initRemarketingListeners() {
    // A. Tempo de Permanência no Site (15s, 30s, 60s, 120s)
    [15, 30, 60, 120].forEach(seconds => {
      setTimeout(() => {
        trackEvent('time_on_page', {
          duration_seconds: seconds,
          audience_tier: seconds >= 60 ? 'high_intent' : 'medium_intent'
        });
      }, seconds * 1000);
    });

    // B. Profundidade de Scroll (25%, 50%, 75%, 90%)
    const scrollTiers = { 25: false, 50: false, 75: false, 90: false };
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const b = document.body;
      const st = 'scrollTop';
      const sh = 'scrollHeight';
      const percent = Math.round(((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100);

      [25, 50, 75, 90].forEach(mark => {
        if (percent >= mark && !scrollTiers[mark]) {
          scrollTiers[mark] = true;
          trackEvent('scroll_depth', {
            depth_percent: mark,
            audience_tier: mark >= 75 ? 'deep_reader' : 'engaged_visitor'
          });
        }
      });
    }, { passive: true });

    // C. Visualização de Seções Críticas (Tabela de Preços e Simulador)
    if ('IntersectionObserver' in window) {
      const sections = [
        { id: 'precos', event: 'view_pricing_section' },
        { id: 'demo', event: 'view_simulator_section' },
        { id: 'faq', event: 'view_faq_section' }
      ];

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const match = sections.find(s => s.id === entry.target.id);
            if (match) {
              trackEvent(match.event, {
                section: match.id,
                audience_tier: match.id === 'precos' ? 'pricing_viewer' : 'feature_explorer'
              });
              observer.unobserve(entry.target); // dispara 1x por seção
            }
          }
        });
      }, { threshold: 0.3 });

      sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      });
    }

    // D. Links de Checkout do Mercado Pago
    document.querySelectorAll('a[href*="mpago.li"]').forEach(link => {
      const originalHref = link.getAttribute('href');
      link.href = appendUtmsToUrl(originalHref, { utm_medium: 'checkout_link' });

      link.addEventListener('click', () => {
        const planName = link.dataset.plan || 'MeliSpy Pro Vitalício';
        trackEvent('begin_checkout', {
          item_name: planName,
          value: planName.includes('105') ? 105.00 : 119.00,
          currency: 'BRL',
          outbound_url: link.href,
          audience_tier: 'cart_abandoner_ready'
        });
      });
    });

    // E. Links de WhatsApp
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      const originalHref = link.getAttribute('href');
      const pageContext = window.location.pathname.includes('bio') ? 'Bio Instagram' : 'Landing Page';
      link.href = enrichWhatsAppUrl(originalHref, pageContext);

      link.addEventListener('click', () => {
        trackEvent('contact', {
          method: 'WhatsApp',
          link_id: link.id || 'whatsapp_cta',
          audience_tier: 'lead_hot_contact'
        });
      });
    });

    // F. Links da Bio para o Site Oficial
    document.querySelectorAll('a[href*="ferramentasweb"]').forEach(link => {
      if (link.hostname !== window.location.hostname || link.pathname !== window.location.pathname) {
        link.href = appendUtmsToUrl(link.getAttribute('href'), {
          utm_source: currentUtms.utm_source || 'bio',
          utm_medium: currentUtms.utm_medium || 'bio_hub'
        });
      }
    });

    // G. Cliques nos cards futuros do Studio (ShopeeSpy, RespondeFácil)
    document.querySelectorAll('.upcoming-card').forEach(card => {
      card.addEventListener('click', () => {
        const title = card.querySelector('.link-title')?.textContent.trim() || 'Ferramenta Futura';
        trackEvent('interest_future_product', {
          product_name: title,
          audience_tier: 'early_adopter'
        });
      });
    });

    // H. Rastrear cliques gerais com data-track
    document.querySelectorAll('[data-track]').forEach(el => {
      el.addEventListener('click', () => {
        trackEvent('cta_click', {
          action: el.getAttribute('data-track'),
          text: (el.textContent || '').trim().slice(0, 50)
        });
      });
    });
  }

  // Inicialização
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initGA4();
      initRemarketingListeners();
    });
  } else {
    initGA4();
    initRemarketingListeners();
  }

  // Exportação global
  window.FW_TRACKING = {
    gaId: GA_ID,
    getUtms: getStoredUtms,
    appendUtms: appendUtmsToUrl,
    enrichWhatsApp: enrichWhatsAppUrl,
    trackEvent: trackEvent
  };

})();
