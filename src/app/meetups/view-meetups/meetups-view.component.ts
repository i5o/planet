import { Component, OnInit, OnDestroy } from '@angular/core';
import { CouchService } from '../../shared/couchdb.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { MeetupService } from '../meetups.service';
import { Subject } from 'rxjs/Subject';
import { UserService } from '../../shared/user.service';
import { findDocuments } from '../../shared/mangoQueries';

@Component({
  templateUrl: './meetups-view.component.html',
  styles: [ `
  .view-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-areas: "detail view";
  }
  .mem-enrolled {
    grid-area: view;
    * {
      max-width: 100%;
      max-height: 60vh;
      overflow: auto;
    }
  }
  .meetup-details {
    grid-area: detail;
    padding: 1rem;
  }
  ` ]
})

export class MeetupsViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  meetupDetail: any = {};
  members = [];
  parent = this.route.snapshot.data.parent;
  constructor(
    private couchService: CouchService,
    private route: ActivatedRoute,
    // meetupService made public because of error Property is private and only accessible within class during prod build
    public meetupService: MeetupService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.getEnrolledUsers();
    this.route.paramMap
      .debug('Getting meetup id from parameters')
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params: ParamMap) => {
        const meetupId = params.get('id');
        const getOpts: any = { meetupIds: [ meetupId ] };
        if (this.parent) {
          getOpts.opts = { domain: this.userService.getConfig().parentDomain };
        }
        this.meetupService.updateMeetups(getOpts);
      }, error => console.log(error), () => console.log('complete getting meetup id'));
    this.meetupService.meetupUpdated$.pipe(takeUntil(this.onDestroy$))
      .subscribe((meetupArray) => {
        this.meetupDetail = meetupArray[0];
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getEnrolledUsers() {
    // find meetupId on User shelf
    return this.couchService.post('shelf/_find', findDocuments({
      'meetupIds': { '$in': [ this.route.snapshot.paramMap.get('id') ] }
    }, 0)). subscribe((data) => {
      this.members = data.docs.map((res) => {
        return res._id.split(':')[1];
      });
    });
  }

}
