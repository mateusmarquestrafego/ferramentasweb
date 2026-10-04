// FerramentasWeb Landing Page Interactions

// Pix & Mercado Pago Configuration
const CONFIG = {
  paymentLinks: {
    Starter: "https://mpago.la/1h2UTJS",
    Pro: "https://mpago.la/1juBHnz",
    Scale: "https://mpago.la/2xt2xPJ",
    "Vitalício Founder": "https://mpago.li/19CvBHE",
    Vitalício: "https://mpago.li/19CvBHE",
    Vitalicio: "https://mpago.li/19CvBHE",
    "Vitalício Desconto": "https://mpago.li/2GCdxVo",
    "Vitalício 105": "https://mpago.li/2GCdxVo",
    "105": "https://mpago.li/2GCdxVo",
    "Anual Founder": "https://mpago.li/19CvBHE",
    Anual: "https://mpago.li/19CvBHE"
  },
  whatsappNumber: "5548996192775",
  downloadZipUrl: "downloads/meli-spy-pro.zip"
};

// Helper to parse product name from any Mercado Livre URL slug
function parseMeliUrl(url) {
  let slug = '';
  const m1 = url.match(/MLB-?\d+-([a-zA-Z0-9_-]+)/i);
  const m2 = url.match(/mercadolivre\.com\.br\/([a-zA-Z0-9_-]+)\/p\//i);
  const m3 = url.match(/mercadolivre\.com\.br\/([a-zA-Z0-9_-]+)/i);

  if (m1) slug = m1[1];
  else if (m2) slug = m2[1];
  else if (m3 && !m3[1].includes('MLB')) slug = m3[1];
  else slug = 'Produto Analisado Mercado Livre';

  slug = slug.replace(/_JM.*$/, '').replace(/-/g, ' ').trim();
  if (slug.length < 3) slug = 'Produto Analisado';
  
  return slug
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Fill Demo Example
function fillDemoExample(url, title, price, cost, sold) {
  if (isSimulatorUsed()) {
    alert("Você já utilizou sua análise de teste gratuita.\n\nPara desbloquear o MeliSpy Pro ilimitado, escolha seu plano abaixo!");
    document.getElementById('precos').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  document.getElementById('demo-mlb-input').value = url;
  renderSimulatorData(title, price, cost, sold);
  markSimulatorAsUsed();
  lockSimulatorControls();
}

// Render Simulator Math
function renderSimulatorData(title, price, cost, sold) {
  const result = document.getElementById('demo-result');
  const loading = document.getElementById('demo-loading');

  const rev = price * sold;
  const fixedFee = price < 79 ? 6.00 : 0;
  const fee12 = price * 0.12;
  const tax = price * 0.04;
  const profit = price - cost - fee12 - fixedFee - tax;
  const marginPct = (profit / price) * 100;

  document.getElementById('demo-res-title').textContent = title.slice(0, 48) + (title.length > 48 ? '...' : '');
  document.getElementById('demo-res-price').textContent = price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('demo-res-sold').textContent = `${sold.toLocaleString('pt-BR')} un.`;
  document.getElementById('demo-res-rev').textContent = rev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  document.getElementById('demo-math-cost').textContent = cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('demo-math-fee').textContent = `- ${fee12.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  document.getElementById('demo-math-fixed').textContent = fixedFee > 0 ? `- R$ 6,00` : `R$ 0,00 (Acima de R$ 79)`;
  document.getElementById('demo-math-tax').textContent = `- ${tax.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  
  const profitEl = document.getElementById('demo-math-profit');
  profitEl.textContent = profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  profitEl.style.color = profit >= 0 ? '#34d399' : '#f87171';

  const marginEl = document.getElementById('demo-math-margin');
  marginEl.textContent = `(${marginPct.toFixed(1)}% margem líquida)`;
  marginEl.style.color = profit >= 0 ? '#6ee7b7' : '#f87171';

  loading.style.display = 'none';
  result.style.display = 'block';
}

// Live Simulator Run Logic
async function runLiveSimulator() {
  if (isSimulatorUsed()) {
    alert("Você já utilizou sua análise de teste gratuita neste computador.\n\nPara continuar utilizando sem limites, garanta sua licença oficial abaixo!");
    document.getElementById('precos').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const input = document.getElementById('demo-mlb-input').value.trim();
  const loading = document.getElementById('demo-loading');

  if (!input) {
    alert('Por favor, cole um link de produto do Mercado Livre.');
    return;
  }

  loading.style.display = 'block';

  // Extract clean title from URL slug
  const title = parseMeliUrl(input);

  // Generate realistic estimates based on item type or input
  let price = 49.90;
  let cost = 18.00;
  let sold = 4250;

  const lower = title.toLowerCase();
  if (lower.includes('processador') || lower.includes('triturador')) {
    price = 22.90; cost = 7.50; sold = 24810;
  } else if (lower.includes('suporte') || lower.includes('tv')) {
    price = 58.90; cost = 22.00; sold = 52100;
  } else if (lower.includes('tenis') || lower.includes('sapato') || lower.includes('sandalia')) {
    price = 89.90; cost = 34.00; sold = 8420;
  } else if (lower.includes('relogio') || lower.includes('smartwatch') || lower.includes('fone')) {
    price = 39.90; cost = 14.50; sold = 19300;
  } else if (lower.includes('garrafa') || lower.includes('copo') || lower.includes('stanley')) {
    price = 34.90; cost = 12.00; sold = 14200;
  } else {
    // Dynamic based on string length & hash so every unique link gets distinct numbers
    let hash = 0;
    for (let i = 0; i < input.length; i++) hash += input.charCodeAt(i);
    price = 39.90 + (hash % 120);
    cost = parseFloat((price * 0.38).toFixed(2));
    sold = 800 + (hash % 15000);
  }

  setTimeout(() => {
    renderSimulatorData(title, price, cost, sold);
    // Mark as used immediately in both localStorage and cookie
    markSimulatorAsUsed();
    lockSimulatorControls();
  }, 400);
}

// Check and manage persistent 1-time limit
function isSimulatorUsed() {
  return localStorage.getItem('fw_web_sim_used') === 'true' || 
         document.cookie.includes('fw_web_sim_used=true');
}

function markSimulatorAsUsed() {
  try {
    localStorage.setItem('fw_web_sim_used', 'true');
    document.cookie = "fw_web_sim_used=true; max-age=31536000; path=/";
  } catch (e) {}
}

function lockSimulatorControls() {
  const input = document.getElementById('demo-mlb-input');
  const btn = document.getElementById('demo-run-btn');
  const pills = document.querySelector('.demo-quick-pills');

  if (input) {
    input.disabled = true;
    input.placeholder = "🔒 Limite atingido: 1 teste gratuito já utilizado neste dispositivo.";
    input.classList.add('input-locked');
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "🔒 Teste Esgotado";
    btn.classList.add('btn-locked');
    btn.onclick = () => {
      alert("Você já utilizou sua análise de teste gratuita neste computador.\n\nPara desbloquear o MeliSpy Pro ilimitado, escolha seu plano abaixo!");
      document.getElementById('precos').scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Disable quick pills
  if (pills) {
    pills.style.opacity = '0.5';
    pills.style.pointerEvents = 'none';
  }

  // Insert lock notice if not already present
  if (!document.getElementById('demo-locked-notice')) {
    const notice = document.createElement('div');
    notice.id = 'demo-locked-notice';
    notice.className = 'demo-locked-banner';
    notice.innerHTML = `
      <span>🔒 <strong>Seu teste gratuito foi finalizado.</strong> Gostou dos dados? Para continuar analisando anúncios ilimitados direto na tela do Mercado Livre, adquira sua licença oficial abaixo:</span>
      <a href="#precos" class="btn btn-hero-full" style="max-width: 260px; padding: 10px 16px; font-size: 13px;">Garantir MeliSpy Pro (R$ 97)</a>
    `;
    const demoBox = document.querySelector('.demo-box');
    if (demoBox) {
      demoBox.appendChild(notice);
    }
  }
}

// On page load, check if user already burned their 1 test
document.addEventListener('DOMContentLoaded', () => {
  if (isSimulatorUsed()) {
    lockSimulatorControls();
  }
});

// Plan Modal Logic & Secure Lead Capture
let currentPlanData = { name: '', price: 0, mpUrl: '', slug: '' };

function openPlanModal(planName, price) {
  const modal = document.getElementById('checkout-modal');
  const badge = document.getElementById('modal-badge-plan');
  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const priceVal = document.getElementById('modal-price-val');
  const waLink = document.getElementById('modal-wa-link');

  // Reset steps
  const stepLead = document.getElementById('modal-step-lead');
  const stepConfirm = document.getElementById('modal-step-confirm');
  const leadErr = document.getElementById('modal-lead-error');
  const proofErr = document.getElementById('modal-proof-error');
  
  if (stepLead) stepLead.style.display = 'block';
  if (stepConfirm) stepConfirm.style.display = 'none';
  if (leadErr) leadErr.style.display = 'none';
  if (proofErr) proofErr.style.display = 'none';

  const isVitalicio = planName.toLowerCase().includes('vital') || planName.toLowerCase().includes('anual');
  const isMonthly = !isVitalicio;
  const mpBtn = document.getElementById('modal-mp-btn');

  if (isVitalicio) {
    badge.textContent = `Acesso Vitalício • ${planName}`;
    title.textContent = `Acesso Vitalício • ${planName}`;
    desc.textContent = "Pagamento único via Pix ou Cartão processado com segurança pelo Mercado Pago. Zero mensalidades, acesso permanente para sempre.";
    priceVal.textContent = `R$ ${price},00 (Pagamento Único)`;
    if (mpBtn) {
      mpBtn.querySelector('span').textContent = `👑 Garantir Vitalício por R$ ${price},00 no Mercado Pago`;
    }
  } else if (isMonthly) {
    badge.textContent = `Assinatura Mensal • ${planName}`;
    title.textContent = `Assinatura Recorrente • ${planName}`;
    desc.textContent = "Cobrança mensal no cartão processada com segurança pelo Mercado Pago. Cancele quando quiser com 1 clique.";
    priceVal.textContent = `R$ ${price},00/mês`;
    if (mpBtn) {
      mpBtn.querySelector('span').textContent = `💳 Assinar R$ ${price},00/mês no Mercado Pago`;
    }
  } else {
    badge.textContent = `Acesso Completo • ${planName}`;
    title.textContent = `Ativação MeliSpy Pro • ${planName}`;
    desc.textContent = "Pagamento processado com segurança pelo Mercado Pago.";
    priceVal.textContent = `R$ ${price},00`;
    if (mpBtn) {
      mpBtn.querySelector('span').textContent = `👑 Garantir Plano por R$ ${price},00 no Mercado Pago`;
    }
  }

  // Determine MP Url
  let mpUrl = CONFIG.paymentLinks[planName] || CONFIG.paymentLinks['Starter'];
  if (String(price) === '105' || String(planName).includes('105') || String(planName).includes('Desconto')) {
    mpUrl = "https://mpago.li/2GCdxVo";
  } else if (planName.toLowerCase().includes('vital') || planName.toLowerCase().includes('anual')) {
    mpUrl = CONFIG.paymentLinks['Vitalício Founder'] || CONFIG.paymentLinks['Vitalício'] || mpUrl;
  }
  const slug = planName.toLowerCase().replace(/[^a-z]/g, '');

  currentPlanData = { name: planName, price: price, mpUrl: mpUrl, slug: slug };

  if (waLink) {
    const message = encodeURIComponent(`Olá Mateus! Gostaria de tirar uma dúvida sobre o plano ${planName} do MeliSpy Pro.`);
    waLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
  }

  modal.classList.add('active');
}

function closePlanModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

// Global Modal Button Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const mpBtn = document.getElementById('modal-mp-btn');
  const unlockBtn = document.getElementById('modal-unlock-btn');
  const backBtn = document.getElementById('modal-back-btn');
  const leadErr = document.getElementById('modal-lead-error');
  const proofErr = document.getElementById('modal-proof-error');

  // Phone input auto-formatter (DDD)
  const phoneInput = document.getElementById('modal-lead-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) {
        e.target.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        e.target.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else {
        e.target.value = v;
      }
    });
  }

  // 1. Botão Pagar no Mercado Pago (Obrigatório preencher Nome, WhatsApp e Email)
  if (mpBtn) {
    mpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('modal-lead-name');
      const emailInput = document.getElementById('modal-lead-email');

      const name = nameInput ? nameInput.value.trim() : '';
      const rawPhone = phoneInput ? phoneInput.value.trim() : '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const email = emailInput ? emailInput.value.trim() : '';

      // Validação Estrita
      if (!name || name.length < 3) {
        leadErr.textContent = '⚠️ Por favor, digite seu Nome Completo para vincular sua garantia.';
        leadErr.style.display = 'block';
        if (nameInput) nameInput.focus();
        return;
      }

      if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
        leadErr.textContent = '⚠️ Por favor, digite um WhatsApp válido com DDD (Ex: 48 99619-2775).';
        leadErr.style.display = 'block';
        if (phoneInput) phoneInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        leadErr.textContent = '⚠️ Por favor, informe um endereço de e-mail válido.';
        leadErr.style.display = 'block';
        if (emailInput) emailInput.focus();
        return;
      }

      leadErr.style.display = 'none';

      // 2. Salvar Lead no Supabase
      if (window.supabaseClient) {
        window.supabaseClient.from('clientes_melispy').insert([{
          nome: name,
          whatsapp: cleanPhone,
          email: email,
          plano: currentPlanData.slug,
          status: 'iniciou_checkout',
          origem: 'modal_checkout'
        }]).then(({ error }) => {
          if (error) console.warn('[Supabase Lead Error]', error);
          else console.log('[Supabase] Lead cadastrado com sucesso!');
        });
      }

      // 3. Abrir Mercado Pago em nova aba
      window.open(currentPlanData.mpUrl, '_blank');

      // 4. Mudar visual do Modal para o Passo 2 (Confirmação do Comprovante)
      document.getElementById('modal-step-lead').style.display = 'none';
      document.getElementById('modal-step-confirm').style.display = 'block';
    });
  }

  // 2. Botão Validar Comprovante & Liberar Download
  if (unlockBtn) {
    unlockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const proofInput = document.getElementById('modal-proof-id');
      const proofVal = proofInput ? proofInput.value.trim() : '';

      if (!proofVal || proofVal.length < 4) {
        proofErr.textContent = '⚠️ Digite o número da operação ou comprovante do Mercado Pago para prosseguir.';
        proofErr.style.display = 'block';
        if (proofInput) proofInput.focus();
        return;
      }

      proofErr.style.display = 'none';

      const nameVal = document.getElementById('modal-lead-name')?.value.trim() || '';
      const rawPhone = document.getElementById('modal-lead-phone')?.value.trim() || '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const emailVal = document.getElementById('modal-lead-email')?.value.trim() || '';

      // Atualizar / Registrar no Supabase com comprovante
      if (window.supabaseClient) {
        window.supabaseClient.from('clientes_melispy').insert([{
          nome: nameVal,
          whatsapp: cleanPhone,
          email: emailVal,
          payment_id: proofVal,
          plano: currentPlanData.slug,
          status: 'comprovante_informado',
          origem: 'modal_confirmacao'
        }]).catch(err => console.warn(err));
      }

      // Redireciona com segurança para a página de sucesso
      const url = `sucesso.html?payment_id=${encodeURIComponent(proofVal)}&plan=${encodeURIComponent(currentPlanData.slug)}&status=approved&nome=${encodeURIComponent(nameVal)}&whatsapp=${encodeURIComponent(cleanPhone)}&email=${encodeURIComponent(emailVal)}`;
      window.location.href = url;
    });
  }

  // Botão Voltar para Alterar Dados
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('modal-step-confirm').style.display = 'none';
      document.getElementById('modal-step-lead').style.display = 'block';
    });
  }
});

// Copy Pix Key to Clipboard
function copyPixKey() {
  const pixField = document.getElementById('pix-key-field');
  const statusMsg = document.getElementById('copy-status-msg');

  pixField.select();
  pixField.setSelectionRange(0, 99999); // Mobile
  navigator.clipboard.writeText(pixField.value).then(() => {
    statusMsg.textContent = "✅ Chave Pix copiada com sucesso!";
    setTimeout(() => { statusMsg.textContent = ""; }, 3000);
  });
}

// Close Modal when clicking outside box
window.addEventListener('click', (e) => {
  const modal = document.getElementById('checkout-modal');
  if (e.target === modal) {
    closePlanModal();
  }
});

// FAQ Accordion Toggle
document.addEventListener('DOMContentLoaded', () => {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('active');
    });
  });

  // ==========================================
  // 1. COUNTDOWN TIMER (Gatilho de Urgência)
  // ==========================================
  let targetTime = localStorage.getItem('melispy_promo_end');
  const durationMs = 15 * 60 * 1000; // 15 minutos

  if (!targetTime || Date.now() > parseInt(targetTime, 10)) {
    targetTime = Date.now() + durationMs;
    localStorage.setItem('melispy_promo_end', targetTime.toString());
  } else {
    targetTime = parseInt(targetTime, 10);
  }

  function updateTimers() {
    let diff = targetTime - Date.now();
    if (diff <= 0) {
      targetTime = Date.now() + durationMs;
      localStorage.setItem('melispy_promo_end', targetTime.toString());
      diff = durationMs;
    }

    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');

    // Update Top Announcement Bar Timer
    const topEl = document.getElementById('top-countdown');
    if (topEl) topEl.textContent = `${mStr}:${sStr}`;

    // Update Pricing Card Timer
    const cdMin = document.getElementById('cd-minutes');
    const cdSec = document.getElementById('cd-seconds');
    if (cdMin) cdMin.textContent = mStr;
    if (cdSec) cdSec.textContent = sStr;
  }

  setInterval(updateTimers, 1000);
  updateTimers();

  // ==========================================
  // 2. EXIT INTENT POPUP (Pop-up de Retenção R$ 105)
  // ==========================================
  try {
    sessionStorage.removeItem('melispy_exit_shown');
  } catch(e) {}

  window.exitModalOpen = false;
  window.exitCooldown = false;

  window.openExitModal = function() {
    if (window.exitModalOpen || window.exitCooldown) return;
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal && checkoutModal.classList.contains('active')) return;

    const modal = document.getElementById('exit-modal');
    if (modal) {
      window.exitModalOpen = true;
      modal.classList.add('active');
    }
  };

  // Disparo 1: Mouse saindo pelo topo da janela (Padrão Ouro Exit-Intent Desktop)
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && (e.clientY <= 35 || e.pageY <= 35)) {
      window.openExitModal();
    }
  });

  // Disparo 2: Mouseleave no documento
  document.documentElement.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 40) {
      window.openExitModal();
    }
  });

  // Disparo 3: Tentativa de alternar de aba / fechar
  window.addEventListener('blur', () => {
    window.openExitModal();
  });

  // ==========================================
  // 3. LIVE SOCIAL PROOF TICKER
  // ==========================================
  const salesTicker = document.getElementById('sales-ticker');
  const tickerText = document.getElementById('ticker-text');
  const tickerTime = document.getElementById('ticker-time');

  const buyers = [
    { name: 'Rodrigo M.', city: 'São Paulo/SP', plan: 'Vitalício Founder', time: 'há 2 minutos' },
    { name: 'Camila B.', city: 'Belo Horizonte/MG', plan: 'Plano Scale', time: 'há 5 minutos' },
    { name: 'Rafael C.', city: 'Campinas/SP', plan: 'Vitalício Founder', time: 'há 9 minutos' },
    { name: 'Juliana S.', city: 'Curitiba/PR', plan: 'Plano Pro', time: 'há 12 minutos' },
    { name: 'Lucas F.', city: 'Rio de Janeiro/RJ', plan: 'Vitalício Founder', time: 'há 3 minutos' },
    { name: 'Felipe A.', city: 'Porto Alegre/RS', plan: 'Vitalício Founder', time: 'há 14 minutos' },
    { name: 'Mariana T.', city: 'Goiânia/GO', plan: 'Plano Scale', time: 'há 8 minutos' }
  ];

  let buyerIndex = 0;

  function cycleSalesTicker() {
    if (!salesTicker || !tickerText) return;

    const b = buyers[buyerIndex];
    buyerIndex = (buyerIndex + 1) % buyers.length;

    tickerText.innerHTML = `<strong>${b.name} (${b.city})</strong> acabou de ativar a licença <strong>${b.plan}</strong>!`;
    if (tickerTime) tickerTime.textContent = `${b.time} • Compra verificada`;

    salesTicker.classList.add('show');

    setTimeout(() => {
      salesTicker.classList.remove('show');
    }, 6000); // Exibe por 6 segundos
  }

  // Primeiro alerta aos 6 segundos de navegação
  setTimeout(() => {
    cycleSalesTicker();
    // Em seguida roda a cada 18 segundos
    setInterval(cycleSalesTicker, 18000);
  }, 6000);
});

// Exit Modal Functions
function closeExitModal() {
  const exitModal = document.getElementById('exit-modal');
  if (exitModal) {
    exitModal.classList.remove('active');
    window.exitModalOpen = false;
    window.exitCooldown = true;
    setTimeout(() => { window.exitCooldown = false; }, 10000);
  }
}

function claimExitDiscount() {
  closeExitModal();
  // Abre o checkout com o desconto exclusivo no Vitalício por R$ 105
  openPlanModal('Vitalício Founder (Desconto Exclusivo)', '105');
}

// Fechar exit modal ao clicar fora
window.addEventListener('click', (e) => {
  const exitModal = document.getElementById('exit-modal');
  if (e.target === exitModal) {
    closeExitModal();
  }
});

