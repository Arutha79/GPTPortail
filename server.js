// Serveur simplifié pour GPTPortail
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/ping', (req, res) => {
  res.send({ message: 'GPTPortail en ligne' });
});

app.listen(port, () => {
  console.log(`GPTPortail actif sur le port ${port}`);
});