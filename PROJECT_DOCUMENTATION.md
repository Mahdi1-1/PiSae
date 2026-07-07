# PIcloud - Professional Community Platform

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [User Roles](#user-roles)
4. [Features by Module](#features-by-module)
5. [API Endpoints](#api-endpoints)
6. [Tech Stack](#tech-stack)
7. [Data Models](#data-models)
8. [Workflows](#workflows)

---

## Project Overview

PIcloud is a professional community platform built as a microservices architecture. It enables users to:
- **Network** with other professionals (ETUDIANT, ENTREPRENEUR, MENTOR, INVESTISSEUR, PARTENAIRE)
- **Post and apply for job opportunities** with AI-powered candidate matching
- **Engage in forum discussions** within groups
- **Chat in real-time** via WebSocket messaging
- **Build reputation** through community interactions
- **Take AI-generated technical quizzes** during hiring process

---

## Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                  │
│                    Angular 17 (PIcloud)                           │
│                   http://localhost:4200                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                  │
│              Spring Cloud Gateway (port 8091)                   │
│         Routes: /api/community/* → community-service (8082)    │
│                  /api/user/* → user-service (8081)             │
│                  /api/auth/* → user-service (8081)              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ COMMUNITY     │   │    USER       │   │   EUREKA      │
│ SERVICE       │   │   SERVICE     │   │   SERVER      │
│ (port 8082)   │   │  (port 8081)  │   │  (port 8761)  │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Modules in Community Service

| Module | Description |
|--------|-------------|
| **marketplace** | Job opportunities, applications, AI quiz system |
| **messaging** | Real-time WebSocket chat |
| **forum** | Groups, posts, comments |
| **network** | User connections, discovery |
| **reputation** | Badges, leaderboard, XP system |

---

## User Roles

| Role | Description |
|------|-------------|
| **USER** | Standard member |
| **ADMIN** | Platform administrator |
| **ENTREPRENEUR** | Business founder/owner seeking talent or partners |
| **MENTOR** | Advisor/expert providing guidance |
| **INVESTISSEUR** | Investor looking for opportunities |
| **PARTENAIRE** | Business partner |
| **ETUDIANT** | Student seeking opportunities |

---

## Features by Module

### 1. Marketplace Module

#### Opportunity Types
- **EMPLOI** - Full-time employment
- **STAGE** - Internship
- **PARTENARIAT** - Partnership
- **FREELANCE** - Freelance work

#### Opportunity Status Flow
```
OPEN → IN_PROGRESS → CLOSED
         ↓
      EXPIRED
```

#### Application Status Flow
```
SENT → VIEWED → ACCEPTED → INTERVIEW
                ↘ REJECTED
                ↘ WITHDRAWN
```

#### For Publishers (ENTREPRENEUR, etc.)
- **Create Job Offers** with:
  - Title, description, sector, location
  - Required skills (chip input)
  - Type: EMPLOI, STAGE, PARTENARIAT, FREELANCE
  - **Positions Available** (number of candidates needed)
  - Expiration date
- **View Applications** for each published opportunity
- **AI-Powered Candidate Ranking** using semantic similarity (Hugging Face transformers)
- **Send Technical Quizzes** to top candidates (AI-generated via Groq/Llama 3.3)
- **Finalize Hires** - send congratulations messages to selected candidates
- **Automatic Opportunity Closure** when all positions are filled

#### For Candidates (all roles)
- **Browse Opportunities** filtered by sector/type
- **Apply to Jobs** with CV upload and cover letter
- **Track Application Status**: SENT → VIEWED → ACCEPTED/REJECTED
- **Receive Quiz Notifications** via WebSocket
- **Take AI-Generated Quiz** (5 MCQ questions based on job requirements)
- **View Results** with explanations for each answer
- **AI Job Recommendations** based on user's CV

#### Quiz Workflow
```
1. Publisher accepts candidate OR clicks "Send to Top N"
   → Default: positionsAvailable × 3 candidates
2. Groq AI generates 5 technical questions based on job description
3. Candidate receives real-time WebSocket notification
4. Candidate completes quiz via unique link
5. Score calculated and saved (percentage)
6. Publisher sees score in applicant list
7. Publisher clicks "Finaliser" for best candidates
8. Congratulations message sent to finalised candidates
9. When finalisedCount >= positionsAvailable → Opportunity CLOSED
```

### 2. Messaging Module

#### Message Types
- **PRIVATE** - One-to-one messaging
- **GROUP** - Group chat
- **SYSTEM** - Automated notifications (quiz invites, congratulations)

#### Connection Status
```
PENDING → ACCEPTED
       ↘ DECLINED
       ↘ BLOCKED
```

#### Features
- **Real-time WebSocket Chat** via STOMP/SockJS
- **Private Messages** between users
- **Group Chat** within forum groups
- **System Notifications** (quiz invites, congratulations)
- **Message Persistence** in MongoDB
- **Unread Message Indicators**
- **Global Notification Listener** - receives notifications even when not in chat

#### WebSocket Topics
| Topic | Purpose |
|-------|---------|
| `/topic/group/{groupId}` | Group chat messages |
| `/topic/user/{userId}` | Private messages & system notifications |

### 3. Forum Module

#### Group Visibility
- **PUBLIC** - Anyone can view and join
- **PRIVATE** - Approval required to join
- **INVITATION_ONLY** - Only invited members can join

#### Post Status
- **PENDING** - Awaiting moderation
- **APPROVED** - Visible to all
- **REJECTED** - Not published
- **HIDDEN** - Hidden by moderator

#### Group Status
- **PENDING** - Awaiting approval
- **APPROVED** - Active
- **REJECTED** - Not approved
- **SUSPENDED** - Temporarily disabled

#### Features
- **Public/Private Groups** with visibility settings
- **Posts** with rich content (title, content)
- **Comments** on posts
- **Group Membership** management
- **Post Status**: Moderation workflow

### 4. Network Module

#### Features
- **User Discovery** with search capabilities
- **Connection Requests** (PENDING, ACCEPTED, DECLINED, BLOCKED)
- **Connection Management** (view, accept, reject)
- **Professional Profiles**

### 5. Reputation Module

#### Levels
- **BRONZE** (0-500 XP)
- **SILVER** (500-1500 XP)
- **GOLD** (1500-3500 XP)
- **PLATINUM** (3500-7000 XP)
- **DIAMOND** (7000+ XP)

#### Reputation Actions
| Action | XP Gained |
|--------|-----------|
| Forum Post | +10 |
| Forum Comment | +5 |
| Received Like | +2 |
| New Connection | +5 |

#### Features
- **XP Points** earned through activities
- **Levels** based on XP thresholds
- **Badges** (customizable achievements)
- **Leaderboard** ranking

---

## API Endpoints

### Gateway Routes (Port 8091)

```
/api/auth/*           → user-service (Authentication)
/api/user/*           → user-service (User management)
/api/community/*      → community-service (All community features)
```

### Community Service Endpoints (Port 8082)

#### Opportunities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/community/marketplace` | Create new opportunity |
| GET | `/api/community/marketplace` | Get all opportunities (paginated) |
| GET | `/api/community/marketplace/{id}` | Get opportunity by ID |
| GET | `/api/community/marketplace/my/{publisherId}` | Get publisher's opportunities |
| GET | `/api/community/marketplace/sector/{sector}` | Filter by sector |
| GET | `/api/community/marketplace/type/{type}` | Filter by type |
| PUT | `/api/community/marketplace/{id}/status` | Update status |
| DELETE | `/api/community/marketplace/{id}` | Delete opportunity |

#### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/community/marketplace/{oppId}/apply` | Apply without file |
| POST | `/api/community/marketplace/{oppId}/apply-with-file` | Apply with CV file |
| GET | `/api/community/marketplace/{oppId}/applications` | Get all applications for opportunity |
| GET | `/api/community/marketplace/applications/candidate/{candidateId}` | Get candidate's applications |
| PUT | `/api/community/marketplace/applications/{appId}/status` | Update application status |
| PUT | `/api/community/marketplace/applications/{appId}/withdraw` | Withdraw application |
| POST | `/api/community/marketplace/{oppId}/send-quiz-to-top?count=N` | Send quiz to top N candidates |
| POST | `/api/community/marketplace/applications/{appId}/finalise` | Finalise candidate |

#### AI/ML Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/marketplace/{oppId}/recommendations` | Get AI-ranked candidates |
| GET | `/api/community/marketplace/users/{userId}/recommendations` | Get recommended jobs for user |
| GET | `/api/community/marketplace/ml/status` | Get ML model status |
| GET | `/api/community/marketplace/{oppId}/debug-scoring` | Debug AI scoring |

#### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/marketplace/quiz/{quizId}` | Get quiz by ID |
| POST | `/api/community/marketplace/quiz/{quizId}/submit` | Submit quiz answers |

#### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/messages/{userId1}/{userId2}` | Get conversation |
| GET | `/api/community/messages/conversations/{userId}` | Get user's conversations |
| POST | `/api/community/messages/private` | Send private message |
| PUT | `/api/community/messages/{messageId}/read` | Mark message as read |

#### Forum
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/groups` | Get all groups |
| POST | `/api/community/groups` | Create group |
| GET | `/api/community/groups/{groupId}` | Get group details |
| POST | `/api/community/groups/{groupId}/join` | Join group |
| POST | `/api/community/groups/{groupId}/leave` | Leave group |
| GET | `/api/community/posts/group/{groupId}` | Get posts in group |
| POST | `/api/community/posts` | Create post |
| POST | `/api/community/posts/{postId}/comments` | Add comment |
| PUT | `/api/community/posts/{postId}/like` | Like post |

#### Network
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/connections/{userId}` | Get user's connections |
| POST | `/api/community/connections/request` | Send connection request |
| PUT | `/api/community/connections/{connId}/accept` | Accept request |
| PUT | `/api/community/connections/{connId}/reject` | Reject request |
| GET | `/api/community/users/search` | Search users |

#### Reputation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/reputation/{userId}` | Get user reputation |
| GET | `/api/community/reputation/{userId}/badges` | Get user badges |
| GET | `/api/community/reputation/leaderboard` | Get leaderboard |

### User Service Endpoints (Port 8081)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/user/{id}` | Get user profile |
| PUT | `/api/user/{id}` | Update user |
| POST | `/api/user/upload-photo` | Upload profile photo |

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Spring Boot 3.0** | Application framework |
| **Spring Cloud** | Microservices, Gateway, Eureka |
| **MongoDB** | Primary database (community, messaging, forums) |
| **JPA/MySQL** | User service database |
| **Spring Data MongoDB** | MongoDB repositories |
| **Spring Security + JWT** | Authentication |
| **Spring WebSocket + STOMP** | Real-time messaging |
| **Spring Mail** | Email notifications |
| **Deep Java Library (DJL)** | ML/AI integration |
| **Hugging Face Transformers** | Semantic similarity (all-MiniLM-L6-v2) |
| **Groq API** | AI quiz generation (Llama 3.3) |
| **GridFS** | CV file storage |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Angular 17** | UI Framework |
| **Angular Material** | UI Components |
| **RxJS** | Reactive programming |
| **SockJS + STOMP.js** | WebSocket client |
| **Angular Router** | Navigation |

---

## Data Models

### Opportunity (marketplace)
```typescript
{
  id: string;
  publisherId: string;
  type: 'EMPLOI' | 'STAGE' | 'PARTENARIAT' | 'FREELANCE';
  title: string;
  description: string;
  skillsRequired: string[];
  sector: string;
  location: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'EXPIRED';
  viewsCount: number;
  applicationsCount: number;
  positionsAvailable: number;   // Number of hires needed
  quizSentCount: number;         // Quizzes sent
  finalisedCount: number;       // Hires confirmed
  expiresAt: string;
  createdAt: string;
  deleted: boolean;
}
```

### OpportunityApplication (marketplace)
```typescript
{
  id: string;
  opportunityId: string;
  candidateId: string;
  cvUrl: string;
  coverLetter: string;
  status: 'SENT' | 'VIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  quizScore?: number;           // Quiz result (0-100)
  quizId?: string;              // Reference to quiz
  appliedAt: string;
}
```

### Quiz (marketplace)
```typescript
{
  id: string;
  opportunityId: string;
  applicationId: string;
  candidateId: string;
  questions: QuizQuestion[];
  createdAt: string;
  completedAt?: string;
  score?: number;
  completed: boolean;
}
```

### QuizQuestion (marketplace)
```typescript
{
  questionText: string;
  options: string[];            // 4 options
  correctAnswerIndex: number;
  candidateAnswerIndex?: number;
  explanation: string;
}
```

### ForumGroup (forum)
```typescript
{
  id: string;
  name: string;
  description: string;
  ownerId: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITATION_ONLY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  memberIds: string[];
  createdAt: string;
}
```

### ForumPost (forum)
```typescript
{
  id: string;
  groupId: string;
  authorId: string;
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  likeIds: string[];
  commentCount: number;
  createdAt: string;
}
```

### Comment (forum)
```typescript
{
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
```

### ChatMessage (messaging)
```typescript
{
  id: string;
  senderId: string;
  receiverId?: string;          // For PRIVATE messages
  groupId?: string;            // For GROUP messages
  content: string;
  sentAt: string;
  read: boolean;
  type: 'PRIVATE' | 'GROUP' | 'SYSTEM';
}
```

### MemberConnection (network)
```typescript
{
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  createdAt: string;
}
```

### MemberReputation (reputation)
```typescript
{
  id: string;
  odelId: string;               // User ID
  xp: number;
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  createdAt: string;
  updatedAt: string;
}
```

### User (user-service)
```typescript
{
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTISSEUR' | 'PARTENAIRE' | 'ETUDIANT';
  profilePhotoUrl?: string;
  createdAt: string;
  enabled: boolean;
}
```

---

## Workflows

### Job Application & Hiring Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      PUBLISHER FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│  1. Creates opportunity (specifies positionsAvailable = 2)       │
│  2. Waits for candidates to apply                               │
│  3. Views AI-ranked applicants (Top candidates by score)        │
│     - Top 3 displayed with badges: 🏆 Top 1, Top 2, Top 3      │
│  4. Stats shown: X quiz sent, Y finalisés                       │
│  5. Option A: Click "Envoyer quiz aux Top 6" (2 × 3 default)   │
│     Option B: Click "Envoyer Quizz" on individual candidate      │
│  6. AI generates quiz via Groq API (Llama 3.3)                 │
│  7. Candidates receive WebSocket notification                    │
│  8. After candidates complete quiz:                             │
│     - Scores visible in applicant list (color-coded)            │
│     - "Finaliser" button appears for candidates with score      │
│  9. Clicks "Finaliser" on best candidates                        │
│     → Congratulations message sent via WebSocket                │
│     → finalisedCount incremented                                │
│  10. When finalisedCount >= positionsAvailable:                 │
│      Opportunity status → CLOSED                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CANDIDATE FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Browses opportunities by sector/type                         │
│  2. Applies with CV + cover letter                              │
│  3. Status: SENT                                                │
│  4. When publisher views: Status → VIEWED                        │
│  5. If selected for quiz:                                       │
│     - Receives WebSocket notification                            │
│     - Message in chat with "COMMENCER LE QUIZ" button          │
│     - Clicks to open quiz page                                  │
│  6. Completes 5 MCQ technical questions                         │
│  7. Submits → Score calculated (percentage)                     │
│  8. Sees results with explanations                              │
│  9. If finalised: Status → INTERVIEW                            │
│     - Receives congratulations message                          │
└─────────────────────────────────────────────────────────────────┘
```

### AI Candidate Scoring Algorithm
```
Final Score = (Semantic Similarity × 0.5) + (Skill Match × 0.3) + (Experience × 0.2)

- Semantic Similarity: Job description ↔ CV content
  → Uses Hugging Face sentence-transformers (all-MiniLM-L6-v2)
- Skill Match: Required skills found in CV using NLP
- Experience: Years of experience compatibility
```

### Reputation XP System
```
Level Thresholds:
- BRONZE:  0-500 XP
- SILVER:  500-1500 XP
- GOLD:    1500-3500 XP
- PLATINUM: 3500-7000 XP
- DIAMOND:  7000+ XP

XP Actions:
- Create forum post: +10 XP
- Add forum comment: +5 XP
- Receive like on post: +2 XP
- New connection accepted: +5 XP
```

---

## Configuration

### Key Ports
| Service | Port |
|---------|------|
| Frontend (Angular) | 4200 |
| API Gateway | 8091 |
| Community Service | 8082 |
| User Service | 8081 |
| Eureka Server | 8761 |

### Environment Variables (community-service/application.yml)
| Variable | Description |
|----------|-------------|
| `groq.api.key` | Groq API key for quiz generation |
| `spring.data.mongodb.uri` | MongoDB connection string |

---

## Project Structure

```
Laast PI/
├── PIcloud/                         # Angular Frontend
│   └── src/app/
│       ├── core/                    # Guards, interceptors, services
│       └── modules/
│           ├── auth/                 # Login, Register, OAuth2
│           ├── community/           # Main community features
│           │   ├── marketplace/     # Jobs, applications, quiz
│           │   ├── messaging/      # Chat
│           │   ├── forum/          # Groups, posts
│           │   ├── network/         # Connections
│           │   └── reputation/     # XP, badges
│           ├── event/              # Events management
│           └── user/               # User profiles
│
├── community-service/               # Main backend service
│   └── src/main/java/com/projectmentor/communityservice/
│       ├── marketplace/             # Jobs, applications, AI quiz
│       │   ├── controller/         # MarketplaceController, QuizController
│       │   ├── model/             # Opportunity, Application, Quiz, QuizQuestion
│       │   ├── dto/               # CreateOpportunityDTO, ApplyDTO
│       │   ├── repository/        # MongoDB repositories
│       │   └── service/           # MarketplaceService, QuizService, GroqService, etc.
│       ├── messaging/              # Chat, notifications
│       ├── forum/                  # Groups, posts
│       ├── network/                # Connections
│       ├── reputation/             # XP, badges
│       └── config/                # WebSocket, Swagger, Seeder
│
├── user-service/                    # User management (port 8081)
├── api-gateway/                     # Spring Cloud Gateway (port 8091)
└── eureka-server/                  # Service discovery (port 8761)
```

---

*Last Updated: 2026-04-14*
*Features: AI Quiz Generation (Groq/Llama 3.3), Semantic Candidate Matching (Hugging Face), Real-time WebSocket Notifications*
