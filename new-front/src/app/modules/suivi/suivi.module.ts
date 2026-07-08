import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { FormationAvisComponent } from './components/formation-avis/formation-avis.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';
import { FormationNiveauComponent } from './components/formation-niveau/formation-niveau.component';
import { FormationProgressionCardComponent } from './components/formation-progression-card/formation-progression-card.component';
import { FormationProgressionDetailComponent } from './components/formation-progression-detail/formation-progression-detail.component';
import { MesFormationsComponent } from './components/mes-formations/mes-formations.component';
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { SuiviRoutingModule } from './suivi-routing.module';

@NgModule({
  declarations: [
    MesFormationsComponent,
    FormationProgressionCardComponent,
    FormationDetailComponent,
    FormationProgressionDetailComponent,
    FormationAvisComponent,
    FormationNiveauComponent,
    StarRatingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgIconComponent,
    ...HlmProgressImports,
    ...HlmBadgeImports,
    SuiviRoutingModule,
  ],
})
export class SuiviModule {}
