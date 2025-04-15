// Serveur simplifié pour GPTPortail
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.json());

// ✅ Nouvelle route /canal-vitaux pour recevoir des instructions
app.post('/canal-vitaux', (req, res) => {
  const { agent_cible, intention, contenu } = req.body;

  console.log(`✅ Requête reçue :
  - Agent : ${agent_cible}
  - Intention : ${intention}
  - Contenu : ${contenu}`);

  // Réponse simple
  res.json({
    résumé: `Message reçu pour ${agent_cible} avec l’intention : "${intention}".`,
  });
});

// Route de santé (ping)
app.get('/ping', (req, res) => {
  res.send({ message: 'GPTPortail en ligne' });
});

app.listen(port, () => {
  console.log(`GPTPortail actif sur le port ${port}`);
});
