export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const secret = process.env.TELEGRAM_NOTIFY_SECRET;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!secret || !token || !chatId) {
    return res.status(500).json({ ok: false, error: 'Telegram no configurado en el servidor' });
  }

  if (req.headers['x-bitacora-secret'] !== secret) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const body = req.body || {};
  const text = String(body.text || '').trim();

  if (!text || text.length > 4096) {
    return res.status(400).json({ ok: false, error: 'Mensaje inválido' });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return res.status(502).json({ ok: false, error: data.description || 'Telegram rechazó el mensaje' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error.message || 'Error enviando Telegram' });
  }
}
