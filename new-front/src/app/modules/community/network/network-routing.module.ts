import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectionListComponent } from './components/connection-list/connection-list.component';
import { PendingRequestsComponent } from './components/pending-requests/pending-requests.component';
import { UserDiscoveryComponent } from './components/user-discovery/user-discovery.component';

const routes: Routes = [
  { path: '', component: ConnectionListComponent },
  { path: 'discover', component: UserDiscoveryComponent },
  { path: 'pending', component: PendingRequestsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NetworkRoutingModule { }