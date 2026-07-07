import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpportunityListComponent } from './components/opportunity-list/opportunity-list.component';
import { OpportunityCreateComponent } from './components/opportunity-create/opportunity-create.component';
import { CandidateDashboardComponent } from './components/candidate-dashboard/candidate-dashboard.component';
import { PublisherDashboardComponent } from './components/publisher-dashboard/publisher-dashboard.component';
import { ApplicationsViewerComponent } from './components/applications-viewer/applications-viewer.component';
import { ManageOpportunitiesComponent } from './components/manage-opportunities/manage-opportunities.component';
import { OpportunityApplicationsComponent } from './components/opportunity-applications/opportunity-applications.component';
import { QuizComponent } from './components/quiz/quiz.component';

const routes: Routes = [
  { path: '', component: OpportunityListComponent },
  { path: 'create', component: OpportunityCreateComponent },
  { path: 'my-applications', component: CandidateDashboardComponent },
  { path: 'manage', component: ManageOpportunitiesComponent },
  { path: ':opportunityId/edit', component: OpportunityCreateComponent },
  { path: 'quiz/:quizId', component: QuizComponent },
  { path: ':opportunityId/applications', component: OpportunityApplicationsComponent },
  { path: 'my-offers', component: PublisherDashboardComponent },
  { path: 'my-offers/:id/applications', component: ApplicationsViewerComponent },
  { path: ':opportunityId/recommendations', component: ApplicationsViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceRoutingModule { }