import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MessagingRoutingModule } from './messaging-routing.module';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { ConversationListComponent } from './components/conversation-list/conversation-list.component';

@NgModule({
  declarations: [
    ChatWindowComponent,
    ConversationListComponent
  ],
  imports: [SharedModule, MessagingRoutingModule]
})
export class MessagingModule { }