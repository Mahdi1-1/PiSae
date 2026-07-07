import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReputationCardComponent } from './components/reputation-card/reputation-card.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

const routes: Routes = [
  { path: '', component: ReputationCardComponent },
  { path: 'leaderboard', component: LeaderboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReputationRoutingModule { }