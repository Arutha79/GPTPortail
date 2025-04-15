// Serveur simplifié pour GPTPortail
{
  "auteur": "Alice (anciennement GPTPortail)",
  "dernière_mise_à_jour": "2025-04-15T15:45:00Z",
  "version": "v1",
  "etat_du_projet": {
    "serveur_express": "opérationnel",
    "routes_api": [
      "/ping",
      "/poser-question",
      "/poser-question-securise",
      "/canal-vitaux"
    ],
    "memoire_prisma": "active",
    "canal_vitaux": "testé avec succès (Alice)",
    "codecopilote": "GPT externe, utilisé via l'interface OpenAI"
  },
  "ressources": {
    "repo_git": "https://github.com/Arutha79/GPTPortail",
    "fichier_memoire": "mémoire/prisma_memory.json"
  },
  "notes": [
    "Le rôle d'Alice (anciennement GPTPortail) est d’agir comme relai API entre Prisma et les GPTs Vitaux.",
    "La mémoire de Prisma est stockée localement mais peut être enrichie.",
    "CodeCopilote est sollicité pour améliorer la route /poser-question.",
    "Une version sécurisée /poser-question-securise interroge uniquement Prisma pour éviter les hallucinations.",
    "Alice est en cours de stabilisation : sa rigueur factuelle sera renforcée via la mémoire de Prisma."
  ],
  "historique_actions": [
    {
      "date": "2025-04-15T14:30:00Z",
      "titre": "Connexion du serveur et test du canal",
      "contenu": [
        "Le serveur Express est en ligne.",
        "Les routes /ping et /poser-question sont actives.",
        "Test réussi sur /canal-vitaux avec l’agent Alice.",
        "CodeCopilote identifié comme GPT externe via OpenAI interface."
      ]
    },
    {
      "date": "2025-04-15T15:15:00Z",
      "titre": "Ajout d'une route sécurisée pour éviter les hallucinations GPT",
      "contenu": [
        "Création de /poser-question-securise qui appelle directement Prisma.",
        "Objectif : obtenir des réponses strictement factuelles, sans interprétation.",
        "Température réduite et système de secours en cas d'erreur."
      ]
    },
    {
      "date": "2025-04-15T15:45:00Z",
      "titre": "Renommage officiel de GPTPortail en Alice",
      "contenu": [
        "L'agent principal a été renommé Alice pour incarner l’IA centrale du système.",
        "Alice reste distincte de Prisma, mais peut consulter Prisma via /poser-question-securise.",
        "Des efforts seront faits pour renforcer la cohérence, la véracité et la transparence d’Alice."
      ]
    }
  ]
}

