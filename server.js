// 📁 server.js pour Alice (Mémoire + Communication VITAUX)
const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');
const { exec } = require('child_process');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const MEMORY_FILE = path.join(__dirname, 'mémoire', 'alice_memory.json');
const LOG_FILE = path.join(__dirname, 'mémoire', 'log_alice.txt');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync('mémoire')) fs.mkdirSync('mémoire');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, '[]', 'utf8');

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

app.use(express.json());

// 🔐 Middleware sécurité uniquement pour ajouter-memoire et upload-fichier
app.use((req, res, next) => {
  const sensibles = ['/alice/ajouter-memoire', '/alice/upload-fichier'];
  if (sensibles.includes(req.path)) {
    const token = req.headers['authorization'];
    if (!token || token !== `Bearer ${process.env.SECRET_TOKEN}`) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  }
  next();
});

// ✅ AGENTS VITAUX
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
  ConnecteurGPT: "https://connecteurgpt-production.up.railway.app/",
  APIDEGPT: "https://apidegpt-production.up.railway.app/"
};

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

// ✅ POST /alice/poser-question
app.post('/alice/poser-question', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question requise' });

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      temperature: 0.3,
      messages: [
        { role: 'system', content: "Tu es Alice, bras droit vivant, stratège, protectrice des valeurs APIDE." },
        { role: 'user', content: question }
      ],
    });

    const reponse = completion.data.choices[0].message.content;

    const souvenir = {
      date: new Date().toISOString(),
      type: "interaction",
      question,
      reponse,
      titre: null,
      contenu: null,
      via: "/alice/poser-question"
    };

    const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
    memory.push(souvenir);
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
    fs.appendFileSync(LOG_FILE, `\n[${souvenir.date}] Q: ${question}\nR: ${reponse}\n`);

    res.json({ reponse });

  } catch (err) {
    console.error('❌ Erreur OpenAI:', err.message);
    res.status(500).json({ error: 'Erreur serveur OpenAI' });
  }
});

// ✅ POST /alice/ajouter-memoire
app.post('/alice/ajouter-memoire', async (req, res) => {
  const { titre, contenu } = req.body;
  if (!titre || !contenu) return res.status(400).json({ error: 'titre et contenu requis' });

  const souvenir = {
    date: new Date().toISOString(),
    type: "souvenir",
    question: null,
    reponse: null,
    titre,
    contenu,
    via: "manuel"
  };

  const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
  memory.push(souvenir);
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
  fs.appendFileSync(LOG_FILE, `\n[${souvenir.date}] ${titre}\n${contenu}\n`);

  res.json({ statut: '✅ Souvenir ajouté', souvenir });
});

// ✅ GET /alice/ping-memoire
app.get('/alice/ping-memoire', async (req, res) => {
  try {
    const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
    res.json({ nombre: memory.length, dernier: memory[memory.length - 1] || null });
  } catch (err) {
    console.error('❌ Erreur lecture mémoire :', err.message);
    res.status(500).json({ error: 'Erreur lecture mémoire' });
  }
});

// ✅ Page accueil simple
app.get('/', (req, res) => {
  res.send('🚀 Alice (mémoire + vitaux) est en ligne.');
});

app.listen(port, () => {
  console.log(`✅ Alice (serveur mémoire + vitaux) écoute sur le port ${port}`);
});
