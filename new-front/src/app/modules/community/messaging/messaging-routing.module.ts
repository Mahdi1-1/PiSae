import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversationListComponent } from './components/conversation-list/conversation-list.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';

const routes: Routes = [
  { path: '', component: ConversationListComponent },
  { path: 'group/:groupId', component: ChatWindowComponent },
  { path: 'private/:userId', component: ChatWindowComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagingRoutingModule { }