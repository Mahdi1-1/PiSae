import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NetworkRoutingModule } from './network-routing.module';
import { ConnectionListComponent } from './components/connection-list/connection-list.component';
import { PendingRequestsComponent } from './components/pending-requests/pending-requests.component';
import { UserDiscoveryComponent } from './components/user-discovery/user-discovery.component';
import { MemberCardComponent } from './components/member-card/member-card.component';

@NgModule({
  declarations: [
    ConnectionListComponent,
    PendingRequestsComponent,
    UserDiscoveryComponent,
    MemberCardComponent
  ],
  imports: [SharedModule, NetworkRoutingModule]
})
export class NetworkModule { }