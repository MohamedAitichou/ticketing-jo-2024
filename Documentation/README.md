# 📁 Documentation – Billetterie JO 2024

Ce dossier regroupe l’ensemble des éléments de **documentation technique et fonctionnelle** du projet de billetterie développé dans le cadre du **Bloc 3 – Développement d’une application web complète (Studi)**.

Il a pour objectif d’assurer la **traçabilité**, la **compréhension technique** et la **validation du modèle de données** du projet.

---

## 📘 Contenu du dossier

| Fichier | Description |
|----------|-------------|
| `MCD_Billetterie.drawio` | Schéma du **Modèle Conceptuel de Données (MCD)** au format éditable. |
| `MCD_Billetterie.png` | Export du MCD au format image pour consultation rapide. |
| `Bloc3.pdf` *(facultatif)* | Notes et développement du projet complet. |

---

## 🧠 Objectif du MCD

Le **Modèle Conceptuel de Données** décrit la structure logique de la base de données du projet.  
Il met en évidence les entités principales et leurs relations :

- 👤 **Utilisateur** → Peut avoir un ou plusieurs rôles (`Admin`, `Agent`, `User`).  
- 🎫 **Offre** → Représente un événement ou billet disponible à la vente.  
- 🧾 **Commande** → Relie un utilisateur à un ou plusieurs billets achetés.  
- 🧍‍♂️ **Billet** → Associé à une commande, identifiable par un **QR Code**.  
- 🔑 **OTP** → Utilisé pour la validation de la connexion (**authentification forte**).  

🧩 Le MCD sert de **base de référence** pour la création des entités **JPA** dans le back-end.

---

## 🧱 Documentation technique

Cette documentation couvre plusieurs aspects :

- **Architecture du projet** → organisation du dépôt (`ticketing`, `ticketing-front`, `Documentation`).  
- **Technologies utilisées** :  
  - Back-end → `Spring Boot`, `JPA/Hibernate`, `H2`, `JWT`, `OTP`.  
  - Front-end → `React`, `Vite`, `Fetch API`, `HTML/CSS`.  
- **Schémas et modèles** : MCD (draw.io + export PNG).  
- **Sécurité** : Authentification JWT + OTP, génération et validation de QR Code.  
- **Outils de gestion** : Trello, GitHub, Git, Postman.

---

## 🧩 Méthodologie

Le projet a été conçu selon une approche **KANBAN** avec l’outil [Trello – Modèle Kanban](https://trello.com/b/QWTYQxAc/mod%C3%A8le-kanban).

### Étapes de réalisation :
1. **Analyse et conception** → Étude du besoin, création du MCD et des cas d’utilisation.  
2. **Développement back-end** → API REST et sécurité JWT/OTP.  
3. **Développement front-end** → Interface utilisateur React + Vite.  
4. **Tests et documentation** → Vérifications, README, captures et livrables finaux.

---

## 🧭 Structure générale du dépôt

| Dossier | Description |
|----------|-------------|
| `ticketing/` | Back-end – API Spring Boot (Java) |
| `ticketing-front/` | Front-end – React + Vite |
| `Documentation/` | Documents techniques (MCD, schémas, notes) |

---

## ✍️ Auteur

**Mohamed Aïtichou**  
Projet réalisé dans le cadre du **Bloc 3 – Développement d’une application web complète (Studi)**.  
📅 Année : 2025  
🔗 [GitHub du projet](https://github.com/MohamedAitichou/ticketing-jo-2024)

---

## 🏁 Statut du projet
Projet terminé.
