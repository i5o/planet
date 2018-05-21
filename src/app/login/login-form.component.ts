import { Component } from '@angular/core';
import { CouchService } from '../shared/couchdb.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/user.service';
import { switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from '../validators/custom-validators';
import { PlanetMessageService } from '../shared/planet-message.service';
import { environment } from '../../environments/environment';
import { ValidatorService } from '../validators/validator.service';
import { AuthService } from '../shared/services';

const registerForm = {
  name: [],
  password: [ '', Validators.compose([
    Validators.required,
    CustomValidators.matchPassword('repeatPassword', false)
    ]) ],
  repeatPassword: [ '', Validators.compose([
    Validators.required,
    CustomValidators.matchPassword('password', true)
    ]) ]
};

const loginForm = {
  name: [ '', Validators.required ],
  password: [ '', Validators.required ]
};

@Component({
  templateUrl: './login-form.component.html',
  styleUrls: [ './login.scss' ]
})
export class LoginFormComponent {
  public userForm: FormGroup;
  constructor(
    private couchService: CouchService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private planetMessageService: PlanetMessageService,
    private validatorService: ValidatorService,
    private authService: AuthService
  ) {
    registerForm.name = [ '', [ Validators.required, Validators.pattern(/^[a-z0-9_.-]+$/i) ],
      ac => this.validatorService.isUnique$('_users', 'name', ac, {}) ];
    const formObj = this.createMode ? registerForm : loginForm;
    this.userForm = this.formBuilder.group(formObj);
  }

  createMode: boolean = this.router.url.split('?')[0] === '/login/newuser';
  returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  onSubmit() {
    if (this.userForm.valid) {
      if (this.createMode) {
        this.createUser(this.userForm.value);
      } else {
        this.login(this.userForm.value, false);
      }
    } else {
      Object.keys(this.userForm.controls).forEach(fieldName => {
        this.userForm.controls[fieldName].markAsTouched();
      });
    }
  }

  welcomeNotification(userId) {
    const data = {
      user: userId,
      message: 'Welcome ' + userId.replace('org.couchdb.user:', '') + ' to the Planet Learning',
      link: '',
      type: 'register',
      priority: 1,
      status: 'unread',
      time: Date.now()
    };
    this.couchService.post('notifications', data)
      .subscribe();
  }

  reRoute() {
    return this.router.navigate([ this.returnUrl ]);
  }

  createUser({ name, password }: { name: string; password: string }) {
    const opts = {
      roles: [],
      type: 'user',
      isUserAdmin: false,
      joinDate: Date.now()
    };

    this.authService
      .signupUser(name, password, opts)
      .pipe(
        switchMap(() => {
          return this.couchService.put('shelf/org.couchdb.user:' + name, {});
        })
      )
      .subscribe(
        (response: any) => {
          this.planetMessageService.showMessage(
            'User created: ' + response.id.replace('org.couchdb.user:', '')
          );
          this.welcomeNotification(response.id);
          this.login(this.userForm.value, true);
        },
        error =>
          this.planetMessageService.showAlert(
            'An error occurred please try again'
          )
      );
  }

  login(
    { name, password }: { name: string; password: string },
    isCreate: boolean
  ) {
    this.authService
      .login(name, password)
      .pipe(
        switchMap(data => {
          // Navigate into app
          if (isCreate) {
            return fromPromise(this.router.navigate([ 'users/update/' + name ]));
          } else {
            return fromPromise(this.reRoute());
          }
        }),
        switchMap(routeSuccess => {
          // Post new session info to login_activity
          const obsArr = [ this.userService.newSessionLog() ];
          // If not in e2e test, also add session to parent domain
          if (
            !environment.test &&
            this.userService.getConfig().name === name.toLowerCase()
          ) {
            obsArr.push(
              this.couchService.post(
                '_session',
                { name: name.toLowerCase(), password: password },
                {
                  withCredentials: true,
                  domain: this.userService.getConfig().parentDomain
                }
              )
            );
          }
          return forkJoin(obsArr);
        })
      )
      .subscribe(
        res => {},
        error =>
          this.planetMessageService.showAlert(
            'Username and/or password do not match'
          )
      );
  }
}
