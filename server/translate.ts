import type { Express } from "express";
import 'dotenv/config';

export function registerTranslationRoutes(app: Express) {
  const apiKey = process.env.DEEPL_API_KEY || '5341f2e7-d826-40d0-ae2d-611cf0d16fc0:fx';

  app.post('/api/translate', async (req, res) => {
    try {
      const { texts, target } = req.body as { texts: string[]; target: string };
      if (!Array.isArray(texts) || typeof target !== 'string') {
        return res.status(400).json({ message: 'Invalid request body' });
      }

      const params = new URLSearchParams();
      params.append('auth_key', apiKey);
      texts.forEach(t => params.append('text', t));
      params.append('target_lang', target.toUpperCase());

      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(500).json({ message: 'DeepL error', detail: errText });
      }

      const data = await response.json() as { translations: { text: string }[] };
      const translated: string[] = data.translations.map(t => t.text);
      res.json({ translations: translated });
    } catch (e: any) {
      console.error('Translation proxy error', e);
      res.status(500).json({ message: 'Proxy error', error: e.message });
    }
  });
} 