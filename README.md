# 🤖 Alice – IA Centrale (ex GPTPortail)

Bienvenue dans **Alice**, le cerveau orchestrateur de ton écosystème GPT.
Développée en Node.js + Express, connectée à OpenAI et Prisma.

---

## 📦 Fonctionnalités principales

| Route                       | Description                                                   |
|----------------------------|---------------------------------------------------------------|
| `GET /ping`                | Vérifie si Alice est active                                   |
| `POST /poser-question`     | Pose une question à Alice (avec mémoire JSON locale)         |
| `POST /poser-question-securise` | Pose une question via Prisma (sécurisé)                  |
| `POST /canal-vitaux`       | Transmet une intention à un agent GPT externe                |
| `GET /check-alice`         | Vérifie si Alice est accessible publiquement + enregistre    |

---

## 📁 Fichiers importants

| Fichier                     | Rôle                                                           |
|----------------------------|----------------------------------------------------------------|
| `server.js`                | Serveur principal Alice                                        |
| `prisma_memory.json`       | Mémoire JSON locale d’Alice                                   |
| `.env`                     | Clé API OpenAI (`OPENAI_API_KEY`)                             |
| `openapi.yaml`             | Spécification OpenAI Action (connexion à GPTPortail)          |

---

## 🔐 Variables d’environnement

```env
OPENAI_API_KEY=sk-xxxxx
```

---

## 🚀 Déploiement

Déjà prêt sur [Railway](https://railway.app/), avec un endpoint public :
```
https://gptportail-production.up.railway.app
```

---

## 🔗 OpenAI Action (pour GPTPortail)

Ton GPT personnalisé (GPTPortail) peut appeler Alice via une [Action API](https://platform.openai.com/)

URL de schéma OpenAPI recommandé :
```
https://gptportail-production.up.railway.app/openapi.yaml
```

---

## ✨ Exemple d’appel API (POST)

```json
POST /poser-question
{
  "question": "Quelle est ta dernière réponse enregistrée ?"
}
```

---

## 👩‍💻 Auteur
Créé avec ❤️ par CodeCopilote & toi ✨
