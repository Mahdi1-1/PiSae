import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormationAvisComponent } from './components/formation-avis/formation-avis.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';
import { FormationProgressionDetailComponent } from './components/formation-progression-detail/formation-progression-detail.component';
import { MesFormationsComponent } from './components/mes-formations/mes-formations.component';

const routes: Routes = [
  { path: '', component: MesFormationsComponent },
  {
    path: ':formationId',
    component: FormationDetailComponent,
    children: [
      { path: '', redirectTo: 'progression', pathMatch: 'full' },
      { path: 'progression', component: FormationProgressionDetailComponent },
      { path: 'avis', component: FormationAvisComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuiviRoutingModule {}
