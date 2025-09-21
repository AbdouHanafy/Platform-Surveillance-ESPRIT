# JOURNAL DE STAGE
## Plateforme de Microservices de Surveillance des Examens

---

### **INFORMATIONS GÉNÉRALES**

**Période de stage :** 25 Juin 2024 - 1er Septembre 2024  
**Durée :** 10 semaines (68 jours ouvrés)  
**Établissement :** ESPRIT - École Supérieure Privée d'Ingénierie et de Technologies  
**Projet :** Développement d'une plateforme de surveillance des examens basée sur une architecture microservices  

---

## **PRÉSENTATION DU PROJET**

### **Contexte et Objectifs**
Le projet consiste en le développement d'une plateforme complète de gestion et surveillance des examens pour l'établissement ESPRIT. Cette plateforme vise à automatiser et optimiser la planification, l'affectation des ressources (enseignants, salles) et la surveillance des examens, tout en intégrant un système de détection et gestion des fraudes.

### **Architecture Technique**
- **Frontend :** Angular 19 avec PrimeNG pour l'interface utilisateur
- **Backend :** Architecture microservices avec Spring Boot 3.3.3
- **Base de données :** MySQL
- **Outils de développement :** Maven, Spring Cloud (Eureka, Gateway, Config Server)
- **Communication temps réel :** WebSocket avec STOMP

---

## **ARCHITECTURE DU SYSTÈME**

### **Microservices Développés**

#### 1. **Config Server** (`config-server`)
- **Rôle :** Gestion centralisée des configurations
- **Technologies :** Spring Cloud Config
- **Port :** 8888

#### 2. **Eureka Server** (`eureka`)
- **Rôle :** Service de découverte et registre des microservices
- **Technologies :** Spring Cloud Netflix Eureka
- **Port :** 8761

#### 3. **Gateway** (`gateway`)
- **Rôle :** Point d'entrée unique, routage des requêtes
- **Technologies :** Spring Cloud Gateway
- **Port :** 8080

#### 4. **Microservice Emploi du Temps** (`microserviceEmploiDuTemps`)
- **Rôle :** Gestion des plannings et surveillance des examens
- **Fonctionnalités principales :**
  - Planification des surveillances
  - Gestion des groupes et modules
  - Affectation automatique des enseignants
- **Port :** 8090

#### 5. **Microservice Gestion des Fraudes** (`microserviceGestionDesFraudes`)
- **Rôle :** Détection, déclaration et traitement des fraudes
- **Fonctionnalités principales :**
  - Déclaration de fraudes par les enseignants
  - Génération de rapports PDF/Word
  - Workflow de traitement des fraudes
- **Port :** 8091

#### 6. **Microservice Gestion des Notifications** (`microserviceGestionDesNotifications`)
- **Rôle :** Système de notifications en temps réel
- **Fonctionnalités principales :**
  - Notifications WebSocket
  - Notifications personnalisées par rôle
- **Port :** 8092

#### 7. **Microservice Gestion des Salles** (`microserviceGestionDesSalles`)
- **Rôle :** Gestion des salles et affectations
- **Fonctionnalités principales :**
  - CRUD des salles
  - Affectation automatique des salles
  - Vérification des disponibilités
- **Port :** 8093

#### 8. **Microservice Utilisateurs** (`microserviceUser`)
- **Rôle :** Authentification et gestion des utilisateurs
- **Fonctionnalités principales :**
  - Authentification JWT
  - Gestion des rôles (SUPER_ADMIN, ADMIN, ENSEIGNANT)
  - Profils utilisateurs
- **Port :** 8094

---

## **FONCTIONNALITÉS DÉVELOPPÉES**

### **Frontend Angular**

#### **1. Gestion de l'Authentification**
- **Composant :** `LoginComponent`
- **Fonctionnalités :**
  - Connexion sécurisée avec JWT
  - Gestion des sessions
  - Redirection selon les rôles

#### **2. Dashboards par Rôle**
- **Super Admin Dashboard :** Vue globale du système
- **Admin Dashboard :** Gestion des examens et ressources
- **Enseignant Dashboard :** Vue personnalisée des affectations

#### **3. Gestion des Affectations** (`AffectationComponent`)
- **Fonctionnalités :**
  - Affectation manuelle modules-groupes
  - Filtrage par période et option
  - Interface intuitive avec SweetAlert2

#### **4. Planification des Examens** (`ExamenChronoComponent`)
- **Fonctionnalités :**
  - Calendrier hebdomadaire interactif
  - Création d'examens par période
  - Affectation automatique des enseignants
  - Notifications temps réel
  - Gestion des conflits de planning

#### **5. Gestion des Fraudes** (`FraudeComponent`)
- **Fonctionnalités :**
  - Formulaire de déclaration de fraude
  - Génération automatique de rapports PDF/Word
  - Workflow de traitement (Déclarée → En cours → Traitée → Archivée)
  - Filtrage par statut et rôle

#### **6. Gestion des Entités**
- **Enseignants :** CRUD complet avec spécialisations
- **Modules :** Gestion avec unités pédagogiques
- **Salles :** Organisation par blocs et étages
- **Groupes :** Gestion par niveaux et options
- **Sessions :** Périodes d'examens

#### **7. Système de Notifications**
- **Service :** `GlobalNotificationService`
- **Fonctionnalités :**
  - Notifications en temps réel via WebSocket
  - Notifications personnalisées par utilisateur
  - Interface de notifications avec compteur

---

## **CHRONOLOGIE DÉTAILLÉE DU DÉVELOPPEMENT**

### **📅 PHASE 1 : DÉCOUVERTE ET ANALYSE (Semaines 1-2)**
#### **25 Juin - 5 Juillet 2024**

**Semaine 1 (25-28 Juin)**
- ✅ **Jour 1** : Accueil, présentation du projet et de l'équipe
- ✅ **Jour 2-3** : Analyse des besoins et étude de l'existant
- ✅ **Jour 4** : Formation aux technologies (Spring Boot, Angular, Microservices)

**Semaine 2 (1-5 Juillet)**
- ✅ **Lundi-Mardi** : Conception de l'architecture microservices
- ✅ **Mercredi-Jeudi** : Création des maquettes Figma (wireframes initiaux)
- ✅ **Vendredi** : Validation de l'architecture avec l'équipe technique

---

### **📅 PHASE 2 : INFRASTRUCTURE ET SETUP (Semaines 3-4)**
#### **8-19 Juillet 2024**

**Semaine 3 (8-12 Juillet)**
- ✅ **Lundi** : Setup de l'environnement de développement
- ✅ **Mardi** : Configuration du serveur Eureka (Service Discovery)
- ✅ **Mercredi** : Setup du Config Server avec les configurations
- ✅ **Jeudi** : Création et configuration du Gateway API
- ✅ **Vendredi** : Configuration des bases de données MySQL

**Semaine 4 (15-19 Juillet)**
- ✅ **Lundi-Mardi** : Tests de connectivité entre services
- ✅ **Mercredi-Jeudi** : Documentation de l'architecture
- ✅ **Vendredi** : Formation approfondie Spring Cloud

---

### **📅 PHASE 3 : DÉVELOPPEMENT BACKEND (Semaines 5-7)**
#### **22 Juillet - 9 Août 2024**

**Semaine 5 (22-26 Juillet)**
- ✅ **Lundi-Mardi** : Microservice User - Entités et repositories
- ✅ **Mercredi** : Implémentation JWT et Spring Security
- ✅ **Jeudi** : Contrôleurs d'authentification et tests API
- ✅ **Vendredi** : Microservice EmploiDuTemps - Structure de base

**Semaine 6 (29 Juillet - 2 Août)**
- ✅ **Lundi** : Entités métier (Groupe, Module, Enseignant, Salle)
- ✅ **Mardi** : Relations JPA et mapping complexes
- ✅ **Mercredi** : Services métier pour la planification
- ✅ **Jeudi** : Microservice Gestion des Salles
- ✅ **Vendredi** : Logique d'affectation automatique des salles

**Semaine 7 (5-9 Août)**
- ✅ **Lundi** : Microservice Gestion des Fraudes
- ✅ **Mardi** : Microservice Gestion des Notifications
- ✅ **Mercredi** : Implémentation WebSocket pour notifications temps réel
- ✅ **Jeudi** : Tests d'intégration inter-services
- ✅ **Vendredi** : Optimisation et debugging backend

---

### **📅 PHASE 4 : DÉVELOPPEMENT FRONTEND (Semaines 8-9)**
#### **12-23 Août 2024**

**Semaine 8 (12-16 Août)**
- ✅ **Lundi** : Setup Angular 19, PrimeNG et Tailwind CSS
- ✅ **Mardi** : Structure des modules et composants de base
- ✅ **Mercredi** : Composant d'authentification et services HTTP
- ✅ **Jeudi** : Guards de protection et gestion des rôles
- ✅ **Vendredi** : Dashboards par rôle (Admin, Enseignant, Super Admin)

**Semaine 9 (19-23 Août)**
- ✅ **Lundi** : Composant de gestion des affectations
- ✅ **Mardi** : Interface de sélection modules/groupes/périodes
- ✅ **Mercredi** : Composant ExamenChrono avec FullCalendar
- ✅ **Jeudi** : Logique de création d'examens avec contraintes
- ✅ **Vendredi** : Composant de gestion des fraudes

---

### **📅 PHASE 5 : FONCTIONNALITÉS AVANCÉES (Semaine 10)**
#### **26-30 Août 2024**

**Semaine 10 (26-30 Août)**
- ✅ **Lundi** : Service de notifications globales Angular
- ✅ **Mardi** : Génération de rapports PDF avec PDFMake
- ✅ **Mercredi** : Génération de documents Word pour les fraudes
- ✅ **Jeudi** : Intégration SweetAlert2 et optimisations UI/UX
- ✅ **Vendredi** : Tests fonctionnels complets et debugging

---

### **📅 PHASE 6 : FINALISATION (1er Septembre)**
#### **1er Septembre 2024**

**Dernière journée**
- ✅ **Matin** : Tests d'intégration finaux et optimisation des performances
- ✅ **Après-midi** : Documentation technique complète et guide utilisateur
- ✅ **Fin de journée** : Préparation de la démonstration et soutenance

---

### **📊 RÉCAPITULATIF COMPLET DU STAGE**

#### **Heures de Travail Totales :** 544 heures sur 68 jours ouvrés (8h/jour)

**Répartition par Phase :**
- **Phase 1 - Découverte/Analyse :** 80 heures (14.7%)
- **Phase 2 - Infrastructure/Setup :** 80 heures (14.7%)
- **Phase 3 - Développement Backend :** 160 heures (29.4%)
- **Phase 4 - Développement Frontend :** 128 heures (23.5%)
- **Phase 5 - Fonctionnalités Avancées :** 64 heures (11.8%)
- **Phase 6 - Finalisation/Documentation :** 32 heures (5.9%)

**Répartition par Technologie :**
- **Spring Boot/Microservices :** 200 heures (36.8%)
- **Angular/Frontend :** 180 heures (33.1%)
- **Base de données/JPA :** 60 heures (11.0%)
- **UI/UX Design (Figma) :** 40 heures (7.4%)
- **Tests/Documentation :** 64 heures (11.7%)

**Compétences Développées par Semaine :**
- **Semaines 1-2 :** Analyse métier, conception d'architecture
- **Semaines 3-4 :** Microservices, Spring Cloud, infrastructure
- **Semaines 5-7 :** Spring Boot, JPA, APIs REST, sécurité
- **Semaines 8-9 :** Angular, PrimeNG, intégration frontend-backend
- **Semaine 10 :** Fonctionnalités avancées, optimisation, tests

---

## **CONCEPTION ET PROTOTYPES**

### **Maquettes Figma Réalisées**

#### **1. Écran de Connexion**
- Design moderne avec logo ESPRIT
- Formulaire simplifié (email/matricule + mot de passe)
- Gestion des erreurs et validation

#### **2. Dashboard Super Admin**
- Vue d'ensemble avec statistiques
- Graphiques de répartition des examens
- Accès rapide aux fonctionnalités principales

#### **3. Planificateur d'Examens**
- Calendrier hebdomadaire avec navigation
- Codes couleur par période
- Interface drag-and-drop pour les affectations
- Indicateurs de conflits et disponibilités

#### **4. Formulaire de Déclaration de Fraude**
- Formulaire structuré avec validation
- Upload de preuves (photos, documents)
- Prévisualisation du rapport généré

#### **5. Interface de Gestion des Notifications**
- Centre de notifications avec compteur
- Catégorisation par type et priorité
- Marquage lu/non lu avec persistance

### **Design System**
- **Palette de couleurs :** Thème ESPRIT (rouge, blanc, gris)
- **Typographie :** Roboto pour la lisibilité
- **Composants :** PrimeNG avec personnalisation
- **Responsive Design :** Adaptation mobile et tablette

---

## **DÉFIS TECHNIQUES RENCONTRÉS**

### **1. Gestion des Microservices**
- **Problème :** Communication inter-services
- **Solution :** Utilisation de Feign Client et service discovery

### **2. Notifications Temps Réel**
- **Problème :** Synchronisation WebSocket multi-utilisateurs
- **Solution :** Implémentation STOMP avec topics personnalisés

### **3. Génération de Documents**
- **Problème :** Génération PDF/Word côté frontend
- **Solution :** Utilisation de pdfMake et génération HTML pour Word

### **4. Affectation Automatique**
- **Problème :** Algorithme d'affectation optimale des ressources
- **Solution :** Logique métier avec contraintes et priorités

---

## **TECHNOLOGIES ET OUTILS UTILISÉS**

### **Backend**
- **Spring Boot 3.3.3** - Framework principal
- **Spring Cloud 2023.0.1** - Microservices
- **Spring Data JPA** - Persistence
- **MySQL 8.0** - Base de données
- **WebSocket + STOMP** - Communication temps réel
- **Maven** - Gestion des dépendances
- **Lombok** - Réduction du boilerplate

### **Frontend**
- **Angular 19** - Framework frontend
- **PrimeNG 19** - Composants UI
- **Tailwind CSS** - Styling
- **FullCalendar** - Composant calendrier
- **SweetAlert2** - Notifications utilisateur
- **PDFMake** - Génération PDF
- **RxJS** - Programmation réactive

### **Outils de Développement**
- **IntelliJ IDEA** - IDE Backend
- **VS Code** - IDE Frontend
- **Postman** - Tests API
- **Figma** - Prototypage UI/UX
- **Git** - Contrôle de version

---

## **RÉSULTATS ET LIVRABLES**

### **Fonctionnalités Opérationnelles**
✅ Système d'authentification multi-rôles  
✅ Planification interactive des examens  
✅ Affectation automatique des ressources  
✅ Gestion complète des fraudes avec rapports  
✅ Notifications temps réel  
✅ Interface responsive et intuitive  
✅ Architecture microservices scalable  

### **Métriques du Projet**
- **Lignes de code Backend :** ~15,000 lignes Java
- **Lignes de code Frontend :** ~12,000 lignes TypeScript/HTML/SCSS
- **Microservices :** 8 services indépendants
- **Composants Angular :** 25+ composants
- **Entités JPA :** 12 entités métier
- **Services REST :** 50+ endpoints

---

## **COMPÉTENCES ACQUISES**

### **Techniques**
- Maîtrise de l'architecture microservices
- Développement full-stack Angular/Spring Boot
- Intégration WebSocket et notifications temps réel
- Génération de documents PDF/Word
- Design patterns et bonnes pratiques

### **Méthodologiques**
- Planification et gestion de projet
- Conception d'interfaces utilisateur
- Tests et débogage système distribué
- Documentation technique

### **Personnelles**
- Autonomie dans la résolution de problèmes
- Adaptabilité aux nouvelles technologies
- Rigueur dans le développement
- Esprit d'équipe et communication

---

## **PERSPECTIVES D'AMÉLIORATION**

### **Court Terme**
- Ajout de tests unitaires et d'intégration
- Optimisation des performances
- Amélioration de l'accessibilité

### **Moyen Terme**
- Module de statistiques avancées
- Intégration avec systèmes existants ESPRIT
- Application mobile companion

### **Long Terme**
- Intelligence artificielle pour la détection de fraudes
- Système de recommandations automatiques
- Déploiement cloud avec conteneurisation

---

## **CONCLUSION**

Ce stage de 10 semaines (68 jours ouvrés) a été une expérience enrichissante qui m'a permis de développer une plateforme complète de surveillance des examens en utilisant les technologies les plus récentes. Le projet combine avec succès une architecture microservices robuste avec une interface utilisateur moderne et intuitive.

La plateforme développée répond aux besoins réels de l'établissement ESPRIT en automatisant des processus manuels complexes et en offrant une expérience utilisateur optimisée pour tous les acteurs du système éducatif.

Les compétences acquises durant ce stage, tant techniques que méthodologiques, constituent une base solide pour mon développement professionnel dans le domaine du développement full-stack et de l'architecture logicielle.

---

**Date de rédaction :** 1er Septembre 2024  
**Signature :** [Votre nom]  
**Encadrant :** [Nom de l'encadrant]  

---

## **ANNEXES**

### **Annexe A : Diagrammes d'Architecture**
- Diagramme de l'architecture microservices
- Schéma de base de données
- Diagrammes de flux utilisateur

### **Annexe B : Captures d'Écran**
- Interface de connexion
- Dashboards par rôle
- Planificateur d'examens
- Système de fraudes
- Notifications temps réel

### **Annexe C : Code Source**
- Structure des projets
- Exemples de code significatif
- Configuration des microservices

### **Annexe D : Documentation Technique**
- Guide d'installation
- Documentation des APIs
- Guide utilisateur
