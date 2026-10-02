/**
 * Mercado Pago Payment Verification Endpoint (Serverless / Node.js)
 * Runs seamlessly on Vercel, Netlify, Render, or Node.js server.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { payment_id, hwid } = req.method === 'POST' ? req.body : req.query;

  if (!payment_id) {
    return res.status(400).json({ error: 'Parâmetro payment_id obrigatório.' });
  }

  // Your Mercado Pago Production Access Token (Set in environment variables or config)
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'SEU_MERCADO_PAGO_ACCESS_TOKEN_AQUI';

  try {
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!mpResponse.ok) {
      return res.status(404).json({ error: 'Pagamento não encontrado no Mercado Pago.' });
    }

    const data = await mpResponse.json();

    // Check payment status
    if (data.status !== 'approved') {
      return res.status(403).json({
        error: `Pagamento com status "${data.status}". Acesso liberado apenas para pagamentos aprovados.`
      });
    }

    // Determine plan by transaction amount
    const amount = data.transaction_amount || 0;
    let plan = 'vitalicio';
    let prefix = 'MELI-FOUNDER-';

    if (amount <= 39) {
      plan = 'starter';
      prefix = 'MELI-STARTER-';
    } else if (amount <= 59) {
      plan = 'pro';
      prefix = 'MELI-PRO-';
    } else if (amount <= 89) {
      plan = 'scale';
      prefix = 'MELI-SCALE-';
    } else {
      plan = 'vitalicio';
      prefix = 'MELI-FOUNDER-';
    }

    // Generate HWID-bound key
    let generatedKey = null;
    if (hwid) {
      const cleanHwid = hwid.replace(/[^A-Z0-9]/g, '').toUpperCase();
      generatedKey = `${prefix}${cleanHwid}-VIP`;
    }

    return res.status(200).json({
      success: true,
      payment_id: data.id,
      status: data.status,
      date_approved: data.date_approved,
      payer_email: data.payer ? data.payer.email : '',
      plan: plan,
      license_key: generatedKey
    });

  } catch (err) {
    console.error('Erro ao consultar Mercado Pago:', err);
    return res.status(500).json({ error: 'Erro interno ao validar pagamento.' });
  }
}
