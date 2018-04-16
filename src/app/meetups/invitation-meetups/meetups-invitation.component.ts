import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { CouchService } from '../../shared/couchdb.service';
import { UserService } from '../../shared/user.service';
import { filterSpecificFields } from '../../shared/table-helpers';
import { map } from 'rxjs/operators';

@Component({
  templateUrl: './meetups-invitation.component.html'
})
export class MeetupsInvitationComponent implements AfterViewInit {

  public title: string;
  public fields: any;
  public modalForm: any;
  public show = false;
  invitation: FormGroup;
  displayedColumns = [ '_id', 'name' ];
  users: any = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private markFormAsTouched (formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormAsTouched(control);
      }
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.users.filter = filterValue;
  }

  constructor(
    public dialogRef: MatDialogRef<MeetupsInvitationComponent>,
    private fb: FormBuilder,
    private couchService: CouchService,
    private userService: UserService
    ) {
    this.createFormGroup();
    this.getAlluser().
    subscribe(user => {
      this.users = new MatTableDataSource(user);
    });
    this.users.filterPredicate = filterSpecificFields([ 'name' ]);
  }

  ngAfterViewInit() {
    this.users.paginator = this.paginator;
  }

  getAlluser() {
    return this.couchService.allDocs('_users').pipe(map((data: any) => {
      return data.map((res: any) => {
        return res;
      }).filter((user: any) => {
        return user._id !== this.userService.get()._id;
      });
    }));
  }

  onSubmit(mForm, dialogRef ) {
    if (mForm.valid) {
      dialogRef.close(mForm.value);
    } else {
      this.markFormAsTouched(mForm);
    }
  }

  onChange($event) {
    if ($event === 'Member') {
      this.show = true;
    } else {
      this.show = false;
    }
  }

  createFormGroup() {
    this.invitation = this.fb.group({
      invitemember: '',
      myselectedMember: this.fb.array([]),
    });
  }

  onMemberSelected(myselectedMember: string, isChecked: boolean) {
    const myMemberSelectedArray = <FormArray>this.invitation.controls.myselectedMember;
    if (isChecked) {
      myMemberSelectedArray.push(new FormControl(myselectedMember));
    } else {
      myMemberSelectedArray.removeAt(myMemberSelectedArray.controls.findIndex(x => x.value === myselectedMember));
    }
  }

}
