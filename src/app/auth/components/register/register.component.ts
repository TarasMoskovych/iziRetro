import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private loading = new Subject<boolean>();

  form: UntypedFormGroup;
  loading$ = this.loading.asObservable();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  onSubmit(): void {
    this.loading.next(true);

    this.authService.register(this.form.value)
      .pipe(take(1))
      .subscribe(
        () => this.router.navigate(['login'], { queryParamsHandling: 'preserve' }),
        () => this.loading.next(false),
      );
  }

  private buildForm(): void {
    this.form = new UntypedFormGroup({
      displayName: new UntypedFormControl(null, [Validators.required]),
      email: new UntypedFormControl(null, [Validators.required, Validators.email]),
      password: new UntypedFormControl(null, [Validators.required, Validators.minLength(6)])
    });
  }

}
