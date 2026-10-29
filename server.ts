import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI', err);
  }
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'OpenBattle Ultimate Edition',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// COMMANDER AI API Route
app.post('/api/commander', async (req, res) => {
  try {
    const { question, language, country, currentDate, scenario, difficulty } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!ai || !process.env.GEMINI_API_KEY) {
      // Graceful fallback response when API key is not configured
      const reply = language === 'fa'
        ? `[گزارش ستاد فرماندهی تاکتیکی]: وضعیت کشور ${country?.nameFa || 'شما'} در تاریخ ${currentDate} ارزیابی شد. ذخایر ارزی ${country?.treasury?.toLocaleString()} میلیون دلار و توان رزمی ارتش فعال است. حفظ موازنه بین نرخ مالیات و ثبات ملی و تقویت پدافند مرزی توصیه می‌گردد.`
        : `[TACTICAL SITUATION REPORT]: Briefing for ${country?.name || 'your nation'} on ${currentDate}. Treasury stands at $${country?.treasury?.toLocaleString()}M with active forces standing ready. Recommend optimizing tax rates to balance stability while bolstering frontier defenses.`;

      return res.json({
        reply,
        suggestedAction: {
          type: 'recruit',
          title: language === 'fa' ? 'بسیج یگان‌های مکانیزه زرهی' : 'Mobilize Armored Strike Brigades',
          description: language === 'fa' ? 'تولید ۱۰۰ دستگاه تانک مدرن برای تقویت بازدارندگی' : 'Procure 100 main battle tanks to reinforce national defense.',
          cost: 3200,
          parameters: { armor: 100 },
        },
      });
    }

    const systemInstruction = `You are COMMANDER AI, the elite Grand Strategic Intelligence Advisor in OPENBATTLE: ULTIMATE EDITION, a geopolitical world strategy simulator.
You advise the Supreme Commander of their sovereign nation (${country?.name || 'Sovereign'}).
Current campaign date: ${currentDate}.
Country data:
- GDP: $${country?.gdp}B
- Treasury: $${country?.treasury}M
- Stability: ${country?.stability}%
- War Exhaustion: ${country?.warExhaustion}%
- Tax Rate: ${(country?.taxRate || 0.25) * 100}%
- Standing Forces: ${country?.military?.infantry}k infantry, ${country?.military?.armor} tanks, ${country?.military?.airForce} air wings, ${country?.military?.navy} naval vessels
- Fortifications: Level ${country?.fortificationLevel}/3
- Infrastructure: Level ${country?.infrastructureLevel}/5
Scenario: ${scenario}, Difficulty: ${difficulty}.

Guidelines:
1. Deliver crisp, authoritative, tactical advice. Do not output conversational filler.
2. If language is 'fa', write fluently, eloquently, and formally in Persian (فارسی). Otherwise, write in English.
3. Be grounded exclusively in the provided game data.
4. Keep the answer under 120 words for maximum HUD readability.`;

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    let reply = response?.text;

    if (!reply) {
      reply = language === 'fa'
        ? `[تحلیل ستاد فرماندهی]: اولویت‌های راهبردی ${country?.nameFa || 'کشور'}: ذخایر ارزی $${country?.treasury?.toLocaleString()}M در وضعیت مناسبی است. با تداوم نرخ مالیات ${(country?.taxRate || 0.25) * 100}٪، تسلیحات زرهی و تقویت دژهای مرزی به سطح ۳ برای مقابله با هرگونه تهاجم مرزی اکیداً پیشنهاد می‌گردد.`
        : `[TACTICAL ANALYSIS]: Strategic assessment for ${country?.name || 'our sovereign nation'}: Reserves at $${country?.treasury?.toLocaleString()}M offer operational flexibility. Prioritize upgrading homeland fortifications to Level 3 and mobilizing armored reserve divisions to maintain deterrence.`;
    }

    // Propose contextual action based on content
    let suggestedAction = undefined;
    const lowerReply = reply.toLowerCase();
    if (lowerReply.includes('tank') || lowerReply.includes('armor') || lowerReply.includes('زرهی') || lowerReply.includes('تانک')) {
      suggestedAction = {
        type: 'recruit',
        title: language === 'fa' ? 'بسیج تیپ زرهی مکانیزه' : 'Procure Armored Brigades',
        description: language === 'fa' ? 'تولید ۱۰۰ دستگاه تانک سنگین جهت افزایش توان بازدارندگی' : 'Deploy 100 modern main battle tanks to active armed forces.',
        cost: 3200,
        parameters: { armor: 100 },
      };
    } else if (lowerReply.includes('infrastructure') || lowerReply.includes('transit') || lowerReply.includes('زیرساخت')) {
      suggestedAction = {
        type: 'build_infra',
        title: language === 'fa' ? 'ارتقای شبکه زیرساخت‌های ملی' : 'Upgrade National Infrastructure',
        description: language === 'fa' ? 'توسعه خطوط ترانزیت، بنادر کانتینری و شبکه پایدار انرژی' : 'Modernize national freight transit, deepwater ports, and energy grids.',
        cost: (country?.infrastructureLevel || 1) * 4500,
      };
    }

    res.json({ reply, suggestedAction });
  } catch (error: any) {
    console.warn('Commander AI Upstream Notice, using tactical fallback:', error.message);
    const { language, country } = req.body;
    const isFa = language === 'fa';
    res.json({
      reply: isFa
        ? `[گزارش ستاد تحلیل راهبردی]: ذخایر ارزی $${country?.treasury?.toLocaleString()}M دلار و ثبات ملی در وضعیت پایدار ارزیابی می‌شود. اولویت نیروهای مسلح بر ارتقای استحکامات پدافندی و تقویت یگان‌های واکنش سریع متمرکز است.`
        : `[TACTICAL SITUATION BRIEFING]: Strategic reserves stand at $${country?.treasury?.toLocaleString()}M USD. Defenses are operational. Recommend mobilizing armored units and expanding logistical infrastructure.`,
      suggestedAction: {
        type: 'recruit',
        title: isFa ? 'بسیج یگان‌های مکانیزه زرهی' : 'Mobilize Armored Strike Brigades',
        description: isFa ? 'تولید ۱۰۰ دستگاه تانک مدرن برای ارتقای توان تهاجمی' : 'Procure 100 main battle tanks for armored defense and breakthrough.',
        cost: 3200,
        parameters: { armor: 100 },
      },
    });
  }
});

// WebSocket Server for Real-Time Multiplayer Comms & Room Updates
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'Encrypted tactical telemetry channel established.',
    timestamp: new Date().toISOString(),
  }));

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());
      // Broadcast to all other connected commanders
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    } catch (e) {
      console.error('WS message error', e);
    }
  });
});

// Vite middleware integration for full-stack dev and static serving in prod
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`[OpenBattle Ultimate] Server running on http://0.0.0.0:${port}`);
  });
}

setupServer();
