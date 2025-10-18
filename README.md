# ticketing-jo-2024
Projet de billetterie Java/React pour le Bloc 3 Studi

# 🎟️ Billetterie JO 2024

Projet complet développé dans le cadre du **Bloc 3 - Studi**.  
Application web de **billetterie pour les Jeux Olympiques 2024**, basée sur une architecture **full-stack (Spring Boot + React)**.

---

## 🧩 Structure du projet

Le dépôt contient trois dossiers principaux :

| Dossier | Description |
|----------|--------------|
| `ticketing` | Back-end développé avec **Spring Boot (Java)** : API REST, gestion utilisateurs, rôles, OTP, JWT, QR codes. |
| `ticketing-front` | Front-end développé avec **React + Vite** : interface utilisateur, formulaires, authentification, affichage des billets. |
| `Documentation` | Contient le **MCD (draw.io / PNG)** et la **documentation technique** complète du projet. |

---

## ⚙️ Technologies principales

- **Front-end :** React.js (Vite, Fetch API, JWT Auth)
- **Back-end :** Spring Boot (Java, JPA/Hibernate, H2)
- **Base de données :** H2 (locale, peut être remplacée par MySQL/PostgreSQL)
- **Sécurité :** JWT (JSON Web Token) + OTP (One Time Password)
- **Autres :** Maven, npm, QR Code, Trello (Kanban)

---

## 🧱 Architecture générale

L’application repose sur une architecture client/serveur :

- **Front-end** : Gère toute l’interface utilisateur et communique avec le back via des requêtes HTTP sécurisées.
- **Back-end** : Fournit les API REST pour la gestion des utilisateurs, commandes, offres et billets.
- **Base de données** : Gérée par JPA/Hibernate. Les entités sont liées selon le MCD (voir Documentation).

---

## 🔐 Sécurité et rôles utilisateurs

L’application utilise un système d’authentification **JWT** avec un code **OTP** (envoyé par e-mail).

Rôles disponibles :
- **ADMIN** : gestion complète (offres, utilisateurs, statistiques).
- **AGENT** : contrôle des billets via QR code.
- **USER** : achat et historique des commandes.

---

## 🚀 Lancer le projet en local

### Back-end (Spring Boot)

```bash
cd ticketing
./mvnw spring-boot:run
# Serveur sur http://localhost:8081
