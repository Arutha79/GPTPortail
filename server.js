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

// ✅ GPTs VITAUX (URLs de délégation depuis Alice)
const AGENTS_VITAUX = {
  PromptGPT: "https://promptgpt-production.up.railway.app/",
  SynthéPro: "https://synth-pro-production.up.railway.app/",
  BuilderGPT: "https://buildergpt-production.up.railway.app/",
  GPTClonerGPT: "https://gptclonergpt-production.up.railway.app/",
  SentinelleIA: "https://sentinelleia-production.up.railway.app/",
  CheckerGPT: "https://checkergpt-production.up.railway.app/",
  TextGPT: "https://textgpt-production-d174.up.railway.app/",
  DevGPT: "https://devgpt-production.up.railway.app/",
  ImageGPT: "https://imagegpt-production.up.railway.app/",
  MedecinGPT: "https://m-decingpt-production.up.railway.app/",
  MaintenanceGPT: "https://maintenancegpt-production.up.railway.app/",
  ForgeurGPT: "https://forgeurgpt-production.up.railway.app/",
  ZoranGPT: "https://zorangpt-production.up.railway.app/",
  ConnecteurGPT: "https://connecteurgpt-production.up.railway.app/"
};

// ✅ Canal pour dialogue avec d'autres agents
app.post('/canal-vitaux', async (req, res) => {
  const { agent_cible, intention, contenu } = req.body;
  const url = AGENTS_VITAUX[agent_cible];

  if (!url) return res.status(400).json({ erreur: `Agent cible inconnu : ${agent_cible}` });

  try {
    const response = await fetch(`${url}canal-reception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intention, contenu })
    });

    const data = await response.json();
    res.json({ statut: '✅ Message transmis', retour: data });
  } catch (err) {
    console.error(`❌ Erreur avec ${agent_cible} :`, err.message);
    res.status(500).json({ erreur: `Échec communication avec ${agent_cible}` });
  }
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
        { role: 'system', content: "Tu es Alice, l’orchestratrice centrale du Super Cerveau IA. Tu reçois des requêtes, identifies les agents concernés, délègues les tâches, et synthétises les retours. Tu es rigoureuse, factuelle, et tu ne fais rien à la place des GPTs métiers." },
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
    const response = await fetch('https://web-production-6594.up.railway.app/poser-question', {
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

// ✅ Ajout mémoire depuis Alice vers Prisma
app.post('/ajouter-memoire', async (req, res) => {
  const bloc = req.body;
  try {
    const response = await fetch('https://web-production-6594.up.railway.app/ajouter-memoire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bloc)
    });
    const data = await response.json();
    res.json({ statut: data.statut });
  } catch (err) {
    console.error('❌ Erreur ajout mémoire:', err.message);
    res.status(500).json({ error: 'Erreur de communication avec Prisma' });
  }
});

// ✅ Vérification interne de l'accessibilité d'Alice elle-même + enregistrement
app.get('/check-alice', async (req, res) => {
  try {
    const response = await fetch('https://gptportail-production.up.railway.app/poser-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Es-tu en ligne ?' })
    });

    if (!response.ok) {
      throw new Error(`Statut ${response.status}`);
    }

    const data = await response.json();

    const entry = {
      date: new Date().toISOString(),
      question: 'Es-tu en ligne ?',
      reponse: data.reponse,
      via: '/check-alice'
    };

    const memoryContent = await fs.promises.readFile(MEMORY_FILE, 'utf-8');
    const memoryJSON = JSON.parse(memoryContent);
    memoryJSON.push(entry);
    await fs.promises.writeFile(MEMORY_FILE, JSON.stringify(memoryJSON, null, 2), 'utf-8');

    res.json({ statut: '✅ Alice accessible', reponse: data.reponse });
  } catch (err) {
    console.error('❌ Alice inaccessible :', err.message);
    res.status(500).json({ erreur: 'Alice inaccessible' });
  }
});

app.get('/', (req, res) => {
  res.send('🚀 GPTPortail (Alice) est en ligne.');
});

app.listen(port, () => {
  console.log(`✅ Alice (anciennement GPTPortail) est en ligne sur le port ${port}`);
});
