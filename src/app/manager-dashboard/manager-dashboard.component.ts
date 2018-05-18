import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { CouchService } from '../shared/couchdb.service';

@Component({
  template: `
    <div *ngIf="displayDashboard">
      <span *ngIf="planetType !== 'community'">
        <a routerLink="/requests" i18n mat-raised-button>Requests</a>
        <a routerLink="/associated/{{ planetType === 'center' ? 'nation' : 'community' }}"
          i18n mat-raised-button>{{ planetType === 'center' ? 'Nation' : 'Community' }}</a>
      </span>
      <a routerLink="/feedback" i18n mat-raised-button>Feedback</a>
    </div>
    <div class="view-container" *ngIf="displayDashboard && planetType !== 'center'">
      <h3 i18n>{{ planetType === 'community' ? 'Nation' : 'Center' }} List</h3><br />
      <b i18n>{{ planetType === 'community' ? 'Nation' : 'Center' }} Version:</b> {{parentConfig?.version}}
      <b i18n>Local Version:</b> {{userService.get()?.version}}<br />
      <a routerLink="resources" i18n mat-raised-button>List Resources</a>
      <a routerLink="courses" i18n mat-raised-button>List Courses</a>
      <a routerLink="meetups" i18n mat-raised-button>List Meetups</a>
    </div>
    <div>{{message}}</div>
  `
})

export class ManagerDashboardComponent implements OnInit {
  isUserAdmin = false;
  displayDashboard = true;
  message = '';
  planetType = this.userService.getConfig().planetType;
  parentConfig: any;

  constructor(
    private userService: UserService,
    private couchService: CouchService
  ) {}

  ngOnInit() {
    this.isUserAdmin = this.userService.get().isUserAdmin;
    if (!this.isUserAdmin) {
      // A non-admin user cannot receive all user docs
      this.displayDashboard = false;
      this.message = 'Access restricted to admins';
    } else if (this.userService.getConfig().planetType !== 'center') {
      this.couchService.allDocs('configurations', { domain: this.userService.getConfig().parentDomain })
      .subscribe(config => {
        this.parentConfig = config;
      });
    }
  }

}
