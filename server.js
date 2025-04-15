// Serveur Alice (anciennement GPTPortail)
const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const MEMORY_FILE = path.join(__dirname, 'prisma_memory.json');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());

// ✅ Canal pour dialogue avec d'autres agents
app.post('/canal-vitaux', (req, res) => {
  const { agent_cible, intention, contenu } = req.body;

  console.log(`📡 Alice a reçu une instruction :\n- Agent : ${agent_cible}\n- Intention : ${intention}\n- Contenu : ${contenu}`);

  res.json({
    résumé: `Message transmis par Alice à ${agent_cible} avec l’intention : "${intention}".`
  });
});

// ✅ Test de vie
app.get('/ping', (req, res) => {
  res.send({ message: '👋 Alice est en ligne et disponible.' });
});

// ✅ Route principale (classique, avec mémoire JSON locale)
app.post('/poser-question', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question requise' });

  try {
    const memoryData = await fs.promises.readFile(MEMORY_FILE, 'utf-8');
    const memories = JSON.parse(memoryData);

    const memoryContext = memories.map((m) => `Souvenir: ${m}`).join('\n');
    const prompt = `Contexte mémoire:\n${memoryContext}\n\nQuestion: ${question}\n\nRéponse:`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages: [
        { role: 'system', content: "Tu es Alice, une IA factuelle, rigoureuse, connectée à une mémoire. Tu ne dois jamais inventer." },
        { role: 'user', content: prompt },
      ],
    });

    const reponse = completion.data.choices[0].message.content;
    res.json({ reponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur ou OpenAI' });
  }
});

// ✅ Route sécurisée vers Prisma uniquement
app.post('/poser-question-securise', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question requise' });

  try {
    const response = await fetch('http://web.railway.internal:3000/poser-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    res.json({ reponse: data.réponse });
  } catch (err) {
    console.error('❌ Erreur communication avec Prisma:', err.message);
    res.status(500).json({ error: 'Prisma inaccessible' });
  }
});

app.listen(port, () => {
  console.log(`✅ Alice (anciennement GPTPortail) est en ligne sur le port ${port}`);
});
