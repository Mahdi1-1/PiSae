import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MarketplaceRoutingModule } from './marketplace-routing.module';

import { OpportunityListComponent } from './components/opportunity-list/opportunity-list.component';
import { OpportunityCardComponent } from './components/opportunity-card/opportunity-card.component';
import { OpportunityCreateComponent } from './components/opportunity-create/opportunity-create.component';
import { CandidateDashboardComponent } from './components/candidate-dashboard/candidate-dashboard.component';
import { PublisherDashboardComponent } from './components/publisher-dashboard/publisher-dashboard.component';
import { ApplyDialogComponent } from './components/apply-dialog/apply-dialog.component';
import { ApplicationsViewerComponent } from './components/applications-viewer/applications-viewer.component';
import { ManageOpportunitiesComponent } from './components/manage-opportunities/manage-opportunities.component';
import { OpportunityApplicationsComponent } from './components/opportunity-applications/opportunity-applications.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { OpportunityDetailDialogComponent } from './components/opportunity-detail-dialog/opportunity-detail-dialog.component';

@NgModule({
  declarations: [
    OpportunityListComponent,
    OpportunityCardComponent,
    OpportunityCreateComponent,
    CandidateDashboardComponent,
    PublisherDashboardComponent,
    ApplyDialogComponent,
    ApplicationsViewerComponent,
    ManageOpportunitiesComponent,
    OpportunityApplicationsComponent,
    QuizComponent,
    OpportunityDetailDialogComponent
  ],
  imports: [SharedModule, MarketplaceRoutingModule]
})
export class MarketplaceModule { }