import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  private loading = new Subject<boolean>();

  form: UntypedFormGroup;
  loading$ = this.loading.asObservable();

  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.authService.userData = {};
  }

  onSignInWithGoogle(): void {
    this.authService.signIn()
      .pipe(take(1))
      .subscribe();
  }

  onSubmit(): void {
    this.loading.next(true);

    this.authService.login(this.form.value)
      .pipe(take(1))
      .subscribe(
        () => this.authService.navigateToDashboard(),
        () => this.loading.next(false),
      );
  }

  private buildForm(): void {
    const { email, password } = this.authService.userData || {};

    this.form = new UntypedFormGroup({
      email: new UntypedFormControl(email, [Validators.required, Validators.email]),
      password: new UntypedFormControl(password, [Validators.required, Validators.minLength(6)])
    });
  }
}
