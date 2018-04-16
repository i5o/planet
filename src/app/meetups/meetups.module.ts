import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlanetFormsModule } from '../shared/planet-forms.module';
import { MeetupsComponent } from './meetups.component';
import { MeetupsAddComponent } from './add-meetups/meetups-add.component';
import { MeetupsViewComponent } from './view-meetups/meetups-view.component';
import { MeetupsInvitationComponent } from './invitation-meetups/meetups-invitation.component';

import { MeetupsRouterModule } from './meetups-router.module';
import { PlanetDialogsModule } from '../shared/dialogs/planet-dialogs.module';
import { MaterialModule } from '../shared/material.module';
import { MeetupService } from './meetups.service';
import { MeetupsInvitationService } from './invitation-meetups/meetups-invitation.service';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    MeetupsRouterModule, ReactiveFormsModule, PlanetFormsModule, CommonModule, FormsModule, PlanetDialogsModule, MaterialModule,
     MatDialogModule
  ],
  declarations: [
    MeetupsComponent, MeetupsAddComponent, MeetupsViewComponent, MeetupsInvitationComponent
  ],
  providers: [ MeetupService, MeetupsInvitationService ],
  entryComponents: [
    MeetupsInvitationComponent
  ]
})
export class MeetupsModule {}
