// Serveur simplifié pour GPTPortail
const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
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

// ✅ Nouvelle route /canal-vitaux pour recevoir des instructions
app.post('/canal-vitaux', (req, res) => {
  const { agent_cible, intention, contenu } = req.body;

  console.log(`✅ Requête reçue :\n  - Agent : ${agent_cible}\n  - Intention : ${intention}\n  - Contenu : ${contenu}`);

  res.json({
    résumé: `Message reçu pour ${agent_cible} avec l’intention : "${intention}".`,
  });
});

// ✅ Route de santé (ping)
app.get('/ping', (req, res) => {
  res.send({ message: 'GPTPortail en ligne' });
});

// ✅ Nouvelle route /poser-question
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
      messages: [
        { role: 'system', content: 'Tu es un assistant intelligent connecté à une mémoire.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const reponse = completion.data.choices[0].message.content;

    res.json({ reponse });

    // (Optionnel) Ajout de la réponse dans la mémoire
    // const updatedMemories = [...memories, reponse];
    // await fs.promises.writeFile(MEMORY_FILE, JSON.stringify(updatedMemories, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur ou OpenAI' });
  }
});

app.listen(port, () => {
  console.log(`GPTPortail actif sur le port ${port}`);
});
