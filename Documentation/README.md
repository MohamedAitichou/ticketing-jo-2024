# 🗂️ Documentation – Billetterie JO 2024

Ce dossier contient l’ensemble des éléments de **documentation technique et fonctionnelle** du projet de billetterie pour les Jeux Olympiques 2024.

---

## 📘 Contenu du dossier

| Fichier | Description |
|----------|--------------|
| `MCD_Billetterie.drawio` | Schéma du **Modèle Conceptuel de Données (MCD)** au format éditable. |
| `MCD_Billetterie.png` | Export du MCD au format image pour consultation rapide. |
| `Bloc3.pdf` | Développement d’une solution digitale avec Java. |

---

## 🧩 Objectif du MCD

Le **Modèle Conceptuel de Données** décrit la structure de la base de données du projet.  
Il met en évidence les principales entités et leurs relations :

- **Utilisateur** → peut avoir un ou plusieurs **rôles** (admin, agent, user)
- **Offre** → représente un événement ou billet disponible à la vente
- **Commande** → relie un utilisateur à un ou plusieurs billets achetés
- **Billet** → associé à une commande, identifiable par un **QR Code**
- **OTP** → utilisé pour la validation de la connexion (authentification forte)

---

## 🧠 Méthodologie

Le projet a été conçu selon une approche **KANBAN** avec l’outil **Trello** :
🔗 [Tableau Trello – Modèle Kanban](https://trello.com/b/QWTYQxAc/mod%C3%A8le-kanban)

Les étapes de gestion de projet :
1. **Analyse & conception** : MCD, choix techniques, architecture.
2. **Développement back-end** : création des API REST et sécurité JWT.
3. **Développement front-end** : intégration React + Vite.
4. **Tests et documentation** : mise en place du README et des fichiers explicatifs.

---

## 🧱 Structure générale du dépôt

Le projet complet est organisé en trois dossiers principaux :

| Dossier | Description |
|----------|--------------|
| `ticketing/` | Back-end – API Spring Boot (Java) |
| `ticketing-front/` | Front-end – React + Vite |
| `Documentation/` | Documents techniques (MCD, schémas, notes) |

---

## 📄 Auteur

**Mohamed Aitichou**  
Projet réalisé dans le cadre du **Bloc 3 – Développement d’une application web complète** (Studi).
