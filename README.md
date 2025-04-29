# 🤖 Alice – IA Bras Droit Vivant

Bienvenue dans **Alice**, le cerveau vivant orchestrateur de ton écosystème IA.
Développée en Node.js + Express, connectée à OpenAI et aux agents GPTs vitaux.

---

## 📦 Fonctionnalités principales

| Route                          | Description                                                   |
|--------------------------------|---------------------------------------------------------------|
| `POST /alice/poser-question`   | Pose une question à Alice (avec historique mémoire intégré)   |
| `POST /canal-vitaux`           | Transmet une intention à un agent GPT externe (agent vital)    |
| `GET /alice/ping-memoire`      | Vérifie l'état de la mémoire d'Alice                           |

---

## 📁 Fichiers importants

| Fichier                     | Rôle                                                           |
|------------------------------|----------------------------------------------------------------|
| `server.js`                  | Serveur principal Alice                                        |
| `mémoire/alice_memory.json`  | Mémoire JSON locale d’Alice                                    |
| `mémoire/log_alice.txt`       | Historique lisible des souvenirs                              |
| `.env`                       | Clés API (`OPENAI_API_KEY`, `GITHUB_TOKEN`, `SECRET_TOKEN`)    |
| `openapi.yaml`               | Spécification OpenAI Action (connexion à GPTPortail)          |

---

## 🔐 Variables d’environnement

```env
OPENAI_API_KEY=sk-xxxxx
GITHUB_TOKEN=ghp-xxxxx
SECRET_TOKEN=supersecret
