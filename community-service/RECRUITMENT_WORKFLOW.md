# 🤖 Système de Recrutement Automatisé par IA

Ce document décrit le fonctionnement du pipeline de recrutement automatisé implémenté dans le module `community-service`. Le système utilise l'IA pour le filtrage initial et des tests techniques pour la validation finale.

---

## 📋 Flux de Recrutement Étape par Étape

### 1. Candidature & Analyse IA Initiale
*   **Action** : Le candidat postule avec un **CV (PDF)** et une **Lettre de Motivation**.
*   **Analyse IA** : Dès la soumission, le `CandidateMLService` calcule deux scores (0-100) :
    *   **Score CV** : Correspondance des compétences et de l'expérience avec l'offre.
    *   **Score Lettre** : Qualité de la rédaction et pertinence de la motivation.
*   **Statut** : La candidature passe en statut **"CONSULTÉE"** (Viewed) dès que le recruteur ouvre sa liste d'offres.

### 2. Déclenchement du Pipeline (La "Coupe")
Le processus de sélection passe à l'étape suivante de deux manières :
*   **Automatique** : Le `DeadlineSchedulerService` vérifie chaque minute les offres ayant atteint leur date limite (`expiresAt`).
*   **Manuel** : Si le recruteur change manuellement le statut de l'offre en **"EN COURS"** (In Progress) ou **"EXPIRÉE"**.

### 3. Sélection pour le Quiz Technique
*   **Classement** : Le système classe les candidats par score IA décroissant.
*   **Sélection** : Le système sélectionne automatiquement le **Top Candidats** pour passer le test.
    *   *Règle* : `Nombre de postes disponibles * 3` (Ex: pour 2 postes, les 6 meilleurs sont retenus).
*   **Statut** : Ces candidats passent en statut **"ACCEPTÉE"** (Accepté pour le Quiz).
*   **Notification** : Un quiz technique est généré et envoyé automatiquement à ces candidats.

### 4. Évaluation Finale & Pondération
Une fois le quiz terminé, le système calcule le **Score Global Pondéré** :
*   **50%** : Résultat du Quiz Technique.
*   **30%** : Pertinence du CV (Score IA).
*   **20%** : Qualité de la Lettre de Motivation (Score IA).

Le tableau de bord "Top Candidates" se met à jour en temps réel avec ce score final.

### 5. Finalisation & Invitation à l'Entretien
*   **Décision** : Une fois que tous les candidats ont répondu (ou que le processus est finalisé), les meilleurs (selon le nombre de postes) sont sélectionnés.
*   **Statut Final** : Les gagnants passent en statut **"ENTRETIEN"**.
*   **Invitation** : Un message de félicitations automatisé est envoyé, invitant officiellement le candidat à un entretien pour fixer un rendez-vous.
*   **Clôture** : L'offre passe en statut **"FERMÉE"**.

---

## 🛠️ Composants Techniques Clés

*   **`MarketplaceService`** : Gère les candidatures et les changements de statut.
*   **`RecruitmentPipelineService`** : Le moteur qui gère la logique de sélection, de pondération et de finalisation.
*   **`DeadlineSchedulerService`** : Le planificateur qui surveille les dates limites (en UTC).
*   **`CandidateMLService`** : Interface avec les services d'IA pour l'analyse textuelle des documents.

---
*Note : Ce système est conçu pour être entièrement autonome, garantissant un processus de recrutement rapide, équitable et basé sur la performance.*
