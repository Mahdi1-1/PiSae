import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ForumRoutingModule } from './forum-routing.module';

import { PostListComponent } from './components/post-list/post-list.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { PostCreateComponent } from './components/post-create/post-create.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { GroupListComponent } from './components/group-list/group-list.component';

@NgModule({
  declarations: [
    PostListComponent,
    PostCardComponent,
    PostCreateComponent,
    PostDetailComponent,
    GroupListComponent
  ],
  imports: [
    SharedModule,
    ForumRoutingModule
  ]
})
export class ForumModule { }