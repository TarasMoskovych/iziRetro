import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  form: FormGroup;
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

    this.form = new FormGroup({
      email: new FormControl(email, [Validators.required, Validators.email]),
      password: new FormControl(password, [Validators.required, Validators.minLength(6)])
    });
  }
}
