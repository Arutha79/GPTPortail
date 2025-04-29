// 📁 server.js pour Alice (mémoire + clé API sécurisée)

const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 📚 Chemins fichiers
const MEMORY_FILE = path.join(__dirname, 'mémoire', 'alice_memory.json');
const LOG_FILE = path.join(__dirname, 'mémoire', 'log_alice.txt');

// 📂 Dossiers
if (!fs.existsSync('mémoire')) fs.mkdirSync('mémoire');
if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, JSON.stringify([]), 'utf8');

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

app.use(express.json());

// 🔐 Middleware sécurité : x-api-key obligatoire pour /ajouter-memoire
app.use((req, res, next) => {
  const protectedRoutes = ['/ajouter-memoire'];
  const apiKey = req.headers['x-api-key'];

  if (protectedRoutes.includes(req.path)) {
    if (!apiKey || apiKey !== process.env.SECRET_TOKEN) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  }
  next();
});

// ✅ POST /poser-question
app.post('/poser-question', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question requise.' });

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      temperature: 0.3,
      messages: [
        { role: 'system', content: "Tu es Alice, bras droit vivant, protectrice des valeurs APIDE." },
        { role: 'user', content: question }
      ],
    });

    const reponse = completion.data.choices[0].message.content;

    const souvenir = {
      date: new Date().toISOString(),
      type: "interaction",
      question,
      reponse,
      via: "/poser-question"
    };

    const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    memory.push(souvenir);
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
    fs.appendFileSync(LOG_FILE, `\n[${souvenir.date}] Q: ${question}\nR: ${reponse}\n`, 'utf8');

    res.json({ réponse: reponse });
  } catch (err) {
    console.error('❌ Erreur OpenAI:', err.message);
    res.status(500).json({ error: 'Erreur serveur OpenAI' });
  }
});

// ✅ POST /ajouter-memoire
app.post('/ajouter-memoire', (req, res) => {
  const { date, titre, contenu } = req.body;
  if (!date || !titre || !contenu) {
    return res.status(400).json({ error: 'Champs manquants: date, titre, contenu.' });
  }

  const souvenir = {
    date,
    type: "souvenir",
    titre,
    contenu,
    via: "manuel"
  };

  try {
    const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    memory.push(souvenir);
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
    fs.appendFileSync(LOG_FILE, `\n[${souvenir.date}] ${titre}\n${contenu}\n`, 'utf8');

    res.json({ statut: '✅ Souvenir ajouté', souvenir });
  } catch (err) {
    console.error('❌ Erreur enregistrement mémoire:', err.message);
    res.status(500).json({ error: 'Erreur serveur mémoire' });
  }
});

// ✅ GET /ping-memoire
app.get('/ping-memoire', (req, res) => {
  try {
    const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    res.json({
      message: "✅ Mémoire accessible.",
      total: memory.length,
      dernier_titre: memory[memory.length - 1]?.titre || "Aucun souvenir",
      uptime: process.uptime() + "s",
      version: "1.0.0"
    });
  } catch (err) {
    console.error('❌ Erreur lecture mémoire:', err.message);
    res.status(500).json({ error: 'Erreur lecture mémoire.' });
  }
});

// ✅ GET / (accueil)
app.get('/', (req, res) => {
  res.send('🚀 Alice est en ligne et opérationnelle.');
});

app.listen(port, () => {
  console.log(`✅ Alice serveur est en ligne sur le port ${port}`);
});
