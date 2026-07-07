import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommunityComponent } from './community.component';

const routes: Routes = [
  {
    path: '',
    component: CommunityComponent,
    children: [
      {
        path: 'forum',
        loadChildren: () => import('./forum/forum.module').then(m => m.ForumModule)
      },
      {
        path: 'marketplace',
        loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
      },
      {
        path: 'reputation',
        loadChildren: () => import('./reputation/reputation.module').then(m => m.ReputationModule)
      },
      {
        path: 'network',
        loadChildren: () => import('./network/network.module').then(m => m.NetworkModule)
      },
      {
        path: 'messaging',
        loadChildren: () => import('./messaging/messaging.module').then(m => m.MessagingModule)
      },
      { path: '', redirectTo: 'forum', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityRoutingModule { }
