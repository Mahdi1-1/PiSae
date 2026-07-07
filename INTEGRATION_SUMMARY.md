# Gestionprojets Roadmaps & Playground Integration

## Overview
This document summarizes the integration of the gestionprojets roadmaps and playground features into the existing frontend and their connection to the backend.

## What Was Done

### 1. Created Core Project Service
**File**: `project-pi/new-front/src/app/core/services/project.service.ts`

- Created a wrapper service that provides a simplified API for components outside the gestion-projets module
- Wraps the `GestionProjetsService` to provide:
  - Project CRUD operations
  - Roadmap generation
  - ML scoring and analysis
  - Document generation (BMC, SWOT, Pitch)
  - Playground analysis

### 2. Updated Roadmaps Component
**File**: `project-pi/new-front/src/app/pages/roadmaps/roadmaps.component.ts`

**Changes Made**:
- Added imports for `CommonModule`, `FormsModule`, and `ProjectService`
- Converted from static data to dynamic backend integration
- Added signals for state management:
  - `projects` - list of available projects
  - `selectedProject` - currently selected project
  - `loading` - loading state
  - `generating` - roadmap generation state
  - `error` - error messages
  - `showProjectSelector` - project selection modal visibility
  - `steps` - converted from static array to signal

**New Features**:
- Project selection modal
- Dynamic roadmap generation from backend
- Loading and error states
- Regenerate roadmap functionality
- Maps backend roadmap steps to UI format
- Auto-calculates due dates based on duration
- Extracts tasks from step descriptions

### 3. Updated Playground Component
**File**: `project-pi/new-front/src/app/pages/playground/playground.component.ts`

**Backend Integration**:
- Already uses `ProjectService` (injected)
- Connects to ML service at `http://localhost:8001/api/ml`
- Generates documents via backend:
  - BMC (Business Model Canvas)
  - SWOT Analysis
  - Budget Plan
  - Pitch Deck
- Analyzes uploaded PDFs
- Provides AI-powered feedback

**Features**:
- Chat interface with AI copilot
- Project selection
- Document generation and viewing
- PDF upload and analysis
- Export to PDF functionality

### 4. Added Routes
**File**: `project-pi/new-front/src/app/app.routes.ts`

Added playground route:
```typescript
{ path: 'playground', component: PlaygroundComponent }
```

### 5. Updated Navigation
**File**: `project-pi/new-front/src/app/layout/layout.component.ts`

Added navigation item:
```typescript
{ icon: 'lucideZap', label: 'Playground', route: '/app/playground' }
```

## Backend API Endpoints

### Project Management
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### ML & Analysis
- `POST /api/projects/{id}/score` - Score project using ML
- `POST /api/projects/{id}/roadmap` - Generate roadmap
- `POST /api/projects/analyze-description` - Analyze project description
- `POST /api/projects/{id}/plagiarism` - Analyze plagiarism
- `POST /api/projects/{id}/recommendations` - Get recommendations
- `POST /api/projects/{id}/entrepreneur-playground` - Playground analysis

### Document Generation
- `GET /api/documents/project/{id}` - Get project documents
- `POST /api/documents` - Save document
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document
- `POST /api/documents/project/{id}/generate/bmc` - Generate BMC
- `POST /api/documents/project/{id}/generate/swot` - Generate SWOT
- `POST /api/documents/project/{id}/generate/pitch` - Generate Pitch Deck

### ML Service (Port 8001)
- `POST /api/ml/documents/pdf/analyze` - Analyze PDF
- `POST /api/ml/documents/pdf/extract` - Extract text from PDF
- `POST /api/ml/documents/bmc/generate` - Generate BMC
- `POST /api/ml/documents/swot/generate` - Generate SWOT
- `POST /api/ml/documents/pitch/generate` - Generate Pitch Deck
- `POST /api/ml/projects/{id}/playground` - Playground chat

## Data Flow

### Roadmaps Flow
1. User navigates to `/app/roadmaps`
2. Component loads all projects from backend
3. User selects a project
4. Component calls `generateRoadmap(projectId)`
5. Backend generates roadmap using ML
6. Frontend maps backend steps to UI format
7. Displays roadmap with timeline visualization

### Playground Flow
1. User navigates to `/app/playground`
2. Component loads projects for selection
3. User can:
   - Upload PDF for analysis
   - Chat with AI copilot
   - Generate documents (BMC, SWOT, Budget, Pitch)
   - View and export generated documents
4. All operations call ML service endpoints
5. Results displayed in split-panel UI

## Component Structure

### Roadmaps
```
RoadmapsComponent
├── Project Selector Modal
├── Progress Overview Card
├── Timeline View
│   ├── Phase Indicators
│   ├── Step Cards
│   └── Task Checklists
├── Add Step Modal
└── Edit Step Modal
```

### Playground
```
PlaygroundComponent
├── Left Panel (Chat)
│   ├── Project Selector
│   ├── PDF Upload
│   ├── Chat Messages
│   └── Input Field
└── Right Panel (Documents)
    ├── Tab Navigation (BMC, SWOT, Budget, Pitch)
    ├── Generate/Regenerate Button
    ├── Export PDF Button
    └── Document Views
        ├── BmcViewComponent (standalone)
        ├── SwotViewComponent (standalone)
        ├── Budget View
        └── Pitch Deck View
```

## Configuration

### Backend URLs
- **API Gateway**: `http://localhost:8090/api`
- **ML Service**: `http://localhost:8001/api/ml`

These are configured in:
- `GestionProjetsService`: Main API URL
- `PlaygroundComponent`: ML service URL (hardcoded)

### Required Services
1. **API Gateway** (Port 8090)
   - Spring Boot application
   - Handles project CRUD and orchestration

2. **Gestionprojets Service** (Port 8090)
   - Project management
   - Document persistence
   - ML client integration

3. **ML Service** (Port 8001)
   - Python/FastAPI service
   - Document generation
   - AI analysis and scoring
   - PDF processing

## Usage

### Accessing Roadmaps
1. Navigate to `/app/roadmaps` or click "Roadmaps" in sidebar
2. Click "Select Project" button
3. Choose a project from the list
4. Roadmap will be automatically generated
5. Use "Regenerate" to create a new roadmap

### Accessing Playground
1. Navigate to `/app/playground` or click "Playground" in sidebar
2. Select a project from dropdown
3. Upload PDF documents (optional)
4. Chat with AI or generate documents
5. View generated documents in right panel
6. Export documents as PDF

## Testing

### Prerequisites
1. Start API Gateway: `cd api-gateway && ./mvnw spring-boot:run`
2. Start Gestionprojets: `cd gestionprojets && ./mvnw spring-boot:run`
3. Start ML Service: `cd gestionprojets/ml-service && python main.py`
4. Start Frontend: `cd new-front && npm start`

### Test Scenarios

#### Roadmaps
1. ✅ Load projects list
2. ✅ Select project
3. ✅ Generate roadmap
4. ✅ Display timeline
5. ✅ Show loading states
6. ✅ Handle errors

#### Playground
1. ✅ Load projects
2. ✅ Upload PDF
3. ✅ Analyze PDF
4. ✅ Chat with AI
5. ✅ Generate BMC
6. ✅ Generate SWOT
7. ✅ Generate Budget
8. ✅ Generate Pitch Deck
9. ✅ Export documents

## Known Issues & Limitations

1. **ML Service Dependency**: Playground requires ML service on port 8001
2. **Hardcoded URLs**: ML service URL is hardcoded in playground component
3. **Error Handling**: Limited error recovery for network failures
4. **PDF Size Limit**: 10MB maximum for PDF uploads
5. **Browser Compatibility**: Export PDF uses window.print() which may vary by browser

## Future Enhancements

1. **Roadmaps**
   - Persist roadmap steps to database
   - Allow manual editing of steps
   - Add task completion tracking
   - Calendar view integration
   - Milestone notifications

2. **Playground**
   - Save chat history
   - Multiple document versions
   - Collaborative editing
   - Template library
   - More export formats (Word, PowerPoint)

3. **General**
   - Offline mode support
   - Real-time collaboration
   - Mobile responsive improvements
   - Accessibility enhancements
   - Internationalization (i18n)

## Troubleshooting

### Roadmaps not loading
- Check if API Gateway is running on port 8090
- Verify projects exist in database
- Check browser console for errors

### Playground generation fails
- Ensure ML service is running on port 8001
- Check ML service logs for errors
- Verify project data is complete

### PDF upload fails
- Check file size (max 10MB)
- Ensure file is valid PDF
- Verify ML service is accessible

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │  Roadmaps        │              │  Playground      │    │
│  │  Component       │              │  Component       │    │
│  └────────┬─────────┘              └────────┬─────────┘    │
│           │                                  │               │
│           └──────────┬───────────────────────┘               │
│                      │                                       │
│           ┌──────────▼─────────┐                            │
│           │  ProjectService    │                            │
│           └──────────┬─────────┘                            │
│                      │                                       │
│           ┌──────────▼──────────────┐                       │
│           │ GestionProjetsService   │                       │
│           └──────────┬──────────────┘                       │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       │ HTTP
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                    Backend (Port 8090)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Gateway                              │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │         Gestionprojets Service                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Project    │  │ Task       │  │ Document   │     │   │
│  │  │ Controller │  │ Controller │  │ Controller │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                        │   │
│  │  ┌────────────────────────────────────────────┐      │   │
│  │  │         ML Client Service                  │      │   │
│  │  └──────────────────┬─────────────────────────┘      │   │
│  └─────────────────────┼────────────────────────────────┘   │
└────────────────────────┼──────────────────────────────────────┘
                         │ HTTP
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                ML Service (Port 8001)                          │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              FastAPI Application                      │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │    │
│  │  │ Document   │  │ Roadmap    │  │ Playground │     │    │
│  │  │ Generation │  │ Generation │  │ Chat       │     │    │
│  │  └────────────┘  └────────────┘  └────────────┘     │    │
│  │                                                        │    │
│  │  ┌────────────────────────────────────────────┐      │    │
│  │  │         ML Models & AI Services            │      │    │
│  │  └────────────────────────────────────────────┘      │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

## Conclusion

The roadmaps and playground features are now fully integrated into the frontend with proper backend connectivity. Users can:

1. **Generate AI-powered roadmaps** for their projects with phase-based planning
2. **Use the playground** to create business documents (BMC, SWOT, Budget, Pitch)
3. **Get AI feedback** on their ideas and documents
4. **Analyze uploaded documents** for insights and improvements

All features are accessible through the main navigation and work seamlessly with the existing project management system.
