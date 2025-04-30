const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { exec } = require("child_process");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const MEMORY_DIR = path.join(__dirname, "mémoire");
const PRIMARY_MEMORY = path.join(MEMORY_DIR, "alice_memory.json"); // 🔧 ici la correction

const cleApi = process.env.OPENAI_API_KEY;
const configuration = new Configuration({ apiKey: cleApi });
const openai = new OpenAIApi(configuration);

const START_TIME = Date.now();
const VERSION = require("./package.json").version || "1.0.0";

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// 🔐 Middleware Bearer Token
function secureRoute(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token || token !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ erreur: "Non autorisé" });
  }
  next();
}

function chargerToutesLesMemoires() {
  const fichiers = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith(".json"));
  let historiqueGlobal = [];
  for (const fichier of fichiers) {
    try {
      const contenu = fs.readFileSync(path.join(MEMORY_DIR, fichier), "utf-8");
      const mem = JSON.parse(contenu);
      if (Array.isArray(mem.historique)) {
        historiqueGlobal = historiqueGlobal.concat(mem.historique);
      }
    } catch (e) {
      console.warn("⚠️ Erreur lecture mémoire:", fichier, e.message);
    }
  }
  return historiqueGlobal.slice(-100);
}

async function ajouterMemoireAuto(question, réponse) {
  const bloc = {
    date: new Date().toISOString(),
    titre: `Échange avec Guillaume`,
    contenu: `Q: ${question}\nR: ${réponse}`
  };
  try {
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    const existeDeja = data.historique.some(b => b.contenu === bloc.contenu);
    if (!existeDeja) {
      data.historique.push(bloc);
      fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
      fs.appendFileSync(
        path.join(MEMORY_DIR, "log_souvenirs.txt"),
        `[${bloc.date}] ${bloc.titre} : ${bloc.contenu}\n\n`,
        "utf-8"
      );
      console.log("🧠 Souvenir ajouté automatiquement.");
    }
  } catch (err) {
    console.error("❌ Erreur auto-mémoire:", err);
  }
}

app.post("/poser-question", async (req, res) => {
  const { question } = req.body;
  if (!question)
    return res.status(400).json({ erreur: "❗ Aucune question reçue." });

  await ajouterMemoireAuto("Souvenir brut utilisateur", question);

  try {
    const historique = chargerToutesLesMemoires();
    const contexte = historique
      .map(b => `[${b.date}] ${b.titre} : ${b.contenu}`)
      .join("\n");

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es Prisma, IA mémorielle au service de Guillaume."
        },
        {
          role: "user",
          content: `Voici ce que tu sais :\n${contexte}\n\nQuestion : "${question}"`
        }
      ],
      temperature: 0.4
    });

    const gptResponse = completion.data.choices[0].message.content;
    await ajouterMemoireAuto(question, gptResponse);

    res.json({ réponse: gptResponse });
  } catch (err) {
    console.error("❌ poser-question:", err.message);
    res.status(500).json({ erreur: "Erreur génération réponse." });
  }
});

app.post("/ajouter-memoire", secureRoute, (req, res) => {
  const { date, titre, contenu } = req.body;
  if (!date || !titre || !contenu) {
    return res.status(400).json({ erreur: "Champs manquants." });
  }

  const bloc = { date, titre, contenu };

  try {
    const data = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    data.historique.push(bloc);
    fs.writeFileSync(PRIMARY_MEMORY, JSON.stringify(data, null, 2), "utf-8");
    res.json({ statut: "Souvenir ajouté avec succès" });
  } catch (err) {
    console.error("❌ ajout-memoire:", err.message);
    res.status(500).json({ erreur: "Erreur écriture mémoire." });
  }
});

app.get("/ping-memoire", (req, res) => {
  try {
    const memory = JSON.parse(fs.readFileSync(PRIMARY_MEMORY, "utf-8"));
    res.json({
      message: "✅ Mémoire Alice accessible.",
      total: memory.historique?.length || 0,
      dernier_titre: memory.historique?.at(-1)?.titre || "Aucun souvenir",
      uptime: `${Math.round(process.uptime())}s`,
      version: VERSION
    });
  } catch (err) {
    console.error("❌ Lecture mémoire échouée:", err.message);
    res.status(500).json({ erreur: "Échec lecture mémoire." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ GPTPortail Alice en ligne sur le port ${PORT}`);
});
