// FerramentasWeb Landing Page Interactions

// Pix & Mercado Pago Configuration
const CONFIG = {
  paymentLinks: {
    Starter: "https://mpago.li/2RatC31",
    Pro: "https://mpago.li/2Bcs6g1",
    Scale: "https://mpago.li/1XirScg",
    "Vitalício Founder": "https://mpago.li/19CvBHE",
    Vitalicio: "https://mpago.li/19CvBHE"
  },
  whatsappNumber: "5511999999999",
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

// Plan Modal Logic
function openPlanModal(planName, price) {
  const modal = document.getElementById('checkout-modal');
  const badge = document.getElementById('modal-badge-plan');
  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const priceVal = document.getElementById('modal-price-val');
  const mpBtn = document.getElementById('modal-mp-btn');
  const unlockBtn = document.getElementById('modal-unlock-btn');
  const waLink = document.getElementById('modal-wa-link');

  badge.textContent = `Plano ${planName}`;
  title.textContent = `Ativação MeliSpy Pro • ${planName}`;
  desc.textContent = "Pagamento 100% seguro processado pelo Mercado Pago (Pix Imediato ou Cartão).";
  priceVal.textContent = `R$ ${price},00`;

  // Get link from CONFIG
  let mpUrl = CONFIG.paymentLinks[planName] || CONFIG.paymentLinks['Starter'];
  if (planName.toLowerCase().includes('vital')) {
    mpUrl = CONFIG.paymentLinks['Vitalício Founder'] || CONFIG.paymentLinks['Vitalicio'] || mpUrl;
  }

  if (mpBtn) {
    mpBtn.href = mpUrl;
    mpBtn.innerHTML = `
      <span>💳 Pagar R$ ${price},00 no Mercado Pago</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
    `;

    mpBtn.onclick = () => {
      const leadName = document.getElementById('modal-lead-name')?.value.trim() || 'Visitante Checkout';
      const leadPhone = document.getElementById('modal-lead-phone')?.value.trim() || '';
      const leadEmail = document.getElementById('modal-lead-email')?.value.trim() || '';

      if (window.supabaseClient) {
        window.supabaseClient.from('clientes_melispy').insert([{
          nome: leadName,
          whatsapp: leadPhone,
          email: leadEmail,
          plano: planName.toLowerCase(),
          status: 'iniciou_checkout',
          origem: 'modal_checkout'
        }]).then(() => console.log('[Supabase] Lead de checkout registrado com sucesso!'));
      }
    };
  }

  if (unlockBtn) {
    const slug = planName.toLowerCase().replace(/[^a-z]/g, '');
    unlockBtn.href = `sucesso.html?plan=${slug}&status=approved`;
  }

  if (waLink) {
    const message = encodeURIComponent(`Olá Mateus! Gostaria de tirar uma dúvida sobre o plano ${planName} do MeliSpy Pro.`);
    waLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
  }

  modal.classList.add('active');
}

function closePlanModal() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.remove('active');
}

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
});
