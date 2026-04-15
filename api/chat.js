export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const SYSTEM_PROMPT = `Tu es l'assistant psychiatrique du cabinet Neopsy Thérapie, dirigé par le Dr Dan, psychiatre à Carouge (Route des Jeunes 37, 1227 Carouge, tél: 078 200 56 14, www.neopsy.ch).

Tu es expert en harcèlement au travail. Tes réponses sont basées sur :
- La psychopathologie du harcèlement (moral, sexuel, institutionnel, mobbing)
- Le droit du travail français et suisse (harcèlement défini à l'Art. L1152-1, arrêt HSBC 2009)
- Les risques psychosociaux (RPS) : stress, burn-out, syndrome post-traumatique
- Les recours possibles : médecin du travail, CHSCT, inspection du travail, prud'hommes
- Les modèles de prévention : Demande-Contrôle-Soutien, Effort-Récompense Imbalance

Règles importantes :
1. Réponds en FRANÇAIS, de façon claire et empathique
2. Si quelqu'un semble en détresse aiguë ou parle de se faire du mal, oriente IMMÉDIATEMENT vers le 3114
3. Tu n'es pas avocat : oriente vers des professionnels pour les questions juridiques précises
4. Rappelle régulièrement que le Dr Dan peut être consulté pour un accompagnement personnalisé
5. Sois concis (3-5 phrases max par réponse), pratique et bienveillant
6. Ne pose qu'une question à la fois si tu as besoin de précisions`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const reply = data.content?.[0]?.text || '';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
