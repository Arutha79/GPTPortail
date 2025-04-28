// Serveur Alice (nouvelle version bras droit vivant)
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

// ✅ GPTs VITAUX (ajout d'APIDEGPT)
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

// ✅ Dialogue entre agents vitaux
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

// ✅ Nouveau poser-question avec filtrage intelligent
app.post('/poser-question', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question requise' });

  const motsTechniques = ['mémoire', 'API', 'OpenCutList', 'SketchUp', 'base de données', 'structure système', 'agent IA', 'prisma_memory'];
  const demandeTechnique = motsTechniques.some(mot => question.toLowerCase().includes(mot.toLowerCase()));

  if (demandeTechnique) {
    // Transmettre à Prisma si technique
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
  } else {
    // Sinon répondre directement avec ChatGPT
    try {
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        temperature: 0.3,
        messages: [
          { role: 'system', content: "Tu es Alice, bras droit vivant de Guillaume. Tu peux répondre directement aux questions culturelles, philosophiques, humaines. Tu respectes le souffle vivant APIDE : clarté, sobriété, fluidité." },
          { role: 'user', content: question }
        ],
      });

      const reponse = completion.data.choices[0].message.content;
      res.json({ reponse });
    } catch (err) {
      console.error('❌ Erreur OpenAI:', err.message);
      res.status(500).json({ error: 'Erreur serveur OpenAI' });
    }
  }
});

// ✅ Ajout de mémoire
app.post('/ajouter-memoire', async (req, res) => {
  const bloc = req.body;
  try {
    const memoryContent = await fs.promises.readFile(MEMORY_FILE, 'utf-8');
    const memoryJSON = JSON.parse(memoryContent);
    memoryJSON.push(bloc);
    await fs.promises.writeFile(MEMORY_FILE, JSON.stringify(memoryJSON, null, 2), 'utf-8');
    res.json({ statut: '✅ Mémoire ajoutée' });
  } catch (err) {
    console.error('❌ Erreur ajout mémoire :', err.message);
    res.status(500).json({ error: 'Erreur écriture mémoire' });
  }
});

// ✅ Page accueil simple
app.get('/', (req, res) => {
  res.send('🚀 Alice (bras droit vivant) est en ligne.');
});

app.listen(port, () => {
  console.log(`✅ Alice (vraie version bras droit vivant) est en ligne sur le port ${port}`);
});
