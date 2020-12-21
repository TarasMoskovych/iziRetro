import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
export class LoginComponent implements OnInit {
  private loading = new Subject<boolean>();

  form: FormGroup;
  loading$ = this.loading.asObservable();

  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
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
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    });
  }
}
